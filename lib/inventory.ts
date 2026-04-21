export type InventoryStatus = "available" | "low" | "out";

export function getInventoryStatus(item: {
  quantity: number;
  maxStock: number | null;
  reorderQty: number;
}): InventoryStatus {
  if (item.quantity <= 0) return "out";
  if (item.reorderQty > 0 && item.quantity <= item.reorderQty) return "low";
  if (item.maxStock && item.maxStock > 0 && item.quantity * 100 < item.maxStock * 20) {
    return "low";
  }
  return "available";
}

export function splitStockBars(inCount: number, lowCount: number, outCount: number) {
  const bars = 30;
  const total = inCount + lowCount + outCount;
  if (total === 0) {
    return Array.from({ length: bars }, () => "muted" as const);
  }
  const nIn = Math.floor((bars * inCount) / total);
  const nLow = Math.floor((bars * lowCount) / total);
  const nOut = bars - nIn - nLow;
  const row: Array<"in" | "low" | "out"> = [];
  for (let i = 0; i < nIn; i++) row.push("in");
  for (let i = 0; i < nLow; i++) row.push("low");
  for (let i = 0; i < nOut; i++) row.push("out");
  return row;
}
