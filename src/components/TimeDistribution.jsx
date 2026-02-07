import { useMemo, useState } from "react";
import Plot from "react-plotly.js";
import { Clock, TrendingUp, Target } from "lucide-react";
import { formatLargeNumber } from "../utils/calculations.js";

const CATEGORIES = [
  "< 1 hour",
  "1-6 hours",
  "6-24 hours",
  "1-3 days",
  "3-7 days",
  "7+ days",
];

const BAR_COLORS = {
  "< 1 hour": "#FF6B6B",
  "1-6 hours": "#FFB84D",
  "6-24 hours": "#4ECDC4",
  "1-3 days": "#95E1D3",
  "3-7 days": "#A8E6CF",
  "7+ days": "#C7CEEA",
};

// Midpoint hours used to estimate weighted percentiles
const MIDPOINT_HOURS = {
  "< 1 hour": 0.5,
  "1-6 hours": 3.5,
  "6-24 hours": 15,
  "1-3 days": 48,
  "3-7 days": 120,
  "7+ days": 240,
};

// Human-readable label for an hour value
function hoursToLabel(h) {
  if (h < 1) return "< 1 hour";
  if (h < 24) return `${Math.round(h)} hours`;
  const days = Math.round(h / 24);
  return `${days} day${days > 1 ? "s" : ""}`;
}

// Given sorted (midpoint, cumulativeFraction) pairs, find the midpoint at a target fraction
function weightedPercentile(entries, target) {
  let cumulative = 0;
  for (const { midpoint, fraction } of entries) {
    const prev = cumulative;
    cumulative += fraction;
    if (cumulative >= target) {
      // Linear interpolation within the bucket
      const bucketProgress =
        cumulative === prev ? 0 : (target - prev) / (cumulative - prev);
      return midpoint * (0.5 + 0.5 * bucketProgress);
    }
  }
  return entries[entries.length - 1].midpoint;
}

export default function TimeDistribution({
  timeToConversionData,
  totalConversions,
}) {
  const [viewMode, setViewMode] = useState("volume");

  const { counts, percentages, colors, peakCategory, peakPct, median, p75 } =
    useMemo(() => {
      const counts = [];
      const percentages = [];
      const colors = [];
      let peakCount = 0;
      let peakCategory = CATEGORIES[0];
      let peakPct = 0;

      const entries = [];

      for (const cat of CATEGORIES) {
        const bucket = timeToConversionData[cat] || { count: 0, percentage: 0 };
        counts.push(bucket.count);
        percentages.push(bucket.percentage);
        colors.push(BAR_COLORS[cat]);
        entries.push({
          midpoint: MIDPOINT_HOURS[cat],
          fraction: bucket.count / (totalConversions || 1),
        });
        if (bucket.count > peakCount) {
          peakCount = bucket.count;
          peakCategory = cat;
          peakPct = bucket.percentage;
        }
      }

      const median = weightedPercentile(entries, 0.5);
      const p75 = weightedPercentile(entries, 0.75);

      return { counts, percentages, colors, peakCategory, peakPct, median, p75 };
    }, [timeToConversionData, totalConversions]);

  const { plotData, plotLayout } = useMemo(() => {
    const isVolume = viewMode === "volume";
    const yValues = isVolume ? counts : percentages;

    const plotData = [
      {
        type: "bar",
        x: CATEGORIES,
        y: yValues,
        marker: {
          color: colors,
          line: { width: 1, color: "#333" },
        },
        text: isVolume
          ? counts.map((c) => formatLargeNumber(c))
          : percentages.map((p) => `${p}%`),
        textposition: "auto",
        textfont: { color: "#1a1a2e", size: 11, family: "Inter, sans-serif" },
        hovertemplate: isVolume
          ? "%{x}<br>Conversions: %{y:,.0f}<br>Percentage: %{text}<extra></extra>"
          : "%{x}<br>Percentage: %{y:.1f}%<extra></extra>",
      },
    ];

    const peakIndex = CATEGORIES.indexOf(peakCategory);

    const plotLayout = {
      height: 350,
      margin: { l: 50, r: 20, t: 40, b: 80 },
      font: { size: 12, family: "Inter, sans-serif", color: "#e2e8f0" },
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      xaxis: {
        title: { text: "Time Window", standoff: 15 },
        tickangle: -45,
        gridcolor: "rgba(255,255,255,0.05)",
      },
      yaxis: {
        title: { text: isVolume ? "Number of Conversions" : "% of Conversions" },
        gridcolor: "rgba(255,255,255,0.08)",
      },
      annotations: [
        {
          x: CATEGORIES[peakIndex],
          y: isVolume ? counts[peakIndex] : percentages[peakIndex],
          xref: "x",
          yref: "y",
          text: `Peak: ${peakPct}% convert here`,
          showarrow: true,
          arrowhead: 4,
          arrowsize: 0.8,
          arrowwidth: 1.5,
          arrowcolor: "#e2e8f0",
          ax: 40,
          ay: -35,
          font: { size: 11, color: "#e2e8f0" },
          bgcolor: "rgba(30,30,50,0.85)",
          borderpad: 4,
          bordercolor: "rgba(255,255,255,0.15)",
          borderwidth: 1,
        },
      ],
      bargap: 0.2,
    };

    return { plotData, plotLayout };
  }, [viewMode, counts, percentages, colors, peakCategory, peakPct]);

  const metrics = [
    { icon: Clock, label: "Median", value: hoursToLabel(median) },
    { icon: TrendingUp, label: "75th %ile", value: hoursToLabel(p75) },
    { icon: Target, label: "Peak", value: peakCategory },
  ];

  return (
    <div>
      {/* Metrics row + toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
        <div className="flex gap-3 flex-1">
          {metrics.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex items-center gap-2 bg-gray-800/60 rounded-lg px-3 py-2 border border-gray-700/50"
            >
              <Icon className="w-4 h-4 text-gray-400 shrink-0" />
              <div className="leading-tight">
                <div className="text-[10px] text-gray-500 uppercase tracking-wider">
                  {label}
                </div>
                <div className="text-sm font-medium text-white">{value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* View mode toggle */}
        <div className="flex rounded-lg overflow-hidden border border-gray-700 self-start sm:self-auto">
          <button
            onClick={() => setViewMode("volume")}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              viewMode === "volume"
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-400 hover:text-gray-200"
            }`}
          >
            Volume
          </button>
          <button
            onClick={() => setViewMode("percentage")}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              viewMode === "percentage"
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-400 hover:text-gray-200"
            }`}
          >
            Percentage
          </button>
        </div>
      </div>

      {/* Chart */}
      <Plot
        data={plotData}
        layout={plotLayout}
        useResizeHandler
        style={{ width: "100%" }}
        config={{ responsive: true, displayModeBar: false }}
      />
    </div>
  );
}
