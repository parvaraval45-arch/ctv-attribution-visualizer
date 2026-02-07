import { useMemo, useState } from "react";
import { Eye, EyeOff, TrendingUp, DollarSign, BarChart3, ShieldCheck } from "lucide-react";
import SankeyDiagram from "./SankeyDiagram.jsx";
import InfoTooltip from "./InfoTooltip.jsx";
import { formatLargeNumber, formatPercentage } from "../utils/calculations.js";

const AVG_CONVERSION_VALUE = 74.50; // assumed average order value

// Derive a control-group Sankey dataset from the exposed campaign data.
// Scales every node value and link value by the ratio of control-to-exposed
// conversion rates, keeping the same funnel shape.
function buildControlData(campaignData) {
  const ratio =
    campaignData.controlGroup.conversionRate /
    campaignData.exposedGroup.conversionRate;

  return {
    ...campaignData,
    nodes: campaignData.nodes.map((n) => ({
      ...n,
      value: Math.round(n.value * ratio),
    })),
    links: campaignData.links.map((l) => ({
      ...l,
      value: Math.round(l.value * ratio),
      confidence: l.confidence * 0.6, // lower confidence for control (no treatment signal)
    })),
  };
}

function MetricRow({ label, value, subtext }) {
  return (
    <div className="flex justify-between items-baseline py-1.5 border-b border-gray-700/40 last:border-0">
      <span className="text-xs text-gray-400">{label}</span>
      <div className="text-right">
        <span className="text-sm font-medium text-white">{value}</span>
        {subtext && (
          <span className="text-[10px] text-gray-500 ml-1.5">{subtext}</span>
        )}
      </div>
    </div>
  );
}

// Tooltip removed — using shared InfoTooltip component instead

export default function ComparisonView({ campaignData }) {
  const [showComparison, setShowComparison] = useState(true);

  const controlData = useMemo(
    () => buildControlData(campaignData),
    [campaignData],
  );

  const { exposed, control, lift } = campaignData.exposedGroup
    ? {
        exposed: campaignData.exposedGroup,
        control: campaignData.controlGroup,
        lift: campaignData.lift,
      }
    : { exposed: {}, control: {}, lift: {} };

  const incrementalConversions = exposed.conversions - control.conversions;
  const incrementalRevenue = incrementalConversions * AVG_CONVERSION_VALUE;

  const ciLow = ((lift.confidenceInterval?.[0] ?? 0) / (control.conversionRate || 1)) * 100;
  const ciHigh = ((lift.confidenceInterval?.[1] ?? 0) / (control.conversionRate || 1)) * 100;

  return (
    <div>
      {/* Toggle */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Exposed vs Control Analysis</h2>
        <button
          onClick={() => setShowComparison((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700 hover:text-white transition-colors"
        >
          {showComparison ? (
            <>
              <EyeOff className="w-3.5 h-3.5" /> Hide Control
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5" /> Show Comparison
            </>
          )}
        </button>
      </div>

      <div
        className={`grid gap-4 transition-all duration-300 ${
          showComparison
            ? "grid-cols-1 lg:grid-cols-[1fr_auto_1fr]"
            : "grid-cols-1"
        }`}
      >
        {/* ── Exposed Group ── */}
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <h3 className="text-sm font-semibold text-blue-300">
              CTV Exposed Group
            </h3>
          </div>

          <SankeyDiagram
            campaignData={campaignData}
            attributionMode="household"
            confidenceThreshold={0}
            compact
          />

          <div className="mt-3 space-y-0">
            <MetricRow
              label="Impressions"
              value={formatLargeNumber(exposed.impressions)}
            />
            <MetricRow
              label="Conversions"
              value={formatLargeNumber(exposed.conversions)}
            />
            <MetricRow
              label="Conversion Rate"
              value={formatPercentage(exposed.conversionRate, 2)}
            />
          </div>
        </div>

        {/* ── Center lift panel ── */}
        {showComparison && (
          <div className="flex lg:flex-col items-center justify-center gap-4 lg:gap-3 py-4 lg:py-0 lg:px-2">
            {/* Lift badge */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">
                Relative Lift
              </span>
              <span className="text-4xl font-bold text-emerald-400 leading-none">
                +{lift.relative?.toFixed(1)}%
              </span>
            </div>

            {/* Divider with VS */}
            <div className="hidden lg:flex flex-col items-center gap-1">
              <div className="w-px h-6 bg-gray-700" />
              <span className="text-xs font-bold text-gray-500">VS</span>
              <div className="w-px h-6 bg-gray-700" />
            </div>
            <span className="lg:hidden text-xs font-bold text-gray-500">VS</span>

            {/* Stats */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">
                  p &lt; {lift.pValue < 0.001 ? "0.001" : lift.pValue}
                </span>
              </div>
              <span className="text-[10px] text-gray-500">
                CI [{ciLow.toFixed(0)}% – {ciHigh.toFixed(0)}%]
              </span>
              <div className="flex items-center gap-1 text-xs text-emerald-300">
                <TrendingUp className="w-3 h-3" />
                <span>+{formatLargeNumber(incrementalConversions)} conv</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-emerald-300">
                <DollarSign className="w-3 h-3" />
                <span>
                  +$
                  {incrementalRevenue >= 1000
                    ? `${(incrementalRevenue / 1000).toFixed(0)}K`
                    : incrementalRevenue.toFixed(0)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── Control Group ── */}
        {showComparison && (
          <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/30">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-gray-500" />
              <h3 className="text-sm font-semibold text-gray-400">
                Control Group
              </h3>
              <InfoTooltip text="The Trade Desk's methodology for creating control groups by bidding on impressions but not serving ads (ghost bidding). This isolates true incremental impact without using PSA ads or other workarounds." />
              <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-gray-700 text-gray-400 border border-gray-600">
                No CTV Treatment
              </span>
            </div>

            <div className="grayscale opacity-70">
              <SankeyDiagram
                campaignData={controlData}
                attributionMode="household"
                confidenceThreshold={0}
                compact
              />
            </div>

            <div className="mt-3 space-y-0">
              <MetricRow
                label="Impressions"
                value={formatLargeNumber(control.impressions)}
              />
              <MetricRow
                label="Conversions"
                value={formatLargeNumber(control.conversions)}
              />
              <MetricRow
                label="Conversion Rate"
                value={formatPercentage(control.conversionRate, 2)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
