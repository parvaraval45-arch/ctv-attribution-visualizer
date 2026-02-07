/**
 * Format a large number into a human-readable abbreviated string.
 * @param {number} num
 * @returns {string} Abbreviated form — "1.5M", "45K", or comma-separated below 10 000.
 */
export function formatLargeNumber(num) {
  if (num >= 1_000_000) {
    const m = num / 1_000_000;
    return Number.isInteger(m) ? `${m}M` : `${parseFloat(m.toFixed(1))}M`;
  }
  if (num >= 10_000) {
    const k = num / 1_000;
    return Number.isInteger(k) ? `${k}K` : `${parseFloat(k.toFixed(1))}K`;
  }
  if (num >= 1_000) {
    return num.toLocaleString("en-US");
  }
  return String(num);
}

/**
 * Format a decimal ratio as a percentage string.
 * @param {number} decimal - Value where 1 = 100 %.
 * @param {number} [decimals=1] - Decimal places to show.
 * @returns {string} e.g. "3.1%"
 */
export function formatPercentage(decimal, decimals = 1) {
  return `${(decimal * 100).toFixed(decimals)}%`;
}

/**
 * Format a number as US-dollar currency.
 * @param {number} value
 * @returns {string} e.g. "$1,234.56"
 */
export function formatCurrency(value) {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

/**
 * Calculate conversion rate as a decimal.
 * @param {number} conversions
 * @param {number} impressions
 * @returns {number} Decimal ratio (0-1). Returns 0 when impressions is 0.
 */
export function calculateConversionRate(conversions, impressions) {
  if (impressions === 0) return 0;
  return conversions / impressions;
}

/**
 * Calculate relative lift between an exposed and a control conversion rate.
 * @param {number} exposedRate
 * @param {number} controlRate
 * @returns {number} Relative lift as a decimal (1.0 = 100 % lift). Returns 0 when controlRate is 0.
 */
export function calculateLift(exposedRate, controlRate) {
  if (controlRate === 0) return 0;
  return (exposedRate - controlRate) / controlRate;
}

/**
 * Map an hour value to a time-to-conversion bucket label.
 * @param {number} hours
 * @returns {string} Bucket label matching the synthetic-data keys.
 */
export function timeToConversionLabel(hours) {
  if (hours < 1) return "< 1 hour";
  if (hours < 6) return "1-6 hours";
  if (hours < 24) return "6-24 hours";
  if (hours < 72) return "1-3 days";
  if (hours < 168) return "3-7 days";
  return "7+ days";
}

/**
 * Return a human-readable confidence level for a match-confidence score.
 * @param {number} score - Value between 0 and 1.
 * @returns {"High" | "Medium" | "Low"}
 */
export function getConfidenceLevel(score) {
  if (score > 0.85) return "High";
  if (score >= 0.70) return "Medium";
  return "Low";
}

/**
 * Return a hex colour representing a confidence score.
 * @param {number} score - Value between 0 and 1.
 * @returns {string} Hex colour — green, orange, or red.
 */
export function getConfidenceColor(score) {
  if (score > 0.85) return "#50C878";
  if (score >= 0.70) return "#FFB84D";
  return "#FF6B6B";
}
