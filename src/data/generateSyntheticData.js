// Synthetic CTV attribution data for three campaign archetypes.
// Each campaign models a realistic attribution funnel:
//   CTV Impressions → Device Crossover → Site Visits → Conversions
// with exposed/control lift analysis and time-to-conversion distributions.

const ecommerceSpring = {
  id: "camp-ecom-spring",
  name: "E-commerce Spring Sale",
  nodes: [
    { id: "ctv",          label: "CTV Impressions",   value: 1500000 },
    { id: "mobile",       label: "Mobile Crossover",  value: 350000 },
    { id: "desktop",      label: "Desktop Crossover", value: 180000 },
    { id: "tv_browser",   label: "TV Browser",        value: 45000 },
    { id: "no_detection", label: "No Detection",      value: 925000 },
    { id: "mobile_visit", label: "Mobile Visits",     value: 82000 },
    { id: "desktop_visit",label: "Desktop Visits",    value: 45000 },
    { id: "tv_visit",     label: "TV Visits",         value: 8000 },
    { id: "mobile_conv",  label: "Mobile Conversions",  value: 2850 },
    { id: "desktop_conv", label: "Desktop Conversions", value: 1620 },
    { id: "tv_conv",      label: "TV Conversions",      value: 180 },
  ],
  links: [
    // CTV → Device crossover
    { source: "ctv", target: "mobile",       value: 350000, confidence: 0.82 },
    { source: "ctv", target: "desktop",      value: 180000, confidence: 0.78 },
    { source: "ctv", target: "tv_browser",   value: 45000,  confidence: 0.95 },
    { source: "ctv", target: "no_detection", value: 925000, confidence: 0.20 },
    // Device → Site visits
    { source: "mobile",     target: "mobile_visit",  value: 82000, confidence: 0.85 },
    { source: "desktop",    target: "desktop_visit",  value: 45000, confidence: 0.80 },
    { source: "tv_browser", target: "tv_visit",       value: 8000,  confidence: 0.92 },
    // Site visits → Conversions
    { source: "mobile_visit",  target: "mobile_conv",  value: 2850, confidence: 0.88 },
    { source: "desktop_visit", target: "desktop_conv", value: 1620, confidence: 0.84 },
    { source: "tv_visit",     target: "tv_conv",       value: 180,  confidence: 0.90 },
  ],
  timeToConversion: {
    "< 1 hour":  { count: 285,  percentage: 6.1 },
    "1-6 hours": { count: 892,  percentage: 19.2 },
    "6-24 hours":{ count: 1456, percentage: 31.3 },
    "1-3 days":  { count: 1243, percentage: 26.7 },
    "3-7 days":  { count: 567,  percentage: 12.2 },
    "7+ days":   { count: 207,  percentage: 4.5 },
  },
  exposedGroup: {
    impressions: 1500000,
    conversions: 4650,
    conversionRate: 0.0031,
  },
  controlGroup: {
    impressions: 1500000,
    conversions: 2325,
    conversionRate: 0.00155,
  },
  lift: {
    absolute: 0.00155,
    relative: 100.0,
    pValue: 0.0003,
    confidenceInterval: [0.00128, 0.00182],
  },
};

const automotiveLaunch = {
  id: "camp-auto-launch",
  name: "Automotive New Model Launch",
  nodes: [
    { id: "ctv",          label: "CTV Impressions",   value: 2200000 },
    { id: "mobile",       label: "Mobile Crossover",  value: 220000 },
    { id: "desktop",      label: "Desktop Crossover", value: 396000 },
    { id: "tv_browser",   label: "TV Browser",        value: 55000 },
    { id: "no_detection", label: "No Detection",      value: 1529000 },
    { id: "mobile_visit", label: "Mobile Visits",     value: 38000 },
    { id: "desktop_visit",label: "Desktop Visits",    value: 95000 },
    { id: "tv_visit",     label: "TV Visits",         value: 6500 },
    { id: "mobile_conv",  label: "Mobile Conversions",  value: 660 },
    { id: "desktop_conv", label: "Desktop Conversions", value: 2310 },
    { id: "tv_conv",      label: "TV Conversions",      value: 330 },
  ],
  links: [
    // CTV → Device crossover
    { source: "ctv", target: "mobile",       value: 220000,  confidence: 0.70 },
    { source: "ctv", target: "desktop",      value: 396000,  confidence: 0.73 },
    { source: "ctv", target: "tv_browser",   value: 55000,   confidence: 0.75 },
    { source: "ctv", target: "no_detection", value: 1529000, confidence: 0.18 },
    // Device → Site visits
    { source: "mobile",     target: "mobile_visit",  value: 38000, confidence: 0.72 },
    { source: "desktop",    target: "desktop_visit",  value: 95000, confidence: 0.74 },
    { source: "tv_browser", target: "tv_visit",       value: 6500,  confidence: 0.71 },
    // Site visits → Conversions
    { source: "mobile_visit",  target: "mobile_conv",  value: 660,  confidence: 0.70 },
    { source: "desktop_visit", target: "desktop_conv", value: 2310, confidence: 0.73 },
    { source: "tv_visit",     target: "tv_conv",       value: 330,  confidence: 0.72 },
  ],
  timeToConversion: {
    "< 1 hour":  { count: 99,   percentage: 3.0 },
    "1-6 hours": { count: 330,  percentage: 10.0 },
    "6-24 hours":{ count: 627,  percentage: 19.0 },
    "1-3 days":  { count: 825,  percentage: 25.0 },
    "3-7 days":  { count: 924,  percentage: 28.0 },
    "7+ days":   { count: 495,  percentage: 15.0 },
  },
  exposedGroup: {
    impressions: 2200000,
    conversions: 3300,
    conversionRate: 0.0015,
  },
  controlGroup: {
    impressions: 2200000,
    conversions: 1980,
    conversionRate: 0.0009,
  },
  lift: {
    absolute: 0.0006,
    relative: 66.7,
    pValue: 0.0021,
    confidenceInterval: [0.00042, 0.00078],
  },
};

const cpgBrandAwareness = {
  id: "camp-cpg-awareness",
  name: "CPG Brand Awareness",
  nodes: [
    { id: "ctv",          label: "CTV Impressions",   value: 800000 },
    { id: "mobile",       label: "Mobile Crossover",  value: 136000 },
    { id: "desktop",      label: "Desktop Crossover", value: 112000 },
    { id: "tv_browser",   label: "TV Browser",        value: 28000 },
    { id: "no_detection", label: "No Detection",      value: 524000 },
    { id: "mobile_visit", label: "Mobile Visits",     value: 34000 },
    { id: "desktop_visit",label: "Desktop Visits",    value: 22000 },
    { id: "tv_visit",     label: "TV Visits",         value: 4200 },
    { id: "mobile_conv",  label: "Mobile Conversions",  value: 528 },
    { id: "desktop_conv", label: "Desktop Conversions", value: 396 },
    { id: "tv_conv",      label: "TV Conversions",      value: 276 },
  ],
  links: [
    // CTV → Device crossover
    { source: "ctv", target: "mobile",       value: 136000, confidence: 0.79 },
    { source: "ctv", target: "desktop",      value: 112000, confidence: 0.76 },
    { source: "ctv", target: "tv_browser",   value: 28000,  confidence: 0.82 },
    { source: "ctv", target: "no_detection", value: 524000, confidence: 0.22 },
    // Device → Site visits
    { source: "mobile",     target: "mobile_visit",  value: 34000, confidence: 0.80 },
    { source: "desktop",    target: "desktop_visit",  value: 22000, confidence: 0.77 },
    { source: "tv_browser", target: "tv_visit",       value: 4200,  confidence: 0.81 },
    // Site visits → Conversions
    { source: "mobile_visit",  target: "mobile_conv",  value: 528, confidence: 0.78 },
    { source: "desktop_visit", target: "desktop_conv", value: 396, confidence: 0.75 },
    { source: "tv_visit",     target: "tv_conv",       value: 276, confidence: 0.80 },
  ],
  timeToConversion: {
    "< 1 hour":  { count: 192, percentage: 16.0 },
    "1-6 hours": { count: 336, percentage: 28.0 },
    "6-24 hours":{ count: 288, percentage: 24.0 },
    "1-3 days":  { count: 204, percentage: 17.0 },
    "3-7 days":  { count: 120, percentage: 10.0 },
    "7+ days":   { count: 60,  percentage: 5.0 },
  },
  exposedGroup: {
    impressions: 800000,
    conversions: 1200,
    conversionRate: 0.0015,
  },
  controlGroup: {
    impressions: 800000,
    conversions: 600,
    conversionRate: 0.00075,
  },
  lift: {
    absolute: 0.00075,
    relative: 100.0,
    pValue: 0.0008,
    confidenceInterval: [0.00055, 0.00095],
  },
};

export const getCampaigns = () => [
  ecommerceSpring,
  automotiveLaunch,
  cpgBrandAwareness,
];
