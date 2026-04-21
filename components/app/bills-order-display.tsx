import { cn } from "@/lib/utils";

export function formatIstParts(date: Date) {
  const d = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
  const t = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
  return { dateLine: d.replaceAll("/", "-"), timeLine: t };
}

export function StatusBadge({ status }: { status: "draft" | "completed" | "voided" }) {
  if (status === "completed") {
    return (
      <span className="inline-flex rounded-md bg-emerald-600 px-2 py-1 text-xs font-medium leading-none text-white">
        Completed
      </span>
    );
  }
  if (status === "voided") {
    return (
      <span className="inline-flex rounded-md bg-[#333] px-2 py-1 text-xs leading-none text-[#f9f9f9]">
        Canceled
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-md bg-sky-100 px-2 py-1 text-xs font-medium leading-none text-sky-900">
      On Process
    </span>
  );
}

export function OrderTypeBadge({ orderType }: { orderType: "dine_in" | "takeaway" }) {
  const isTakeaway = orderType === "takeaway";
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-[#f7f7f7] px-2 py-1 text-xs text-[#333]">
      <span
        className={cn("size-2 shrink-0 rounded-full", isTakeaway ? "bg-[#fdcea1]" : "bg-[#ff6b1e]")}
      />
      {isTakeaway ? "Takeaway" : "Dine-in"}
    </span>
  );
}
