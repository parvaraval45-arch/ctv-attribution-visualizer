import { AlertCircle } from "lucide-react";

export default function DataSourceFootnote() {
  return (
    <div className="flex items-start gap-2 mt-4 px-3 py-2.5 rounded-lg bg-gray-800/30 border border-gray-700/30">
      <AlertCircle className="w-3.5 h-3.5 text-gray-500 mt-0.5 shrink-0" />
      <p className="text-[11px] text-gray-500 leading-relaxed">
        <span className="text-gray-400 font-medium">Data Source:</span> This
        visualization uses synthetic data generated for demonstration purposes
        as part of a Trade Desk PM Internship Application (Measurement Team).
        Attribution confidence scores, conversion volumes, and incrementality
        metrics are modeled to reflect realistic CTV campaign patterns but do
        not represent actual campaign performance.
      </p>
    </div>
  );
}
