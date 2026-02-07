import { useMemo } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  Target,
  Clock,
  Download,
  ShieldCheck,
  Monitor,
  Zap,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import {
  formatLargeNumber,
  formatPercentage,
  getConfidenceColor,
  getConfidenceLevel,
} from "../utils/calculations.js";
import InfoTooltip from "./InfoTooltip.jsx";

// Industry benchmarks for comparison
const INDUSTRY = {
  crossoverRate: 0.18,
  conversionRate: 0.0018,
  avgConfidence: 0.76,
};

const MIDPOINT_HOURS = {
  "< 1 hour": 0.5,
  "1-6 hours": 3.5,
  "6-24 hours": 15,
  "1-3 days": 48,
  "3-7 days": 120,
  "7+ days": 240,
};

function hoursToLabel(h) {
  if (h < 1) return "< 1 hour";
  if (h < 24) return `${Math.round(h)} hours`;
  const d = Math.round(h / 24);
  return `${d} day${d > 1 ? "s" : ""}`;
}

function weightedPercentile(entries, target) {
  let cum = 0;
  for (const { midpoint, fraction } of entries) {
    const prev = cum;
    cum += fraction;
    if (cum >= target) {
      const t = cum === prev ? 0 : (target - prev) / (cum - prev);
      return midpoint * (0.5 + 0.5 * t);
    }
  }
  return entries[entries.length - 1].midpoint;
}

// ---------- sub-components ----------

function ComparisonBadge({ value, industry, higherIsBetter = true }) {
  if (industry == null) return null;
  const diff = ((value - industry) / industry) * 100;
  const positive = higherIsBetter ? diff > 0 : diff < 0;
  const Icon = diff > 0 ? ArrowUp : ArrowDown;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[10px] font-medium ${
        positive ? "text-emerald-400" : "text-amber-400"
      }`}
    >
      <Icon className="w-2.5 h-2.5" />
      {Math.abs(diff).toFixed(0)}% vs avg
    </span>
  );
}

function MetricItem({ icon: Icon, label, value, color, comparison, sub, tooltip }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-700/30 last:border-0">
      <Icon
        className="w-4 h-4 mt-0.5 shrink-0"
        style={{ color: color || "#94a3b8" }}
      />
      <div className="flex-1 min-w-0">
        <div className="text-[11px] text-gray-500 leading-tight flex items-center gap-1">
          {label}
          {tooltip && <InfoTooltip text={tooltip} />}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-sm font-semibold"
            style={{ color: color || "#f1f5f9" }}
          >
            {value}
          </span>
          {comparison}
        </div>
        {sub && <div className="text-[10px] text-gray-600 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

function Card({ title, icon: Icon, children }) {
  return (
    <div className="bg-gray-800/40 rounded-lg border border-gray-700/40 shadow-lg shadow-black/20">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-700/40">
        <Icon className="w-4 h-4 text-gray-400" />
        <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
          {title}
        </h3>
      </div>
      <div className="px-4 py-1">{children}</div>
    </div>
  );
}

// ---------- main component ----------

export default function MetricsPanel({ campaignData, attributionMode }) {
  const metrics = useMemo(() => {
    const { nodes, links, exposedGroup, controlGroup, lift, timeToConversion } =
      campaignData;

    const ctvImpressions = nodes.find((n) => n.id === "ctv")?.value ?? 0;
    const totalConversions = exposedGroup.conversions;
    const overallCVR = exposedGroup.conversionRate;

    // Device crossover = all detected devices / impressions
    const detected = links
      .filter((l) => l.source === "ctv" && l.target !== "no_detection")
      .reduce((s, l) => s + l.value, 0);
    const crossoverRate = ctvImpressions ? detected / ctvImpressions : 0;

    // Confidence — adjusted for mode
    const modeMultiplier = attributionMode === "household" ? 1.15 : 0.85;
    const adjustedConfidences = links.map((l) =>
      Math.min(l.confidence * modeMultiplier, 1),
    );
    const avgConfidence =
      adjustedConfidences.reduce((a, b) => a + b, 0) /
      (adjustedConfidences.length || 1);
    const highConfCount = adjustedConfidences.filter((c) => c > 0.85).length;

    // Cross-device conversions (conv nodes other than tv_conv)
    const crossDeviceConv = nodes
      .filter(
        (n) => n.id.endsWith("_conv") && n.id !== "tv_conv",
      )
      .reduce((s, n) => s + n.value, 0);
    const crossDevicePct = totalConversions
      ? crossDeviceConv / totalConversions
      : 0;

    // Incrementality
    const incrementalConv = exposedGroup.conversions - controlGroup.conversions;
    const ciLow = lift.confidenceInterval[0];
    const ciHigh = lift.confidenceInterval[1];

    // Timing
    const cats = Object.keys(MIDPOINT_HOURS);
    const entries = cats.map((cat) => ({
      midpoint: MIDPOINT_HOURS[cat],
      fraction:
        (timeToConversion[cat]?.count ?? 0) / (totalConversions || 1),
    }));
    const median = weightedPercentile(entries, 0.5);
    const p75 = weightedPercentile(entries, 0.75);

    let peakCat = cats[0];
    let peakCount = 0;
    for (const cat of cats) {
      const c = timeToConversion[cat]?.count ?? 0;
      if (c > peakCount) {
        peakCount = c;
        peakCat = cat;
      }
    }

    // Fastest bucket with any conversions
    const fastestCat = cats.find(
      (cat) => (timeToConversion[cat]?.count ?? 0) > 0,
    );

    return {
      ctvImpressions,
      totalConversions,
      overallCVR,
      totalPaths: links.length,
      crossoverRate,
      avgConfidence,
      highConfCount,
      crossDevicePct,
      liftRelative: lift.relative,
      pValue: lift.pValue,
      incrementalConv,
      ciLow,
      ciHigh,
      controlRate: controlGroup.conversionRate,
      median,
      p75,
      peakCat,
      fastestCat: fastestCat || "< 1 hour",
    };
  }, [campaignData, attributionMode]);

  function exportCSV() {
    const rows = [
      ["Metric", "Value"],
      ["Campaign", campaignData.name],
      ["Attribution Mode", attributionMode],
      ["CTV Impressions", metrics.ctvImpressions],
      ["Total Conversions", metrics.totalConversions],
      ["Overall CVR", (metrics.overallCVR * 100).toFixed(3) + "%"],
      ["Attribution Paths", metrics.totalPaths],
      ["Device Crossover Rate", (metrics.crossoverRate * 100).toFixed(1) + "%"],
      [
        "Avg Attribution Confidence",
        (metrics.avgConfidence * 100).toFixed(1) + "%",
      ],
      ["High-Confidence Paths", metrics.highConfCount],
      [
        "Cross-Device Conversions",
        (metrics.crossDevicePct * 100).toFixed(1) + "%",
      ],
      ["CTV Lift vs Control", "+" + metrics.liftRelative.toFixed(1) + "%"],
      ["P-Value", metrics.pValue],
      ["Incremental Conversions", metrics.incrementalConv],
      [
        "Confidence Interval",
        `${(metrics.ciLow * 100).toFixed(2)}% - ${(metrics.ciHigh * 100).toFixed(2)}%`,
      ],
      ["Median Time-to-Conversion", hoursToLabel(metrics.median)],
      ["75th %ile", hoursToLabel(metrics.p75)],
      ["Peak Window", metrics.peakCat],
      ["Fastest Bucket", metrics.fastestCat],
    ];

    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `CTV_Metrics_${campaignData.name.replace(/\s+/g, "_")}_${date}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const confColor = getConfidenceColor(metrics.avgConfidence);
  const confLevel = getConfidenceLevel(metrics.avgConfidence);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Campaign Metrics</h2>
        <button
          onClick={exportCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700 hover:text-white transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          Export Metrics
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Section 1: Overview */}
        <Card title="Campaign Overview" icon={BarChart3}>
          <MetricItem
            icon={Monitor}
            label="Total CTV Impressions"
            value={formatLargeNumber(metrics.ctvImpressions)}
            color="#4A90E2"
          />
          <MetricItem
            icon={Target}
            label="Total Conversions"
            value={formatLargeNumber(metrics.totalConversions)}
            color="#50C878"
          />
          <MetricItem
            icon={TrendingUp}
            label="Overall Conversion Rate"
            value={formatPercentage(metrics.overallCVR, 2)}
            comparison={
              <ComparisonBadge
                value={metrics.overallCVR}
                industry={INDUSTRY.conversionRate}
              />
            }
            sub={`Industry avg: ${formatPercentage(INDUSTRY.conversionRate, 2)}`}
          />
          <MetricItem
            icon={Zap}
            label="Total Attribution Paths"
            value={metrics.totalPaths}
          />
        </Card>

        {/* Section 2: Attribution Performance */}
        <Card title="Attribution Performance" icon={Users}>
          <MetricItem
            icon={Monitor}
            label="Device Crossover Rate"
            tooltip="The process of matching CTV impressions (household-level) to individual user devices (mobile, desktop) using probabilistic algorithms and deterministic signals like login events. Accuracy varies by publisher and measurement methodology."
            value={formatPercentage(metrics.crossoverRate, 1)}
            comparison={
              <ComparisonBadge
                value={metrics.crossoverRate}
                industry={INDUSTRY.crossoverRate}
              />
            }
            sub={`Industry avg: ${formatPercentage(INDUSTRY.crossoverRate, 0)}`}
          />
          <MetricItem
            icon={ShieldCheck}
            label="Avg Attribution Confidence"
            tooltip="Percentage representing certainty that a conversion was truly influenced by the CTV ad. Based on cross-device matching accuracy, time-to-conversion proximity, and signal strength. Higher confidence = more reliable attribution."
            value={`${(metrics.avgConfidence * 100).toFixed(1)}% (${confLevel})`}
            color={confColor}
            comparison={
              <ComparisonBadge
                value={metrics.avgConfidence}
                industry={INDUSTRY.avgConfidence}
              />
            }
          />
          <MetricItem
            icon={Target}
            label="High-Confidence Paths"
            value={`${metrics.highConfCount} of ${metrics.totalPaths}`}
            color={metrics.highConfCount > metrics.totalPaths / 2 ? "#50C878" : "#FFB84D"}
          />
          <MetricItem
            icon={Users}
            label="Cross-Device Conversions"
            value={formatPercentage(metrics.crossDevicePct, 1)}
          />
        </Card>

        {/* Section 3: Incrementality */}
        <Card title="Incrementality" icon={TrendingUp}>
          <MetricItem
            icon={TrendingUp}
            label="CTV Lift vs Control"
            value={`+${metrics.liftRelative.toFixed(1)}%`}
            color="#50C878"
          />
          <MetricItem
            icon={ShieldCheck}
            label="Statistical Significance"
            tooltip="p-value < 0.05 means we're >95% confident the lift is real, not due to random chance. Lower p-values = higher confidence in results."
            value={
              metrics.pValue < 0.001
                ? "p < 0.001"
                : `p = ${metrics.pValue.toFixed(4)}`
            }
            color={metrics.pValue < 0.05 ? "#50C878" : "#FF6B6B"}
            sub={metrics.pValue < 0.05 ? "Statistically significant" : "Not significant"}
          />
          <MetricItem
            icon={Target}
            label="Incremental Conversions"
            value={`+${formatLargeNumber(metrics.incrementalConv)}`}
            color="#50C878"
          />
          <MetricItem
            icon={BarChart3}
            label="Confidence Interval"
            value={`${formatPercentage(metrics.ciLow, 2)} – ${formatPercentage(metrics.ciHigh, 2)}`}
            sub={`Control CVR: ${formatPercentage(metrics.controlRate, 3)}`}
          />
        </Card>

        {/* Section 4: Timing */}
        <Card title="Timing Insights" icon={Clock}>
          <MetricItem
            icon={Clock}
            label="Median Time-to-Conversion"
            value={hoursToLabel(metrics.median)}
          />
          <MetricItem
            icon={Target}
            label="75% Convert Within"
            value={hoursToLabel(metrics.p75)}
          />
          <MetricItem
            icon={Zap}
            label="Peak Conversion Window"
            value={metrics.peakCat}
            color="#4ECDC4"
          />
          <MetricItem
            icon={TrendingUp}
            label="Fastest Conversions"
            value={metrics.fastestCat}
            sub="Earliest bucket with conversions"
          />
        </Card>
      </div>
    </div>
  );
}
