"use client";

import { CalendarDays } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type PeriodPreset } from "@/lib/ist";

const presets: { id: Exclude<PeriodPreset, "custom">; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "week", label: "Past 7 days" },
  { id: "month", label: "This Month" },
  { id: "year", label: "This Year" },
];

const options: { id: PeriodPreset; label: string }[] = [
  ...presets,
  { id: "custom", label: "Custom" },
];

function periodLabel(period: PeriodPreset) {
  return options.find((o) => o.id === period)?.label ?? "Today";
}

export type TimeframeSelectorVariant = "panel" | "header";

export function TimeframeSelector({ variant = "panel" }: { variant?: TimeframeSelectorVariant }) {
  const router = useRouter();
  const pathname = usePathname();
  const periodFieldId = pathname?.includes("/bills") ? "bills-period" : "dashboard-period";
  const params = useSearchParams();
  const period = (params.get("period") as PeriodPreset | null) ?? "today";
  const from = params.get("from") ?? "";
  const to = params.get("to") ?? "";

  function update(next: Record<string, string | null>) {
    const search = new URLSearchParams(params.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (!value) search.delete(key);
      else search.set(key, value);
    });
    router.push(`${pathname}?${search.toString()}`);
  }

  const selectBlock = (
    <Select
      value={period}
      onValueChange={(value) => {
        const next = value as PeriodPreset;
        if (next === "custom") {
          update({ period: "custom" });
        } else {
          update({ period: next, from: null, to: null });
        }
      }}
    >
      <SelectTrigger
        id={periodFieldId}
        className={
          variant === "header"
            ? "h-11 min-w-[200px] rounded-full border-0 bg-[#f7f7f7] px-3 pl-3 text-left text-sm font-medium text-[#333] shadow-none ring-1 ring-[#ebebeb] hover:bg-[#f0f0f0] focus-visible:ring-2 focus-visible:ring-[#ff6b1e]/35 data-placeholder:text-[#858585] sm:min-w-[220px]"
            : "h-11 w-full max-w-md rounded-xl border-0 bg-[#f7f7f7] px-3 text-left text-sm font-medium text-[#333] shadow-none ring-1 ring-[#ebebeb] hover:bg-[#f0f0f0] focus-visible:ring-2 focus-visible:ring-[#ff6b1e]/35 data-placeholder:text-[#858585]"
        }
        size="default"
      >
        {variant === "header" ? (
          <span className="flex min-w-0 flex-1 items-center gap-2">
            <CalendarDays className="size-[18px] shrink-0 text-[#858585]" strokeWidth={2} aria-hidden />
            <SelectValue>{periodLabel(period)}</SelectValue>
          </span>
        ) : (
          <SelectValue>{periodLabel(period)}</SelectValue>
        )}
      </SelectTrigger>
      <SelectContent
        align={variant === "header" ? "end" : "start"}
        className="rounded-xl border-0 bg-white shadow-lg ring-1 ring-[#ebebeb]"
      >
        {options.map((item) => (
          <SelectItem
            key={item.id}
            value={item.id}
            className="cursor-pointer rounded-lg py-2 text-sm focus:bg-[#ffeee0] focus:text-[#333]"
          >
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  const customRange =
    period === "custom" ? (
      <div
        className={
          variant === "header"
            ? "flex w-full flex-wrap items-end justify-end gap-3 sm:max-w-md"
            : "mt-4 flex flex-wrap items-end gap-3 border-t border-[#ebebeb] pt-4"
        }
      >
        <div className={variant === "header" ? "min-w-[140px] flex-1 sm:flex-initial" : "min-w-[140px] flex-1"}>
          <p className="mb-1.5 text-xs font-medium text-[#858585]">From</p>
          <Input
            type="date"
            value={from}
            onChange={(e) => update({ from: e.target.value })}
            className="h-10 rounded-xl border-0 bg-[#f7f7f7] text-sm ring-1 ring-[#ebebeb]"
          />
        </div>
        <div className={variant === "header" ? "min-w-[140px] flex-1 sm:flex-initial" : "min-w-[140px] flex-1"}>
          <p className="mb-1.5 text-xs font-medium text-[#858585]">To</p>
          <Input
            type="date"
            value={to}
            onChange={(e) => update({ to: e.target.value })}
            className="h-10 rounded-xl border-0 bg-[#f7f7f7] text-sm ring-1 ring-[#ebebeb]"
          />
        </div>
      </div>
    ) : null;

  if (variant === "header") {
    return (
      <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:items-end">
        <div className="self-end">{selectBlock}</div>
        {customRange}
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white p-3 shadow-[0_4px_24px_rgba(51,51,51,0.06)] ring-1 ring-[#ebebeb]">
      <label className="mb-2 block text-xs font-medium text-[#858585]" htmlFor={periodFieldId}>
        Period
      </label>
      {selectBlock}
      {customRange}
    </div>
  );
}
