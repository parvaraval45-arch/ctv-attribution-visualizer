import { useMemo } from "react";
import { ShieldCheck } from "lucide-react";
import InfoTooltip from "./InfoTooltip.jsx";

function computeGrade(campaignData, attributionMode) {
  const { nodes, links, exposedGroup } = campaignData;

  const ctvImpressions = nodes.find((n) => n.id === "ctv")?.value ?? 0;

  // Crossover rate score (0-33)
  const detected = links
    .filter((l) => l.source === "ctv" && l.target !== "no_detection")
    .reduce((s, l) => s + l.value, 0);
  const crossoverRate = ctvImpressions ? detected / ctvImpressions : 0;
  const crossoverScore = Math.min(crossoverRate / 0.5, 1) * 33;

  // Avg confidence score (0-34)
  const mult = attributionMode === "household" ? 1.15 : 0.85;
  const avgConf =
    links.reduce((s, l) => s + Math.min(l.confidence * mult, 1), 0) /
    (links.length || 1);
  const confScore = Math.min(avgConf / 1, 1) * 34;

  // Sample size score (0-33)
  const sampleScore = Math.min(ctvImpressions / 2_000_000, 1) * 33;

  const total = crossoverScore + confScore + sampleScore;

  let grade, color;
  if (total >= 85) {
    grade = "A+";
    color = "#50C878";
  } else if (total >= 70) {
    grade = "A";
    color = "#50C878";
  } else if (total >= 55) {
    grade = "B";
    color = "#FFB84D";
  } else {
    grade = "C";
    color = "#FF6B6B";
  }

  return { grade, color, total, crossoverRate, avgConf, sampleSize: ctvImpressions };
}

export default function DataQualityBadge({ campaignData, attributionMode }) {
  const { grade, color, crossoverRate, avgConf, sampleSize } = useMemo(
    () => computeGrade(campaignData, attributionMode),
    [campaignData, attributionMode],
  );

  const explanation =
    `Data quality is based on three factors: ` +
    `Crossover Rate (${(crossoverRate * 100).toFixed(0)}%), ` +
    `Avg Confidence (${(avgConf * 100).toFixed(0)}%), ` +
    `and Sample Size (${(sampleSize / 1_000_000).toFixed(1)}M impressions). ` +
    `Grades: A+ (excellent), A (good), B (fair), C (limited).`;

  return (
    <div className="flex items-center gap-1.5">
      <ShieldCheck className="w-4 h-4" style={{ color }} />
      <span className="text-xs text-gray-400">Data Quality:</span>
      <span className="text-sm font-bold" style={{ color }}>
        {grade}
      </span>
      <InfoTooltip text={explanation} width={280} />
    </div>
  );
}
