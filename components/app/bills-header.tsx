"use client";

import { TimeframeSelector } from "@/components/app/timeframe-selector";

export function BillsHeader() {
  return (
    <div className="flex w-full flex-col gap-6">
      <header className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold leading-[1.1] tracking-tight text-[#333]">Bills</h1>
        </div>
        <TimeframeSelector variant="header" />
      </header>
    </div>
  );
}
