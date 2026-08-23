/**
 * Generate a unique order number in the format LM-YYYY-XXXXXX
 */
export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000).toString();
  return `LM-${year}-${random}`;
}
