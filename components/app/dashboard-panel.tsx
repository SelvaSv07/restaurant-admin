import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type DashboardPanelProps = {
  title: string;
  titleAddon?: ReactNode;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
  headerVariant?: "standard" | "compact";
  children: ReactNode;
};

export function DashboardPanel({
  title,
  titleAddon,
  subtitle,
  action,
  className,
  headerVariant = "standard",
  children,
}: DashboardPanelProps) {
  const compact = headerVariant === "compact";

  return (
    <div
      className={cn(
        "rounded-xl bg-white p-4 shadow-[0_4px_24px_rgba(51,51,51,0.06)] ring-1 ring-[#ebebeb]",
        className,
      )}
    >
      <div className={cn("flex flex-wrap items-start justify-between gap-3", compact ? "mb-3 px-2 pb-3" : "mb-4")}>
        <div className={cn("min-w-0", compact ? "space-y-0" : "space-y-0.5")}>
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
            <h2
              className={cn(
                "leading-tight text-[#333]",
                compact ? "text-sm font-semibold" : "text-lg font-semibold",
              )}
            >
              {title}
            </h2>
            {titleAddon ? (
              <span
                className={cn(
                  "whitespace-nowrap text-[#858585]",
                  compact ? "text-xs font-normal" : "text-sm font-medium",
                )}
              >
                {titleAddon}
              </span>
            ) : null}
          </div>
          {subtitle ? (
            <p className={cn("text-[#858585]", compact ? "text-xs" : "text-sm")}>{subtitle}</p>
          ) : null}
        </div>
        {action ? <div className="w-full shrink-0 sm:w-auto">{action}</div> : null}
      </div>
      {children}
    </div>
  );
}
