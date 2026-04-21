"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STOCK_STATUS_LABEL: Record<string, string> = {
  all: "All Status",
  available: "Available",
  low: "Low",
  out: "Out of Stock",
};

export function InventoryToolbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const st = searchParams.get("status") ?? "all";

  function href(next: Record<string, string | null | undefined>) {
    const p = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v === null || v === undefined || v === "") p.delete(k);
      else p.set(k, v);
    }
    const s = p.toString();
    return s ? `${pathname}?${s}` : pathname;
  }

  return (
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <form
        className="flex min-w-0 max-w-full cursor-pointer items-center gap-1.5 rounded-lg border border-[#ebebeb] bg-[#fafafa] px-3 py-2 shadow-none sm:max-w-[280px] sm:flex-1 lg:max-w-[320px]"
        action={pathname}
        method="get"
      >
        {st !== "all" ? <input type="hidden" name="status" value={st} /> : null}
        <Search className="size-4 shrink-0 text-[#858585]" aria-hidden />
        <input
          name="q"
          defaultValue={q}
          placeholder="Search for item"
          className="min-w-0 flex-1 cursor-text bg-transparent text-xs text-[#333] outline-none placeholder:text-[#858585]"
        />
      </form>

      <div className="inline-flex shrink-0 items-center text-xs font-medium text-[#333]">
        <span className="sr-only">Status</span>
        <Select
          value={st}
          onValueChange={(v) => {
            if (v == null) return;
            router.push(
              href({
                status: v === "all" ? null : v,
                page: null,
              }),
            );
          }}
        >
          <SelectTrigger
            className="h-8 cursor-pointer rounded-lg border border-[#ebebeb] bg-white px-3 shadow-none hover:bg-[#f7f7f7] focus-visible:ring-2 focus-visible:ring-[#ff6b1e]/35"
            size="sm"
          >
            <SelectValue>{STOCK_STATUS_LABEL[st] ?? st}</SelectValue>
          </SelectTrigger>
          <SelectContent align="end" className="rounded-xl ring-1 ring-[#ebebeb]">
            <SelectItem value="all" className="cursor-pointer rounded-lg py-2 focus:bg-[#ffeee0]">
              {STOCK_STATUS_LABEL.all}
            </SelectItem>
            <SelectItem value="available" className="cursor-pointer rounded-lg py-2 focus:bg-[#ffeee0]">
              {STOCK_STATUS_LABEL.available}
            </SelectItem>
            <SelectItem value="low" className="cursor-pointer rounded-lg py-2 focus:bg-[#ffeee0]">
              {STOCK_STATUS_LABEL.low}
            </SelectItem>
            <SelectItem value="out" className="cursor-pointer rounded-lg py-2 focus:bg-[#ffeee0]">
              {STOCK_STATUS_LABEL.out}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
