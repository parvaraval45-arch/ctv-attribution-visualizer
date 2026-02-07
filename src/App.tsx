import { useState, useRef } from 'react';
import { getCampaigns } from './data/generateSyntheticData.js';
import SankeyDiagram from './components/SankeyDiagram.jsx';
import TimeDistribution from './components/TimeDistribution.jsx';
import ComparisonView from './components/ComparisonView.jsx';
import MetricsPanel from './components/MetricsPanel.jsx';
import AttributionToggle from './components/AttributionToggle.jsx';
import KeyInsights from './components/KeyInsights.jsx';
import DataQualityBadge from './components/DataQualityBadge.jsx';
import GuideModal from './components/GuideModal.jsx';
import ExportToolbar from './components/ExportToolbar.jsx';
import DataSourceFootnote from './components/DataSourceFootnote.jsx';
import {
  Tv,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  GitBranch,
  Linkedin,
  Mail,
} from 'lucide-react';
import { formatLargeNumber } from './utils/calculations.js';

const campaigns = getCampaigns();

const TABS = [
  { id: 'flow', label: 'Path Flow' },
  { id: 'timing', label: 'Timing Analysis' },
  { id: 'comparison', label: 'Exposed vs Control' },
] as const;

type TabId = (typeof TABS)[number]['id'];

function getInitialState() {
  const params = new URLSearchParams(window.location.search);
  const campaignIdx = Number(params.get('campaign'));
  const mode = params.get('mode');
  const tab = params.get('tab');
  return {
    campaign: campaignIdx >= 0 && campaignIdx < campaigns.length ? campaignIdx : 0,
    mode: (mode === 'household' || mode === 'individual' ? mode : 'household') as 'household' | 'individual',
    tab: (['flow', 'timing', 'comparison'].includes(tab || '') ? tab : 'flow') as TabId,
  };
}

function App() {
  const initial = getInitialState();
  const [selectedCampaign, setSelectedCampaign] = useState(initial.campaign);
  const [attributionMode, setAttributionMode] = useState<'household' | 'individual'>(initial.mode);
  const [activeTab, setActiveTab] = useState<TabId>(initial.tab);
  const [helpOpen, setHelpOpen] = useState(false);
  // For mobile: use dropdown instead of tabs
  const [mobileTabOpen, setMobileTabOpen] = useState(false);

  // Ref to the Sankey plot for PNG/PDF export
  const sankeyRef = useRef<any>(null);

  const currentCampaign = campaigns[selectedCampaign];

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* ── Header ── */}
      <header className="bg-gray-900 border-b border-gray-800 shadow-lg shadow-black/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
            {/* Branding */}
            <div className="flex items-center gap-3 shrink-0">
              <Tv className="w-8 h-8 text-blue-400" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold leading-tight">
                  CTV Attribution Path Visualizer
                </h1>
                <p className="text-sm text-gray-400 hidden sm:block">
                  Understanding Cross-Device Conversion Journeys
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-4 md:ml-auto">
              <GuideModal />
              {/* Campaign selector */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                  Campaign
                </span>
                <select
                  value={selectedCampaign}
                  onChange={(e) => setSelectedCampaign(Number(e.target.value))}
                  className="bg-gray-800 text-white rounded px-3 py-1.5 text-sm border border-gray-700 focus:border-blue-500 focus:outline-none"
                >
                  {campaigns.map((c: any, i: number) => (
                    <option key={c.id} value={i}>
                      {c.name} ({formatLargeNumber(c.exposedGroup.conversions)} conv)
                    </option>
                  ))}
                </select>
              </div>

              {/* Attribution toggle */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                  Attribution
                </span>
                <AttributionToggle
                  currentMode={attributionMode}
                  onModeChange={setAttributionMode}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Tab Navigation ── */}
      <nav className="bg-gray-900/60 border-b border-gray-800 sticky top-0 z-30 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Desktop tabs */}
          <div className="hidden sm:flex items-center gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-white'
                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-3">
              <ExportToolbar
                campaignData={currentCampaign}
                attributionMode={attributionMode}
                activeTab={activeTab}
                campaignIndex={selectedCampaign}
                sankeyRef={sankeyRef}
              />
              <DataQualityBadge campaignData={currentCampaign} attributionMode={attributionMode} />
            </div>
          </div>

          {/* Mobile dropdown */}
          <div className="sm:hidden py-2 space-y-2">
            <button
              onClick={() => setMobileTabOpen((v) => !v)}
              className="flex items-center justify-between w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 text-sm"
            >
              <span>{TABS.find((t) => t.id === activeTab)?.label}</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${mobileTabOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {mobileTabOpen && (
              <div className="mt-1 bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setMobileTabOpen(false);
                    }}
                    className={`block w-full text-left px-3 py-2 text-sm ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}
            <ExportToolbar
              campaignData={currentCampaign}
              attributionMode={attributionMode}
              activeTab={activeTab}
              campaignIndex={selectedCampaign}
              sankeyRef={sankeyRef}
            />
          </div>
        </div>
      </nav>

      {/* ── Main Content ── */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          {/* Path Flow Tab */}
          {activeTab === 'flow' && (
            <div className="animate-fade-in">
              <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">
                {/* Sankey */}
                <div className="bg-gray-900 rounded-lg p-4 min-w-0">
                  <h2 className="text-lg font-semibold mb-2">
                    {currentCampaign.name}
                  </h2>
                  <SankeyDiagram
                    ref={sankeyRef}
                    campaignData={currentCampaign}
                    attributionMode={attributionMode}
                  />
                </div>

                {/* Metrics sidebar */}
                <div className="space-y-6">
                  <div className="bg-gray-900 rounded-lg p-4">
                    <MetricsPanel
                      campaignData={currentCampaign}
                      attributionMode={attributionMode}
                    />
                  </div>
                  <div className="bg-gray-900 rounded-lg p-4">
                    <KeyInsights
                      campaignData={currentCampaign}
                      attributionMode={attributionMode}
                    />
                  </div>
                </div>
              </div>
              <DataSourceFootnote />
            </div>
          )}

          {/* Timing Tab */}
          {activeTab === 'timing' && (
            <div className="animate-fade-in">
              <div className="bg-gray-900 rounded-lg p-4">
                <h2 className="text-lg font-semibold mb-3">Time to Conversion</h2>
                <TimeDistribution
                  timeToConversionData={currentCampaign.timeToConversion}
                  totalConversions={currentCampaign.exposedGroup.conversions}
                />
              </div>
              <DataSourceFootnote />
            </div>
          )}

          {/* Comparison Tab */}
          {activeTab === 'comparison' && (
            <div className="animate-fade-in">
              <div className="bg-gray-900 rounded-lg p-4">
                <ComparisonView campaignData={currentCampaign} />
              </div>
              <DataSourceFootnote />
            </div>
          )}

          {/* ── Help Section ── */}
          <div className="bg-gray-900/60 rounded-lg border border-gray-800">
            <button
              onClick={() => setHelpOpen((v) => !v)}
              className="flex items-center justify-between w-full px-4 py-3 text-sm text-gray-400 hover:text-gray-200 transition-colors"
            >
              <span className="font-medium">How to Use This Tool</span>
              {helpOpen ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            {helpOpen && (
              <div className="px-4 pb-4 space-y-2 text-sm text-gray-400 border-t border-gray-800 pt-3">
                <p>1. Select a campaign from the dropdown to view its attribution data.</p>
                <p>2. Explore attribution paths in the Sankey diagram — hover over flows for detail.</p>
                <p>3. Switch between household and individual attribution to see confidence changes.</p>
                <p>4. Use the confidence slider to filter out low-confidence paths.</p>
                <p>5. Compare exposed vs control groups to quantify CTV's incremental impact.</p>
                <p>6. Analyze conversion timing patterns to understand consideration windows.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 border-t border-gray-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
            <p>
              Built by{' '}
              <span className="text-gray-300 font-medium">Rock Raval</span> for
              The Trade Desk PM Internship Application (Measurement Team)
            </p>

            <div className="flex items-center gap-4">
              <a
                href="https://github.com/rockraval"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
              >
                <GitBranch className="w-3.5 h-3.5" />
                GitHub
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
              <a
                href="https://linkedin.com/in/rockraval"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
              >
                <Linkedin className="w-3.5 h-3.5" />
                LinkedIn
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
              <a
                href="mailto:rock@example.com"
                className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                Email
              </a>
            </div>
          </div>
          <p className="text-center text-[10px] text-gray-600 mt-3">
            Using synthetic data for demonstration purposes
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
