# CTV Attribution Path Visualizer

> Interactive tool for understanding cross-device conversion journeys in Connected TV advertising

[Live Demo](your-vercel-url) | [Video Walkthrough](youtube-link)

![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?logo=vite&logoColor=white)
![Plotly](https://img.shields.io/badge/Plotly.js-3.3-3F4F75?logo=plotly&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4.1-06B6D4?logo=tailwindcss&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)

---

## Problem Statement

Connected TV is The Trade Desk's fastest-growing channel, yet advertisers struggle with three key measurement challenges:

| Challenge | Description | Industry Pain Point |
|-----------|-------------|---------------------|
| **Attribution Opacity** | Only 50% of CTV impressions offer full transparency (DoubleVerify) | Advertisers can't see what's working |
| **Cross-Device Blindness** | Difficulty linking TV viewing (household-level) to mobile/desktop conversions (individual-level) | Broken conversion paths |
| **Incrementality Proof** | Inability to quantify CTV's true incremental impact beyond correlative metrics | Can't justify CTV spend to CFO |

This tool addresses all three challenges through interactive visualization and statistical analysis.

---

## Features

### Sankey Flow Visualization
Complete journey mapping from CTV impression through device crossover, site visit, and conversion. Confidence-based link coloring immediately surfaces where attribution uncertainty exists. Adjustable confidence threshold filters out low-quality paths in real time.

### Time-to-Conversion Analysis
Bar chart visualization with six time-window categories, weighted percentile calculations for median and 75th percentile, volume/percentage toggle, and peak annotation. Answers the critical question: *How long after CTV exposure do users convert?*

### Exposed vs Control Comparison
Side-by-side Sankey diagrams with a center lift panel showing relative lift, p-value, confidence intervals, incremental conversions, and incremental revenue. Built around The Trade Desk's ghost bidding methodology for true incrementality measurement.

### Attribution Mode Toggle
Switch between household-level attribution (confidence x1.15, broader matching) and individual-level attribution (confidence x0.85, stricter matching). Demonstrates the fundamental trade-off in CTV measurement and its impact on reported metrics.

### Confidence Quantification
Three-tier confidence scoring (High >85%, Medium 70-85%, Low <70%) with color-coded visual encoding across all views. Data quality grading (A+ through C) based on crossover rate, average confidence, and sample size.

### Comprehensive Data Export
- **CSV**: Full 7-section report with nodes, links, time-to-conversion, and incrementality data
- **PNG**: High-resolution (2x retina) Sankey diagram screenshot via Plotly
- **PDF**: 4-page landscape report with overview metrics, Sankey image, timing chart, and methodology notes
- **Shareable Link**: URL with encoded campaign state (campaign, mode, tab) with clipboard copy

### Educational Context
Interactive tooltips explaining device crossover, ghost bidding, attribution confidence, and statistical significance. Built-in guide modal and contextual help throughout the interface.

---

## Screenshots

> *Add 3-4 screenshots here showing the Sankey diagram, Comparison view, Timing analysis, and PDF export*

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **UI Framework** | React | 19.2 |
| **Build Tool** | Vite | 7.2 |
| **Language** | TypeScript | 5.9 |
| **Visualization** | Plotly.js + react-plotly.js | 3.3 / 2.6 |
| **Styling** | Tailwind CSS (v4 with Vite plugin) | 4.1 |
| **Icons** | lucide-react | 0.563 |
| **PDF Generation** | jsPDF | 4.1 |
| **Deployment** | Vercel | -- |

### Why This Stack?

- **Plotly over D3.js**: Built-in Sankey diagram support with native hover, zoom, and image export. D3 would require 3-5x more code for the same interactivity.
- **React 19**: Component reusability for shared patterns (InfoTooltip, MetricItem, Card), likely aligns with TTD's frontend stack.
- **Vite 7**: Sub-second HMR for rapid prototyping. No configuration overhead.
- **Tailwind v4**: Utility-first CSS with the new Vite plugin &mdash; zero config, no `tailwind.config.js` needed.
- **jsPDF over server-side PDF**: Client-side generation means zero backend dependencies and instant export.

---

## Installation

```bash
# Clone the repository
git clone https://github.com/rockraval/ctv-attribution-visualizer.git
cd ctv-attribution-visualizer

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Build for Production

```bash
npm run build
npm run preview    # Preview production build locally
```

---

## Project Structure

```
src/
  components/
    SankeyDiagram.jsx        # Core Sankey visualization with confidence filtering
    TimeDistribution.jsx      # Time-to-conversion bar chart
    ComparisonView.jsx        # Exposed vs Control side-by-side analysis
    MetricsPanel.jsx          # 4-card metrics grid with industry benchmarks
    AttributionToggle.jsx     # Household/Individual mode switch
    ExportToolbar.jsx         # CSV, PNG, PDF, Copy Link buttons
    KeyInsights.jsx           # Dynamic campaign-specific insights
    DataQualityBadge.jsx      # Composite quality grade (A+/A/B/C)
    GuideModal.jsx            # 6-section educational modal
    InfoTooltip.jsx           # Shared tooltip with auto-positioning
    DataSourceFootnote.jsx    # Synthetic data disclaimer
  data/
    generateSyntheticData.js  # 3 campaign datasets with full attribution data
  utils/
    calculations.js           # Formatting and calculation utilities
    exportData.js             # CSV, PNG, PDF, and link export functions
  App.tsx                     # Main app with tabbed layout and state management
  index.css                   # Tailwind v4 imports and custom animations
```

---

## Data Model

Uses synthetic data mimicking The Trade Desk's log-level attribution structure. Three campaign archetypes represent different advertiser verticals:

| Campaign | Impressions | Conversions | CVR | Lift | Conversion Pattern |
|----------|-------------|-------------|-----|------|--------------------|
| E-commerce Spring Sale | 1.5M | 4,650 | 0.31% | +100% | Fast (mobile-heavy) |
| Automotive New Model Launch | 2.2M | 3,300 | 0.15% | +66.7% | Slow (desktop-heavy) |
| CPG Brand Awareness | 800K | 1,200 | 0.15% | +100% | Impulse (balanced) |

Each campaign contains:

```javascript
{
  id: "camp-ecom-spring",
  name: "E-commerce Spring Sale",
  nodes: [
    { id: "ctv",          label: "CTV Impressions",    value: 1500000 },
    { id: "mobile",       label: "Mobile Crossover",   value: 350000  },
    { id: "desktop",      label: "Desktop Crossover",  value: 180000  },
    { id: "tv_browser",   label: "TV Browser",         value: 45000   },
    { id: "no_detection", label: "No Detection",       value: 925000  },
    // ... site visit nodes, conversion nodes
  ],
  links: [
    { source: "ctv", target: "mobile", value: 350000, confidence: 0.82 },
    // ... attribution paths with confidence scores
  ],
  timeToConversion: {
    "< 1 hour":   { count: 285,  percentage: 6.1  },
    "1-6 hours":  { count: 892,  percentage: 19.2 },
    // ... 6 time-window buckets
  },
  exposedGroup:  { impressions: 1500000, conversions: 4650, conversionRate: 0.0031 },
  controlGroup:  { impressions: 1500000, conversions: 2325, conversionRate: 0.00155 },
  lift: {
    absolute: 0.00155,
    relative: 100.0,
    pValue: 0.0003,
    confidenceInterval: [0.00128, 0.00182]
  }
}
```

All data is internally consistent: crossover sums match impressions, time-to-conversion counts sum to total conversions, and lift metrics align with exposed/control group rates.

---

## Key Design Decisions

### 1. Sankey for Multi-Stage Attribution
Sankey diagrams excel at showing flow magnitude and drop-off across multiple stages. The CTV attribution funnel (impression &rarr; device crossover &rarr; visit &rarr; conversion) maps naturally to this format, making volume loss and path efficiency immediately visible.

### 2. Confidence-Based Visual Encoding
Link opacity and color represent attribution confidence rather than being purely decorative. This surfaces the fundamental challenge of CTV measurement: *not all attribution paths are created equal*. High-confidence paths (green, >85%) are visually prominent; low-confidence paths (red, <70%) fade into the background.

### 3. Household vs Individual Toggle
The single most important trade-off in CTV attribution. Household-level matching captures multi-viewer scenarios but may overcount individual intent. Individual-level matching is more conservative but misses shared-device viewing. The toggle makes this trade-off tangible and interactive.

### 4. Ghost Bidding Incrementality
The exposed vs control comparison is built around The Trade Desk's ghost bidding methodology, where control groups are created by bidding on impressions but not serving ads. This isolates true incremental impact without PSA ads or other workarounds. The p-value and confidence interval quantify statistical rigor.

### 5. Three Campaign Archetypes
E-commerce (fast conversion, mobile-heavy), Automotive (long consideration, desktop-heavy), and CPG (impulse purchase, balanced) represent the breadth of CTV advertiser use cases. Each tells a different attribution story.

---

## Future Enhancements

- [ ] Integration with The Trade Desk API for live campaign data
- [ ] Geographic breakdowns (DMA-level attribution analysis)
- [ ] Creative-level attribution paths (which ad drove which path)
- [ ] A/B test comparison (different creative/targeting strategies)
- [ ] Frequency cap analysis (optimal exposure count before conversion)
- [ ] Real-time data streaming with WebSocket updates
- [ ] Multi-touch attribution model comparison (first-touch vs last-touch vs linear)
- [ ] UID 2.0 match rate overlay on device crossover nodes

---

## Why This Matters for The Trade Desk

CTV is projected to represent 50%+ of programmatic TV budgets by 2026. Helping advertisers understand and trust CTV attribution directly drives platform adoption:

| Strategic Priority | How This Tool Helps |
|---|---|
| **Justify CTV Investment** | Clear visualization of conversion paths proves value to media buyers and CFOs |
| **Differentiate from Walled Gardens** | Transparent, third-party measurement that advertisers can export and verify |
| **Support UID 2.0 Strategy** | Demonstrates the need for better identity resolution across devices |
| **Drive Retail Data Partnerships** | Shows value of closed-loop attribution with purchase-level conversion data |
| **Reduce Churn** | Advertisers who understand their CTV performance are less likely to shift budgets elsewhere |

---

## About This Project

Built by **Rock Raval** for The Trade Desk 2026 PM Internship Application (Measurement Team).

This prototype demonstrates:
- Deep understanding of CTV measurement challenges and The Trade Desk's approach
- Ability to translate complex attribution data into intuitive, actionable visualizations
- Product thinking around advertiser pain points and measurement workflow
- Technical execution from concept to polished, exportable tool

### Connect

- [LinkedIn](https://linkedin.com/in/rockraval)
- [GitHub](https://github.com/rockraval)
- [Email](mailto:rock@example.com)

---

## License

MIT License &mdash; feel free to use as reference for your own projects.

---

*This tool uses synthetic data for demonstration purposes. Real implementation would integrate with The Trade Desk's measurement APIs, Unified ID 2.0 identity graph, and live campaign data from the platform.*
