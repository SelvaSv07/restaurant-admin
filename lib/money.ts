const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatINR(valueRupee: number): string {
  return inrFormatter.format(Math.round(valueRupee));
}
