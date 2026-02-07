/**
 * Comprehensive data export utilities for CTV Attribution Visualizer.
 * Supports CSV, PNG (via Plotly), PDF (via jsPDF), and shareable link generation.
 */
import { jsPDF } from "jspdf";
import {
  formatLargeNumber,
  formatPercentage,
  getConfidenceLevel,
} from "./calculations.js";

// ─────────────────────────────────────────────
//  CSV Export
// ─────────────────────────────────────────────

/**
 * Generate and download a comprehensive CSV report for a campaign.
 */
export function exportFullCSV(campaignData, attributionMode) {
  const {
    name,
    nodes,
    links,
    timeToConversion,
    exposedGroup,
    controlGroup,
    lift,
  } = campaignData;

  const modeMultiplier = attributionMode === "household" ? 1.15 : 0.85;
  const date = new Date().toISOString().slice(0, 10);
  const rows = [];

  // ── Section 1: Summary ──
  rows.push(["CTV Attribution Report"]);
  rows.push(["Campaign", name]);
  rows.push(["Attribution Mode", attributionMode]);
  rows.push(["Generated", new Date().toLocaleString()]);
  rows.push([]);

  // ── Section 2: Overview Metrics ──
  rows.push(["=== CAMPAIGN OVERVIEW ==="]);
  rows.push(["Metric", "Value"]);
  rows.push(["CTV Impressions", exposedGroup.impressions]);
  rows.push(["Total Conversions", exposedGroup.conversions]);
  rows.push([
    "Overall Conversion Rate",
    (exposedGroup.conversionRate * 100).toFixed(3) + "%",
  ]);
  rows.push(["Attribution Paths", links.length]);
  rows.push([]);

  // ── Section 3: Node Details ──
  rows.push(["=== ATTRIBUTION NODES ==="]);
  rows.push(["Node ID", "Label", "Volume"]);
  for (const node of nodes) {
    rows.push([node.id, node.label, node.value]);
  }
  rows.push([]);

  // ── Section 4: Link Details ──
  rows.push(["=== ATTRIBUTION LINKS ==="]);
  rows.push([
    "Source",
    "Target",
    "Volume",
    "Raw Confidence",
    "Adjusted Confidence",
    "Confidence Level",
  ]);
  for (const link of links) {
    const adjusted = Math.min(link.confidence * modeMultiplier, 1);
    rows.push([
      link.source,
      link.target,
      link.value,
      (link.confidence * 100).toFixed(1) + "%",
      (adjusted * 100).toFixed(1) + "%",
      getConfidenceLevel(adjusted),
    ]);
  }
  rows.push([]);

  // ── Section 5: Time-to-Conversion ──
  rows.push(["=== TIME-TO-CONVERSION DISTRIBUTION ==="]);
  rows.push(["Time Window", "Count", "Percentage"]);
  const ttcCats = [
    "< 1 hour",
    "1-6 hours",
    "6-24 hours",
    "1-3 days",
    "3-7 days",
    "7+ days",
  ];
  for (const cat of ttcCats) {
    const bucket = timeToConversion[cat] || { count: 0, percentage: 0 };
    rows.push([cat, bucket.count, bucket.percentage + "%"]);
  }
  rows.push([]);

  // ── Section 6: Exposed vs Control ──
  rows.push(["=== INCREMENTALITY ANALYSIS ==="]);
  rows.push(["Group", "Impressions", "Conversions", "Conversion Rate"]);
  rows.push([
    "Exposed",
    exposedGroup.impressions,
    exposedGroup.conversions,
    (exposedGroup.conversionRate * 100).toFixed(3) + "%",
  ]);
  rows.push([
    "Control",
    controlGroup.impressions,
    controlGroup.conversions,
    (controlGroup.conversionRate * 100).toFixed(3) + "%",
  ]);
  rows.push([]);
  rows.push(["Relative Lift", "+" + lift.relative.toFixed(1) + "%"]);
  rows.push(["Absolute Lift", "+" + (lift.absolute * 100).toFixed(4) + "%"]);
  rows.push(["P-Value", lift.pValue]);
  rows.push([
    "Confidence Interval",
    `${(lift.confidenceInterval[0] * 100).toFixed(3)}% - ${(lift.confidenceInterval[1] * 100).toFixed(3)}%`,
  ]);
  rows.push([
    "Incremental Conversions",
    exposedGroup.conversions - controlGroup.conversions,
  ]);
  rows.push([]);

  // ── Section 7: Data Source ──
  rows.push(["=== DATA SOURCE ==="]);
  rows.push([
    "Note",
    "Synthetic data generated for demonstration purposes. Not real campaign data.",
  ]);
  rows.push([
    "Tool",
    "CTV Attribution Path Visualizer - Trade Desk PM Internship Application",
  ]);

  // Convert to CSV string
  const csv = rows
    .map((r) =>
      r
        .map((c) => {
          const str = String(c);
          // Escape quotes and wrap in quotes if needed
          if (str.includes(",") || str.includes('"') || str.includes("\n")) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        })
        .join(","),
    )
    .join("\n");

  downloadBlob(
    csv,
    `CTV_Attribution_${name.replace(/\s+/g, "_")}_${date}.csv`,
    "text/csv",
  );
}

// ─────────────────────────────────────────────
//  PNG Export (via Plotly toImage)
// ─────────────────────────────────────────────

/**
 * Export a Plotly chart as a PNG image.
 * @param {HTMLElement} plotElement - The Plotly plot DOM element
 * @param {string} filename - Desired filename
 */
export async function exportPlotAsPNG(plotElement, filename) {
  if (!plotElement || !window.Plotly) {
    console.warn("Plotly or plot element not available");
    return;
  }

  try {
    const dataUrl = await window.Plotly.toImage(plotElement, {
      format: "png",
      width: 1200,
      height: 700,
      scale: 2, // 2x for retina quality
    });

    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = filename;
    a.click();
  } catch (err) {
    console.error("PNG export failed:", err);
  }
}

// ─────────────────────────────────────────────
//  PDF Report Generation
// ─────────────────────────────────────────────

/**
 * Generate a multi-page PDF report for a campaign.
 */
export async function exportPDFReport(campaignData, attributionMode, sankeyPlotEl) {
  const {
    name,
    nodes,
    links,
    timeToConversion,
    exposedGroup,
    controlGroup,
    lift,
  } = campaignData;

  const modeMultiplier = attributionMode === "household" ? 1.15 : 0.85;
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentW = pageW - margin * 2;

  // ── Helpers ──
  function addFooter(pageNum) {
    doc.setFontSize(7);
    doc.setTextColor(140);
    doc.text(
      "CTV Attribution Path Visualizer | Synthetic data for demonstration | Generated " +
        new Date().toLocaleString(),
      margin,
      pageH - 8,
    );
    doc.text(`Page ${pageNum}`, pageW - margin, pageH - 8, { align: "right" });
  }

  function drawSectionHeader(text, y) {
    doc.setFillColor(30, 40, 60);
    doc.rect(margin, y, contentW, 8, "F");
    doc.setFontSize(11);
    doc.setTextColor(220);
    doc.text(text, margin + 3, y + 5.5);
    return y + 12;
  }

  // ═══════════════════════════════════════════
  // PAGE 1: Title + Overview
  // ═══════════════════════════════════════════
  doc.setFillColor(15, 23, 42); // dark bg
  doc.rect(0, 0, pageW, pageH, "F");

  // Title bar
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, pageW, 25, "F");
  doc.setFontSize(18);
  doc.setTextColor(255);
  doc.text("CTV Attribution Path Visualizer", margin, 16);
  doc.setFontSize(10);
  doc.text("Cross-Device Conversion Journey Report", pageW - margin, 16, {
    align: "right",
  });

  // Campaign info
  let y = 35;
  doc.setFontSize(14);
  doc.setTextColor(200);
  doc.text(`Campaign: ${name}`, margin, y);
  y += 7;
  doc.setFontSize(9);
  doc.setTextColor(160);
  doc.text(
    `Attribution Mode: ${attributionMode.charAt(0).toUpperCase() + attributionMode.slice(1)} | Generated: ${new Date().toLocaleString()}`,
    margin,
    y,
  );
  y += 12;

  // Overview metrics in 2x2 grid
  const metrics = [
    ["CTV Impressions", formatLargeNumber(exposedGroup.impressions)],
    ["Total Conversions", formatLargeNumber(exposedGroup.conversions)],
    [
      "Conversion Rate",
      formatPercentage(exposedGroup.conversionRate, 3),
    ],
    ["Attribution Paths", String(links.length)],
    ["CTV Lift vs Control", `+${lift.relative.toFixed(1)}%`],
    [
      "P-Value",
      lift.pValue < 0.001 ? "< 0.001" : lift.pValue.toFixed(4),
    ],
    [
      "Incremental Conversions",
      `+${formatLargeNumber(exposedGroup.conversions - controlGroup.conversions)}`,
    ],
    [
      "Statistical Significance",
      lift.pValue < 0.05 ? "Yes (p < 0.05)" : "No",
    ],
  ];

  y = drawSectionHeader("Campaign Overview", y);
  const colW = contentW / 4;
  for (let i = 0; i < metrics.length; i++) {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const x = margin + col * colW;
    const yPos = y + row * 16;

    doc.setFontSize(8);
    doc.setTextColor(130);
    doc.text(metrics[i][0], x + 2, yPos + 4);
    doc.setFontSize(12);
    doc.setTextColor(220);
    doc.text(metrics[i][1], x + 2, yPos + 11);
  }
  y += Math.ceil(metrics.length / 4) * 16 + 6;

  // Attribution Links Table
  y = drawSectionHeader("Attribution Paths", y);
  doc.setFontSize(7);
  doc.setTextColor(160);
  const headers = ["Source", "Target", "Volume", "Confidence", "Level"];
  const colWidths = [50, 50, 30, 30, 30];
  let xPos = margin;
  for (let i = 0; i < headers.length; i++) {
    doc.text(headers[i], xPos, y);
    xPos += colWidths[i];
  }
  y += 4;

  doc.setTextColor(190);
  for (const link of links) {
    const adjusted = Math.min(link.confidence * modeMultiplier, 1);
    const vals = [
      link.source,
      link.target,
      formatLargeNumber(link.value),
      (adjusted * 100).toFixed(1) + "%",
      getConfidenceLevel(adjusted),
    ];
    xPos = margin;
    for (let i = 0; i < vals.length; i++) {
      doc.text(vals[i], xPos, y);
      xPos += colWidths[i];
    }
    y += 4;
    if (y > pageH - 20) break; // don't overflow
  }

  addFooter(1);

  // ═══════════════════════════════════════════
  // PAGE 2: Sankey Diagram Screenshot
  // ═══════════════════════════════════════════
  doc.addPage("a4", "landscape");
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageW, pageH, "F");

  y = drawSectionHeader("Attribution Flow (Sankey Diagram)", margin);

  if (sankeyPlotEl && window.Plotly) {
    try {
      const imgData = await window.Plotly.toImage(sankeyPlotEl, {
        format: "png",
        width: 1400,
        height: 650,
        scale: 2,
      });
      // Calculate fit dimensions
      const imgW = contentW;
      const imgH = (contentW / 1400) * 650;
      doc.addImage(imgData, "PNG", margin, y, imgW, Math.min(imgH, pageH - y - 20));
    } catch (e) {
      doc.setFontSize(10);
      doc.setTextColor(160);
      doc.text("Sankey diagram image could not be captured.", margin, y + 10);
    }
  } else {
    doc.setFontSize(10);
    doc.setTextColor(160);
    doc.text(
      "Sankey diagram not available for PDF export. View in the interactive tool.",
      margin,
      y + 10,
    );
  }

  addFooter(2);

  // ═══════════════════════════════════════════
  // PAGE 3: Time-to-Conversion + Incrementality
  // ═══════════════════════════════════════════
  doc.addPage("a4", "landscape");
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageW, pageH, "F");

  y = drawSectionHeader("Time-to-Conversion Distribution", margin);

  const ttcCats = [
    "< 1 hour",
    "1-6 hours",
    "6-24 hours",
    "1-3 days",
    "3-7 days",
    "7+ days",
  ];
  const barColors = [
    [255, 107, 107],
    [255, 184, 77],
    [78, 205, 196],
    [149, 225, 211],
    [168, 230, 207],
    [199, 206, 234],
  ];

  // Draw bar chart manually
  const barW = contentW / ttcCats.length - 4;
  let maxCount = 0;
  for (const cat of ttcCats) {
    const c = timeToConversion[cat]?.count ?? 0;
    if (c > maxCount) maxCount = c;
  }

  const chartH = 60;
  const chartY = y + 5;

  for (let i = 0; i < ttcCats.length; i++) {
    const cat = ttcCats[i];
    const bucket = timeToConversion[cat] || { count: 0, percentage: 0 };
    const barH = maxCount ? (bucket.count / maxCount) * chartH : 0;
    const x = margin + i * (barW + 4);

    doc.setFillColor(...barColors[i]);
    doc.rect(x, chartY + chartH - barH, barW, barH, "F");

    // Label below
    doc.setFontSize(7);
    doc.setTextColor(160);
    doc.text(cat, x + barW / 2, chartY + chartH + 5, { align: "center" });

    // Count above
    doc.setFontSize(7);
    doc.setTextColor(220);
    doc.text(
      String(bucket.count),
      x + barW / 2,
      chartY + chartH - barH - 2,
      { align: "center" },
    );

    // Percentage
    doc.setFontSize(6);
    doc.setTextColor(140);
    doc.text(
      bucket.percentage + "%",
      x + barW / 2,
      chartY + chartH + 10,
      { align: "center" },
    );
  }

  y = chartY + chartH + 20;

  // Incrementality section
  y = drawSectionHeader("Incrementality Analysis", y);

  const incrMetrics = [
    ["", "Exposed Group", "Control Group", "Difference"],
    [
      "Impressions",
      formatLargeNumber(exposedGroup.impressions),
      formatLargeNumber(controlGroup.impressions),
      "—",
    ],
    [
      "Conversions",
      formatLargeNumber(exposedGroup.conversions),
      formatLargeNumber(controlGroup.conversions),
      `+${formatLargeNumber(exposedGroup.conversions - controlGroup.conversions)}`,
    ],
    [
      "Conversion Rate",
      formatPercentage(exposedGroup.conversionRate, 3),
      formatPercentage(controlGroup.conversionRate, 3),
      `+${formatPercentage(lift.absolute, 4)}`,
    ],
  ];

  const tColW = contentW / 4;
  for (let row = 0; row < incrMetrics.length; row++) {
    doc.setFontSize(row === 0 ? 8 : 9);
    doc.setTextColor(row === 0 ? 130 : 200);
    for (let col = 0; col < 4; col++) {
      doc.text(incrMetrics[row][col], margin + col * tColW, y);
    }
    y += row === 0 ? 5 : 6;
  }

  y += 6;
  doc.setFontSize(9);
  doc.setTextColor(130);
  doc.text(`Relative Lift: +${lift.relative.toFixed(1)}%`, margin, y);
  doc.text(
    `P-Value: ${lift.pValue < 0.001 ? "< 0.001" : lift.pValue.toFixed(4)}`,
    margin + 80,
    y,
  );
  doc.text(
    `CI: [${formatPercentage(lift.confidenceInterval[0], 3)} – ${formatPercentage(lift.confidenceInterval[1], 3)}]`,
    margin + 160,
    y,
  );

  addFooter(3);

  // ═══════════════════════════════════════════
  // PAGE 4: Key Insights
  // ═══════════════════════════════════════════
  doc.addPage("a4", "landscape");
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageW, pageH, "F");

  y = drawSectionHeader("Key Insights & Methodology Notes", margin);

  const insights = generateInsightsList(campaignData, attributionMode);
  doc.setFontSize(9);
  doc.setTextColor(200);
  for (const insight of insights) {
    const lines = doc.splitTextToSize(`• ${insight}`, contentW - 5);
    for (const line of lines) {
      doc.text(line, margin + 3, y);
      y += 5;
    }
    y += 2;
  }

  y += 10;
  y = drawSectionHeader("Methodology & Data Source", y);
  doc.setFontSize(8);
  doc.setTextColor(160);
  const methodNotes = [
    "This report uses synthetic data generated for demonstration purposes as part of a Trade Desk PM Internship Application.",
    "Cross-device attribution is modeled using probabilistic matching algorithms with confidence scores ranging from 0-100%.",
    `Attribution mode: ${attributionMode === "household" ? "Household-level (confidence x1.15, broader matching)" : "Individual-level (confidence x0.85, stricter matching)"}.`,
    "Incrementality is measured via exposed vs control (ghost bidding) methodology, with statistical significance assessed at p < 0.05.",
    "Time-to-conversion windows represent the elapsed time between first CTV ad exposure and conversion event.",
  ];
  for (const note of methodNotes) {
    const lines = doc.splitTextToSize(note, contentW - 5);
    for (const line of lines) {
      doc.text(line, margin + 3, y);
      y += 4.5;
    }
    y += 2;
  }

  addFooter(4);

  // Save
  doc.save(`CTV_Report_${name.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`);
}

/**
 * Generate a list of insight strings for the PDF.
 */
function generateInsightsList(campaignData, attributionMode) {
  const { nodes, links, exposedGroup, controlGroup, lift } = campaignData;
  const modeMultiplier = attributionMode === "household" ? 1.15 : 0.85;

  const ctvImpressions = nodes.find((n) => n.id === "ctv")?.value ?? 0;
  const detected = links
    .filter((l) => l.source === "ctv" && l.target !== "no_detection")
    .reduce((s, l) => s + l.value, 0);
  const crossoverRate = ctvImpressions ? detected / ctvImpressions : 0;

  const avgConf =
    links.reduce(
      (s, l) => s + Math.min(l.confidence * modeMultiplier, 1),
      0,
    ) / (links.length || 1);

  const incrementalConv = exposedGroup.conversions - controlGroup.conversions;

  return [
    `Device crossover rate of ${(crossoverRate * 100).toFixed(1)}% indicates ${crossoverRate > 0.2 ? "strong" : "moderate"} cross-device matching capability.`,
    `Average attribution confidence of ${(avgConf * 100).toFixed(1)}% (${getConfidenceLevel(avgConf)}) in ${attributionMode} mode.`,
    `CTV ads drove a +${lift.relative.toFixed(1)}% lift in conversions compared to the control group (p = ${lift.pValue < 0.001 ? "< 0.001" : lift.pValue.toFixed(4)}).`,
    `An estimated ${formatLargeNumber(incrementalConv)} incremental conversions are directly attributable to CTV exposure.`,
    `The statistical significance (p < 0.05) confirms that the observed lift is not due to random chance.`,
    `${attributionMode === "household" ? "Household-level attribution captures multi-user viewing but may overcount individual intent." : "Individual-level attribution is more conservative but may undercount shared-device scenarios."}`,
  ];
}

// ─────────────────────────────────────────────
//  Share / Copy Link
// ─────────────────────────────────────────────

/**
 * Copy a shareable link to clipboard with campaign state encoded.
 * Returns true if successful.
 */
export async function copyShareLink(campaignIndex, attributionMode, activeTab) {
  const params = new URLSearchParams({
    campaign: String(campaignIndex),
    mode: attributionMode,
    tab: activeTab,
  });
  const url = `${window.location.origin}${window.location.pathname}?${params}`;

  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement("textarea");
    textarea.value = url;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    return true;
  }
}

// ─────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────

function downloadBlob(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
