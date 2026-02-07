// Ambient module declarations for .js/.jsx component imports used in .tsx files.
// These are needed because our components are written in JSX (not TSX).

declare module "./components/SankeyDiagram.jsx" {
  import type { ForwardRefExoticComponent, RefAttributes } from "react";
  const SankeyDiagram: ForwardRefExoticComponent<
    {
      campaignData: any;
      attributionMode?: "household" | "individual";
      confidenceThreshold?: number;
      compact?: boolean;
    } & RefAttributes<{ getPlotElement: () => HTMLElement | undefined }>
  >;
  export default SankeyDiagram;
}

declare module "./components/TimeDistribution.jsx" {
  const TimeDistribution: React.FC<{ timeToConversionData: any; totalConversions: number }>;
  export default TimeDistribution;
}

declare module "./components/ComparisonView.jsx" {
  const ComparisonView: React.FC<{ campaignData: any }>;
  export default ComparisonView;
}

declare module "./components/MetricsPanel.jsx" {
  const MetricsPanel: React.FC<{ campaignData: any; attributionMode: string }>;
  export default MetricsPanel;
}

declare module "./components/AttributionToggle.jsx" {
  const AttributionToggle: React.FC<{
    currentMode: "household" | "individual";
    onModeChange: (mode: "household" | "individual") => void;
  }>;
  export default AttributionToggle;
}

declare module "./components/KeyInsights.jsx" {
  const KeyInsights: React.FC<{ campaignData: any; attributionMode: string }>;
  export default KeyInsights;
}

declare module "./components/DataQualityBadge.jsx" {
  const DataQualityBadge: React.FC<{ campaignData: any; attributionMode: string }>;
  export default DataQualityBadge;
}

declare module "./components/GuideModal.jsx" {
  const GuideModal: React.FC;
  export default GuideModal;
}

declare module "./components/ExportToolbar.jsx" {
  const ExportToolbar: React.FC<{
    campaignData: any;
    attributionMode: string;
    activeTab: string;
    campaignIndex: number;
    sankeyRef: React.RefObject<any>;
  }>;
  export default ExportToolbar;
}

declare module "./components/DataSourceFootnote.jsx" {
  const DataSourceFootnote: React.FC;
  export default DataSourceFootnote;
}

declare module "./components/InfoTooltip.jsx" {
  const InfoTooltip: React.FC<{ text: string; width?: number }>;
  export default InfoTooltip;
}

declare module "./data/generateSyntheticData.js" {
  export function getCampaigns(): any[];
}

declare module "./utils/calculations.js" {
  export function formatLargeNumber(num: number): string;
  export function formatPercentage(decimal: number, decimals?: number): string;
  export function formatCurrency(value: number): string;
  export function calculateConversionRate(conversions: number, impressions: number): number;
  export function calculateLift(exposedRate: number, controlRate: number): number;
  export function timeToConversionLabel(hours: number): string;
  export function getConfidenceLevel(score: number): "High" | "Medium" | "Low";
  export function getConfidenceColor(score: number): string;
}

declare module "./utils/exportData.js" {
  export function exportFullCSV(campaignData: any, attributionMode: string): void;
  export function exportPlotAsPNG(plotElement: HTMLElement, filename: string): Promise<void>;
  export function exportPDFReport(campaignData: any, attributionMode: string, sankeyPlotEl?: HTMLElement | null): Promise<void>;
  export function copyShareLink(campaignIndex: number, attributionMode: string, activeTab: string): Promise<boolean>;
}
