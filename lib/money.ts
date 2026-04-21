const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatINR(valueRupee: number): string {
  return inrFormatter.format(Math.round(valueRupee));
}

/** Draft bills may show ₹0 before lines are finalized — hide in list UIs (matches POS). */
export function shouldHideDraftZeroAmount(
  status: "draft" | "completed" | "voided",
  totalRupee: number,
): boolean {
  return status === "draft" && totalRupee === 0;
}

/** Draft rows may show 0 line qty before items are finalized — hide in list UIs (matches POS). */
export function shouldHideDraftZeroQty(
  status: "draft" | "completed" | "voided",
  qty: number,
): boolean {
  return status === "draft" && qty === 0;
}
