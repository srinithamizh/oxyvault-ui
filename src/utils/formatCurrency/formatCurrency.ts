const formatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** Formats an amount as Indian rupees, e.g. 248820 → "₹2,48,820". */
export function formatCurrency(amount: number): string {
  return formatter.format(amount);
}
