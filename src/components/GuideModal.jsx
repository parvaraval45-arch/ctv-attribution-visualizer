import { useState } from "react";
import { HelpCircle, X, ArrowRight } from "lucide-react";

const SECTIONS = [
  {
    title: "What is a Sankey Diagram?",
    content:
      "A Sankey diagram visualizes flows between stages. The width of each band is proportional to its volume. In this tool, flows move from CTV Impressions through Device Crossover, Site Visits, and finally Conversions. Wider bands mean more users at that stage.",
  },
  {
    title: "How to Read the Flows",
    content:
      "Follow the colored bands left to right. The first stage (blue) is CTV ad impressions. These split into device crossover channels — mobile, desktop, and TV browser. Each channel then flows to site visits and conversions. The 'No Detection' band represents impressions where device matching failed.",
  },
  {
    title: "Understanding Confidence Scores",
    content:
      "Each flow has a confidence score (0-100%) representing how certain we are that the match is accurate. High confidence (>85%, green) means strong matching signals. Medium (70-85%, orange) is acceptable. Low (<70%, red) should be interpreted with caution. Use the slider to filter out low-confidence paths.",
  },
  {
    title: "Household vs Individual Attribution",
    content:
      "Household mode credits the entire household for a conversion, producing higher confidence scores but less precise targeting. Individual mode attempts to credit specific device users, resulting in lower confidence but more granular attribution. Toggle between modes to see the trade-off.",
  },
  {
    title: "Exposed vs Control (Ghost Bidding)",
    content:
      "The Trade Desk uses ghost bidding to create control groups — bidding on ad slots but not serving ads. By comparing exposed users (saw ads) to control users (didn't see ads), we isolate CTV's true incremental impact. A statistically significant lift (p < 0.05) means the difference is real.",
  },
  {
    title: "Tips for Effective Analysis",
    content:
      "Start with the Path Flow tab for an overview. Adjust the confidence threshold to focus on reliable paths. Switch to Timing Analysis to understand consideration windows. Use Exposed vs Control to quantify ROI. Export metrics for stakeholder reporting.",
  },
];

export default function GuideModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700 hover:text-white transition-colors"
        aria-label="Open guide"
      >
        <HelpCircle className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Guide</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Modal */}
          <div className="relative bg-gray-900 border border-gray-700 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <h2 className="text-lg font-semibold">
                What Am I Looking At?
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-4 overflow-y-auto max-h-[calc(80vh-120px)] space-y-5">
              {SECTIONS.map((section, i) => (
                <div key={i}>
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-blue-300 mb-1.5">
                    <ArrowRight className="w-3.5 h-3.5" />
                    {section.title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed pl-5.5">
                    {section.content}
                  </p>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-gray-800 flex justify-end">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-1.5 rounded text-sm bg-blue-600 text-white hover:bg-blue-500 transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
