import { useState, useCallback } from "react";
import {
  Download,
  FileText,
  Image,
  Link2,
  Check,
  Loader2,
} from "lucide-react";
import {
  exportFullCSV,
  exportPDFReport,
  exportPlotAsPNG,
  copyShareLink,
} from "../utils/exportData.js";

export default function ExportToolbar({
  campaignData,
  attributionMode,
  activeTab,
  campaignIndex,
  sankeyRef,
}) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const handleCSV = useCallback(() => {
    exportFullCSV(campaignData, attributionMode);
  }, [campaignData, attributionMode]);

  const handlePNG = useCallback(() => {
    const el = sankeyRef?.current?.getPlotElement?.();
    if (el) {
      const date = new Date().toISOString().slice(0, 10);
      exportPlotAsPNG(
        el,
        `CTV_Sankey_${campaignData.name.replace(/\s+/g, "_")}_${date}.png`,
      );
    }
  }, [campaignData.name, sankeyRef]);

  const handlePDF = useCallback(async () => {
    setPdfLoading(true);
    try {
      const el = sankeyRef?.current?.getPlotElement?.();
      await exportPDFReport(campaignData, attributionMode, el);
    } finally {
      setPdfLoading(false);
    }
  }, [campaignData, attributionMode, sankeyRef]);

  const handleCopyLink = useCallback(async () => {
    const ok = await copyShareLink(campaignIndex, attributionMode, activeTab);
    if (ok) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  }, [campaignIndex, attributionMode, activeTab]);

  const btnBase =
    "flex items-center gap-1.5 px-3 py-1.5 rounded text-xs border transition-colors whitespace-nowrap";
  const btnDefault =
    "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700 hover:text-white";
  const btnSuccess =
    "bg-emerald-900/40 text-emerald-300 border-emerald-700/50";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* CSV */}
      <button onClick={handleCSV} className={`${btnBase} ${btnDefault}`}>
        <Download className="w-3.5 h-3.5" />
        CSV
      </button>

      {/* PNG */}
      <button onClick={handlePNG} className={`${btnBase} ${btnDefault}`}>
        <Image className="w-3.5 h-3.5" />
        PNG
      </button>

      {/* PDF */}
      <button
        onClick={handlePDF}
        disabled={pdfLoading}
        className={`${btnBase} ${btnDefault} ${pdfLoading ? "opacity-60 cursor-wait" : ""}`}
      >
        {pdfLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <FileText className="w-3.5 h-3.5" />
        )}
        {pdfLoading ? "Generating..." : "PDF Report"}
      </button>

      {/* Copy Link */}
      <button
        onClick={handleCopyLink}
        className={`${btnBase} ${copiedLink ? btnSuccess : btnDefault}`}
      >
        {copiedLink ? (
          <Check className="w-3.5 h-3.5" />
        ) : (
          <Link2 className="w-3.5 h-3.5" />
        )}
        {copiedLink ? "Copied!" : "Copy Link"}
      </button>
    </div>
  );
}
