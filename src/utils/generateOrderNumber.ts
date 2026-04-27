/**
 * Generates a unique order number in format: GM-YYYYMM-XXXX
 * Example: GM-202601-4829
 */
export function generateOrderNumber(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const random = Math.floor(1000 + Math.random() * 9000)
  return `GM-${year}${month}-${random}`
}

/**
 * Generates a versioned order number based on parent.
 * Example: GM-202601-4829-V2
 */
export function generateVersionedOrderNumber(baseNumber: string, version: number): string {
  // Remove existing version suffix if present
  const base = baseNumber.replace(/-V\d+$/, '')
  return `${base}-V${version}`
}
