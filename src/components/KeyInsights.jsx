import { useMemo } from "react";
import { Target, Clock, TrendingUp, ShieldCheck, DollarSign } from "lucide-react";
import { formatLargeNumber, formatPercentage, getConfidenceLevel } from "../utils/calculations.js";

const AVG_CONVERSION_VALUE = 74.50;

const CAMPAIGN_CONTEXT = {
  "camp-ecom-spring": {
    text: "Typical for e-commerce: Short consideration period (hours to days), mobile-first audience, high conversion rate. Expected behavior.",
    color: "border-blue-500/30 bg-blue-500/5",
  },
  "camp-auto-launch": {
    text: "Typical for automotive: Extended consideration period (weeks), desktop research phase, lower but high-value conversions. Expected behavior.",
    color: "border-purple-500/30 bg-purple-500/5",
  },
  "camp-cpg-awareness": {
    text: "Typical for CPG: Impulse purchases, very short consideration, balanced device usage. Note: In-store conversions may not be fully captured.",
    color: "border-teal-500/30 bg-teal-500/5",
  },
};

export default function KeyInsights({ campaignData, attributionMode }) {
  const insights = useMemo(() => {
    const { nodes, links, exposedGroup, controlGroup, lift, timeToConversion } =
      campaignData;

    const totalConv = exposedGroup.conversions;

    // Primary conversion device
    const convNodes = nodes.filter((n) => n.id.endsWith("_conv"));
    const topDevice = convNodes.reduce((best, n) =>
      n.value > best.value ? n : best,
    );
    const topDevicePct = totalConv ? (topDevice.value / totalConv) * 100 : 0;
    const deviceName = topDevice.label.replace(" Conversions", "");

    // 24-hour conversions
    const within24h =
      (timeToConversion["< 1 hour"]?.count ?? 0) +
      (timeToConversion["1-6 hours"]?.count ?? 0) +
      (timeToConversion["6-24 hours"]?.count ?? 0);
    const within24hPct = totalConv ? (within24h / totalConv) * 100 : 0;

    // Lift
    const liftPct = lift.relative;
    const significant = lift.pValue < 0.05;

    // Confidence
    const mult = attributionMode === "household" ? 1.15 : 0.85;
    const avgConf =
      links.reduce((s, l) => s + Math.min(l.confidence * mult, 1), 0) /
      (links.length || 1);
    const confLevel = getConfidenceLevel(avgConf);

    // Incremental revenue
    const incrementalConv = exposedGroup.conversions - controlGroup.conversions;
    const incrementalRev = incrementalConv * AVG_CONVERSION_VALUE;

    return [
      {
        icon: Target,
        color: "#4A90E2",
        text: `${deviceName} is the primary conversion device (${topDevicePct.toFixed(0)}% of conversions)`,
      },
      {
        icon: Clock,
        color: "#4ECDC4",
        text: `Most users convert within 24 hours (${within24hPct.toFixed(0)}% of conversions)`,
      },
      {
        icon: TrendingUp,
        color: "#50C878",
        text: `CTV delivers ${liftPct.toFixed(0)}% lift vs control group${significant ? " (statistically significant)" : ""}`,
      },
      {
        icon: ShieldCheck,
        color: avgConf > 0.85 ? "#50C878" : avgConf >= 0.7 ? "#FFB84D" : "#FF6B6B",
        text: `${(avgConf * 100).toFixed(0)}% attribution confidence — ${confLevel} quality`,
      },
      {
        icon: DollarSign,
        color: "#50C878",
        text: `Estimated incremental revenue: $${incrementalRev >= 1000 ? `${(incrementalRev / 1000).toFixed(0)}K` : incrementalRev.toFixed(0)}`,
      },
    ];
  }, [campaignData, attributionMode]);

  const ctx = CAMPAIGN_CONTEXT[campaignData.id];

  return (
    <div className="space-y-3">
      {/* Dynamic insights */}
      <div className="bg-gray-800/40 rounded-lg border border-gray-700/40 p-4">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Key Insights
        </h3>
        <div className="space-y-2.5">
          {insights.map((insight, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <insight.icon
                className="w-4 h-4 mt-0.5 shrink-0"
                style={{ color: insight.color }}
              />
              <span className="text-sm text-gray-300 leading-snug">
                {insight.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Campaign context */}
      {ctx && (
        <div className={`rounded-lg border p-3 ${ctx.color}`}>
          <span className="text-[11px] text-gray-400 leading-relaxed">
            {ctx.text}
          </span>
        </div>
      )}
    </div>
  );
}
