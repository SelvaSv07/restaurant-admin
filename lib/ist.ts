import { subDays, subMonths, subYears } from "date-fns";
import { TZDate } from "@date-fns/tz";

export type PeriodPreset = "today" | "week" | "month" | "year" | "custom";

const IST = "Asia/Kolkata";

function istNow(): TZDate {
  return new TZDate(Date.now(), IST);
}

function startOfIstDay(d: TZDate): Date {
  return new TZDate(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0, IST);
}

function endOfIstDay(d: TZDate): Date {
  return new TZDate(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999, IST);
}

function startOfIstMonth(d: TZDate): Date {
  return new TZDate(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0, IST);
}

function endOfIstMonth(d: TZDate): Date {
  return new TZDate(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999, IST);
}

function startOfIstYear(d: TZDate): Date {
  return new TZDate(d.getFullYear(), 0, 1, 0, 0, 0, 0, IST);
}

function endOfIstYear(d: TZDate): Date {
  return new TZDate(d.getFullYear(), 11, 31, 23, 59, 59, 999, IST);
}

export function resolvePresetRange(preset: Exclude<PeriodPreset, "custom">) {
  const now = istNow();

  if (preset === "today") {
    return {
      from: startOfIstDay(now),
      to: endOfIstDay(now),
    };
  }

  if (preset === "week") {
    return {
      from: subDays(startOfIstDay(now), 6),
      to: endOfIstDay(now),
    };
  }

  if (preset === "month") {
    return { from: startOfIstMonth(now), to: endOfIstMonth(now) };
  }

  return { from: startOfIstYear(now), to: endOfIstYear(now) };
}

export function chartBucketForPreset(period: PeriodPreset): "hour" | "day" | "month" {
  if (period === "today") return "hour";
  if (period === "year") return "month";
  return "day";
}

export function resolvePreviousPresetRange(preset: Exclude<PeriodPreset, "custom">) {
  const now = istNow();

  if (preset === "today") {
    const prevInstant = subDays(now, 1);
    const prev = new TZDate(prevInstant.getTime(), IST);
    return {
      from: startOfIstDay(prev),
      to: endOfIstDay(prev),
    };
  }

  if (preset === "week") {
    return {
      from: subDays(startOfIstDay(now), 13),
      to: endOfIstDay(new TZDate(subDays(now, 7).getTime(), IST)),
    };
  }

  if (preset === "month") {
    const prevInstant = subMonths(now, 1);
    const prev = new TZDate(prevInstant.getTime(), IST);
    return { from: startOfIstMonth(prev), to: endOfIstMonth(prev) };
  }

  const prevInstant = subYears(now, 1);
  const prev = new TZDate(prevInstant.getTime(), IST);
  return { from: startOfIstYear(prev), to: endOfIstYear(prev) };
}

export function resolvePreviousComparisonRange(
  period: PeriodPreset,
  from: Date,
  to: Date,
): { prevFrom: Date; prevTo: Date } {
  if (period === "custom") {
    const duration = to.getTime() - from.getTime();
    const prevTo = new Date(from.getTime() - 1);
    const prevFrom = new Date(prevTo.getTime() - duration);
    return { prevFrom, prevTo };
  }
  const p = resolvePreviousPresetRange(period);
  return { prevFrom: p.from, prevTo: p.to };
}

export function resolveCustomRange(fromDate: string, toDate: string) {
  const [y0, m0, d0] = fromDate.split("-").map(Number);
  const [y1, m1, d1] = toDate.split("-").map(Number);
  if (
    !Number.isFinite(y0) ||
    !Number.isFinite(m0) ||
    !Number.isFinite(d0) ||
    !Number.isFinite(y1) ||
    !Number.isFinite(m1) ||
    !Number.isFinite(d1)
  ) {
    const today = istNow();
    return { from: startOfIstDay(today), to: endOfIstDay(today) };
  }
  const from = new TZDate(y0, m0 - 1, d0, 0, 0, 0, 0, IST);
  const to = new TZDate(y1, m1 - 1, d1, 23, 59, 59, 999, IST);
  return { from, to };
}

export function toDateInput(date: Date): string {
  const d = new TZDate(date.getTime(), IST);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
