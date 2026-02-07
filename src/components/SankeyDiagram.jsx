import { useMemo, useState, useCallback, useRef, useImperativeHandle, forwardRef } from "react";
import Plot from "react-plotly.js";
import { RotateCcw, Camera } from "lucide-react";
import { formatPercentage } from "../utils/calculations.js";
import { exportPlotAsPNG } from "../utils/exportData.js";
import InfoTooltip from "./InfoTooltip.jsx";

// Stage colours applied to nodes
const NODE_COLORS = {
  ctv: "#4A90E2",
  crossover: "#7B68EE",
  visit: "#9B59B6",
  conversion: "#50C878",
};

const CONFIDENCE_TIERS = [
  { label: "High Confidence (>85%)", color: "#50C878" },
  { label: "Medium Confidence (70-85%)", color: "#FFB84D" },
  { label: "Low Confidence (<70%)", color: "#FF6B6B" },
];

// Link colour by confidence tier
function linkColor(confidence) {
  if (confidence > 0.85) return "rgba(74, 144, 226, 0.4)";
  if (confidence >= 0.7) return "rgba(123, 104, 238, 0.3)";
  return "rgba(255, 107, 107, 0.2)";
}

// Map a node id to a stage colour
function nodeColor(id) {
  if (id === "ctv") return NODE_COLORS.ctv;
  if (id.endsWith("_conv")) return NODE_COLORS.conversion;
  if (id.endsWith("_visit")) return NODE_COLORS.visit;
  return NODE_COLORS.crossover;
}

// Adjust raw confidence for attribution mode
function adjustConfidence(raw, mode) {
  if (mode === "household") return Math.min(raw * 1.15, 1.0);
  if (mode === "individual") return raw * 0.85;
  return raw;
}

const SankeyDiagram = forwardRef(function SankeyDiagram({
  campaignData,
  attributionMode = "household",
  confidenceThreshold: externalThreshold,
  compact = false,
}, ref) {
  const plotRef = useRef(null);

  // Expose plotRef to parent for PNG/PDF export
  useImperativeHandle(ref, () => ({
    getPlotElement: () => plotRef.current?.el,
  }));
  // Use internal state when no external threshold is provided
  const hasExternalThreshold = externalThreshold !== undefined;
  const [internalThreshold, setInternalThreshold] = useState(0);

  const threshold = hasExternalThreshold ? externalThreshold : internalThreshold;
  const setThreshold = hasExternalThreshold ? undefined : setInternalThreshold;

  const handleSliderChange = useCallback(
    (e) => {
      if (setThreshold) setThreshold(Number(e.target.value));
    },
    [setThreshold],
  );

  const handleReset = useCallback(() => {
    if (setThreshold) setThreshold(0);
  }, [setThreshold]);

  const { plotData, plotLayout, filteredCount, totalCount } = useMemo(() => {
    const { nodes, links } = campaignData;

    // Build an id → index lookup from the nodes array
    const idToIndex = {};
    nodes.forEach((n, i) => {
      idToIndex[n.id] = i;
    });

    // Threshold expressed as a 0-1 decimal
    const thresholdDecimal = threshold / 100;

    // Filter and transform links
    const filtered = links.reduce(
      (acc, link) => {
        const adjusted = adjustConfidence(link.confidence, attributionMode);
        if (adjusted < thresholdDecimal) return acc;

        acc.source.push(idToIndex[link.source]);
        acc.target.push(idToIndex[link.target]);
        acc.value.push(link.value);
        acc.color.push(linkColor(adjusted));
        acc.customdata.push(Math.round(adjusted * 100));
        return acc;
      },
      { source: [], target: [], value: [], color: [], customdata: [] },
    );

    const plotData = [
      {
        type: "sankey",
        orientation: "h",
        node: {
          pad: 15,
          thickness: 20,
          line: { color: "white", width: 0.5 },
          label: nodes.map((n) => n.label),
          color: nodes.map((n) => nodeColor(n.id)),
        },
        link: {
          source: filtered.source,
          target: filtered.target,
          value: filtered.value,
          color: filtered.color,
          customdata: filtered.customdata,
          hovertemplate:
            "%{source.label} → %{target.label}<br>" +
            "Volume: %{value:,.0f}<br>" +
            "Confidence: %{customdata}%<extra></extra>",
        },
      },
    ];

    const plotLayout = {
      height: compact ? 300 : 600,
      margin: compact ? { l: 5, r: 5, t: 15, b: 5 } : { l: 10, r: 10, t: 30, b: 10 },
      font: { size: 12, family: "Inter, sans-serif", color: "#e2e8f0" },
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
    };

    return {
      plotData,
      plotLayout,
      filteredCount: filtered.source.length,
      totalCount: links.length,
    };
  }, [campaignData, attributionMode, threshold]);

  const handleExportPNG = useCallback(() => {
    const el = plotRef.current?.el;
    if (el) {
      const date = new Date().toISOString().slice(0, 10);
      exportPlotAsPNG(el, `CTV_Sankey_${campaignData.name.replace(/\s+/g, "_")}_${date}.png`);
    }
  }, [campaignData.name]);

  if (compact) {
    return (
      <Plot
        data={plotData}
        layout={plotLayout}
        useResizeHandler
        style={{ width: "100%" }}
        config={{ responsive: true, displayModeBar: false }}
      />
    );
  }

  return (
    <div className="relative">
      {/* Controls row: slider + reset + filter status */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <label className="text-sm text-gray-300 whitespace-nowrap flex items-center gap-1">
            Minimum Confidence:{" "}
            <span className="text-white font-medium">
              {formatPercentage(threshold / 100, 0)}
            </span>
            <InfoTooltip text="Percentage representing certainty that a conversion was truly influenced by the CTV ad. Based on cross-device matching accuracy, time-to-conversion proximity, and signal strength. Higher confidence = more reliable attribution." />
          </label>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={threshold}
            onChange={handleSliderChange}
            className="flex-1 h-1.5 appearance-none rounded-full bg-gray-700 accent-[#4A90E2] cursor-pointer
                       [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                       [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#4A90E2]
                       [&::-webkit-slider-thumb]:shadow-[0_0_0_3px_rgba(74,144,226,0.25)]
                       [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:border-0
                       [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#4A90E2]"
          />
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1 rounded text-xs bg-gray-800 text-gray-300
                       border border-gray-700 hover:bg-gray-700 hover:text-white transition-colors whitespace-nowrap"
          >
            <RotateCcw className="w-3 h-3" />
            Reset Filters
          </button>
        </div>

        <span className="text-xs text-gray-500">
          Showing{" "}
          <span className={filteredCount < totalCount ? "text-amber-400" : "text-gray-300"}>
            {filteredCount}
          </span>{" "}
          of {totalCount} attribution paths
        </span>
      </div>

      {/* Legend — top-right on desktop, below controls on mobile */}
      <div className="flex gap-4 mb-3 sm:absolute sm:top-0 sm:right-0 sm:mb-0 sm:flex-col sm:gap-1.5 sm:bg-gray-900/80 sm:backdrop-blur sm:rounded-lg sm:p-3 sm:z-10">
        {CONFIDENCE_TIERS.map((tier) => (
          <div key={tier.label} className="flex items-center gap-2">
            <span
              className="inline-block w-3 h-3 rounded-sm shrink-0"
              style={{ backgroundColor: tier.color }}
            />
            <span className="text-[11px] text-gray-400 whitespace-nowrap">{tier.label}</span>
          </div>
        ))}
      </div>

      {/* Sankey chart */}
      <Plot
        ref={plotRef}
        data={plotData}
        layout={plotLayout}
        useResizeHandler
        style={{ width: "100%" }}
        config={{ responsive: true, displayModeBar: false }}
      />

      {/* Screenshot button */}
      <div className="flex justify-end mt-2">
        <button
          onClick={handleExportPNG}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs bg-gray-800 text-gray-300
                     border border-gray-700 hover:bg-gray-700 hover:text-white transition-colors"
        >
          <Camera className="w-3.5 h-3.5" />
          Save as PNG
        </button>
      </div>
    </div>
  );
});

export default SankeyDiagram;
