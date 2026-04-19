export function pctChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export function formatSignedPercent(value: number) {
  const abs = Math.abs(value).toFixed(2);
  const sign = value >= 0 ? "+" : "−";
  return `${sign}${abs}%`;
}
