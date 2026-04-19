"use client";

import { TimeframeSelector } from "@/components/app/timeframe-selector";

export function DashboardHeader() {
  return (
    <header className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <h1 className="text-2xl font-semibold leading-[1.1] tracking-tight text-[#333]">Dashboard</h1>
      <TimeframeSelector variant="header" />
    </header>
  );
}
