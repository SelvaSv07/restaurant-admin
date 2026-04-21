import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

type Props = {
  page: number;
  pageSize: number;
  total: number;
  hrefForPage: (p: number) => string;
};

export function InventoryPagination({ page, pageSize, total, hrefForPage }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);

  const window = pageNumbers(page, totalPages);

  return (
    <div className="flex flex-col gap-4 border-t border-[#ebebeb] pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-[#333]">
        Showing{" "}
        <span className="inline-flex h-8 items-center rounded-lg border border-[#ebebeb] bg-white px-2.5 text-sm font-medium tabular-nums shadow-none">
          {pageSize}
        </span>{" "}
        <span className="text-[#858585]">out of {total.toLocaleString("en-IN")}</span>
        {total > 0 ? (
          <span className="text-[#858585]">
            {" "}
            · rows {start}–{end}
          </span>
        ) : null}
      </p>

      <div className="flex items-center gap-2">
        <Link
          href={hrefForPage(Math.max(1, page - 1))}
          aria-disabled={page <= 1}
          className={cn(
            "flex size-8 cursor-pointer items-center justify-center rounded-lg border border-[#ebebeb] bg-white text-[#333] shadow-none transition hover:bg-[#f7f7f7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff6b1e]/35",
            page <= 1 && "pointer-events-none opacity-40",
          )}
        >
          <ChevronLeft className="size-4" />
        </Link>
        <div className="flex items-center gap-1">
          {window.map((n, i) =>
            n === "ellipsis" ? (
              <span key={`e-${i}`} className="px-2 text-sm text-[#858585]">
                …
              </span>
            ) : (
              <Link
                key={n}
                href={hrefForPage(n)}
                className={cn(
                  "flex min-w-8 cursor-pointer items-center justify-center rounded-lg border px-2 py-1.5 text-sm shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff6b1e]/35",
                  n === page
                    ? "border-[#ff6b1e] bg-[#ff6b1e] font-medium text-white hover:bg-[#ea580c]"
                    : "border-[#ebebeb] bg-white text-[#333] hover:bg-[#f7f7f7]",
                )}
              >
                {n}
              </Link>
            ),
          )}
        </div>
        <Link
          href={hrefForPage(Math.min(totalPages, page + 1))}
          aria-disabled={page >= totalPages}
          className={cn(
            "flex size-8 cursor-pointer items-center justify-center rounded-lg border border-[#ebebeb] bg-white text-[#333] shadow-none transition hover:bg-[#f7f7f7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff6b1e]/35",
            page >= totalPages && "pointer-events-none opacity-40",
          )}
        >
          <ChevronRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}

function pageNumbers(current: number, totalPages: number): (number | "ellipsis")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const set = new Set<number>([1, totalPages, current, current - 1, current + 1].filter((p) => p >= 1 && p <= totalPages));
  const sorted = [...set].sort((a, b) => a - b);
  const out: (number | "ellipsis")[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i]! - sorted[i - 1]! > 1) out.push("ellipsis");
    out.push(sorted[i]!);
  }
  return out;
}
