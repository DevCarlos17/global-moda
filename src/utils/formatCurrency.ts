/**
 * Formats a number as USD currency string.
 * Example: 1234.5 → "$1,234.50"
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

/**
 * Parses a currency string back to number.
 * Example: "$1,234.50" → 1234.5
 */
export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[$,\s]/g, '')
  return parseFloat(cleaned) || 0
}
