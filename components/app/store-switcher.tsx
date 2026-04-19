"use client";

import { useEffect, useState, useTransition } from "react";
import { Menu } from "@base-ui/react/menu";
import { Check, ChevronsUpDown, LayoutGrid, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { setSelectedStore } from "@/app/actions/selection";
import type { StoreListRow } from "@/lib/queries/stores";
import type { StoreScope } from "@/lib/store-cookie";
import { cn } from "@/lib/utils";

type Props = {
  stores: StoreListRow[];
  selectedScope: StoreScope;
};

function StoreGlyph({ store }: { store: StoreListRow | null }) {
  if (!store) {
    return <LayoutGrid className="size-4 text-[#333]" strokeWidth={2} aria-hidden />;
  }
  const ch = store.displayName.trim().charAt(0).toUpperCase() || "?";
  return <span className="text-[13px] font-semibold text-[#333]">{ch}</span>;
}

/** 1-based slot in the menu (first row = 1), max 9 to match ⌘1 … ⌘9. */
function ShortcutHint({ slot }: { slot: number | null }) {
  const [prefix, setPrefix] = useState("⌘");
  useEffect(() => {
    const isApple =
      typeof navigator !== "undefined" &&
      (/Mac|iPhone|iPad|iPod/.test(navigator.platform) ||
        navigator.userAgent.includes("Mac"));
    setPrefix(isApple ? "⌘" : "Ctrl+");
  }, []);
  if (slot == null || slot < 1 || slot > 9) return null;
  return (
    <kbd className="pointer-events-none hidden font-sans text-[10px] font-medium tracking-tight text-[#b6b6b6] sm:inline">
      {prefix}
      {slot}
    </kbd>
  );
}

export function StoreSwitcher({ stores, selectedScope }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const value =
    selectedScope === "all" ? "all" : stores.some((s) => s.id === selectedScope) ? selectedScope : "all";

  const selectedStore = value !== "all" ? (stores.find((s) => s.id === value) ?? null) : null;

  return (
    <div className="px-3">
      <Menu.Root modal={false}>
        <Menu.Trigger
          disabled={pending}
          className={cn(
            "flex w-full min-w-0 items-center gap-2 rounded-lg border border-[#ebebeb] bg-white px-2 py-2 text-left shadow-[0_1px_2px_rgba(51,51,51,0.04)] outline-none transition-colors",
            "hover:bg-[#fafafa] focus-visible:ring-2 focus-visible:ring-[#ff6b1e]/25 disabled:opacity-50",
          )}
        >
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-md border border-[#ebebeb] bg-[#f7f7f7]"
            aria-hidden
          >
            <StoreGlyph store={selectedStore} />
          </span>
          <span className="min-w-0 flex-1">
            {value === "all" ? (
              <>
                <span className="block truncate text-sm font-semibold text-[#333]">All stores</span>
                <span className="block truncate text-xs text-[#858585]">Combined · every location</span>
              </>
            ) : selectedStore ? (
              <>
                <span className="block truncate text-sm font-semibold text-[#333]">
                  {selectedStore.displayName}
                </span>
                <span className="block truncate font-mono text-xs text-[#858585]">{selectedStore.id}</span>
              </>
            ) : null}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 text-[#858585]" strokeWidth={2} aria-hidden />
        </Menu.Trigger>

        <Menu.Portal>
          <Menu.Positioner side="right" align="start" sideOffset={8} alignOffset={-4}>
            <Menu.Popup
              className={cn(
                "z-[200] w-[min(280px,calc(100vw-2rem))] min-w-[var(--anchor-width)] rounded-xl border border-[#ebebeb] bg-white p-1 shadow-[0_12px_40px_rgba(51,51,51,0.12)] outline-none",
              )}
            >
              <Menu.Group>
                <Menu.GroupLabel className="px-2 py-1.5 text-xs font-medium text-[#858585]">
                  Stores
                </Menu.GroupLabel>
                <Menu.RadioGroup
                  value={value}
                  onValueChange={(next) => {
                    if (next == null || typeof next !== "string") return;
                    startTransition(async () => {
                      await setSelectedStore(next === "all" ? "all" : next);
                    });
                  }}
                >
                  <Menu.RadioItem
                    value="all"
                    closeOnClick
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-lg py-2 pr-2 pl-2 text-sm outline-none select-none",
                      "data-[highlighted]:bg-[#ffeee0] data-[highlighted]:text-[#333]",
                    )}
                  >
                    <span
                      className="flex size-8 shrink-0 items-center justify-center rounded-md border border-[#ebebeb] bg-[#f7f7f7]"
                      aria-hidden
                    >
                      <LayoutGrid className="size-4 text-[#333]" strokeWidth={2} />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="truncate font-medium text-[#333]">All stores</span>
                      <span className="truncate font-mono text-xs text-[#858585]">Combined view</span>
                    </span>
                    <span className="ml-auto flex shrink-0 items-center gap-1.5">
                      <Menu.RadioItemIndicator className="flex size-4 items-center justify-center text-[#ff6b1e]">
                        <Check className="size-4" strokeWidth={2.5} aria-hidden />
                      </Menu.RadioItemIndicator>
                      <ShortcutHint slot={1} />
                    </span>
                  </Menu.RadioItem>
                  {stores.map((s, i) => {
                    const slot = i + 2 <= 9 ? i + 2 : null;
                    return (
                      <Menu.RadioItem
                        key={s.id}
                        value={s.id}
                        closeOnClick
                        className={cn(
                          "flex cursor-pointer items-center gap-2 rounded-lg py-2 pr-2 pl-2 text-sm outline-none select-none",
                          "data-[highlighted]:bg-[#ffeee0] data-[highlighted]:text-[#333]",
                        )}
                      >
                        <span
                          className="flex size-8 shrink-0 items-center justify-center rounded-md border border-[#ebebeb] bg-[#f7f7f7]"
                          aria-hidden
                        >
                          <StoreGlyph store={s} />
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <span className="truncate font-medium text-[#333]">{s.displayName}</span>
                          <span className="truncate font-mono text-xs text-[#858585]">{s.id}</span>
                        </span>
                        <span className="ml-auto flex shrink-0 items-center gap-1.5">
                          <Menu.RadioItemIndicator className="flex size-4 items-center justify-center text-[#ff6b1e]">
                            <Check className="size-4" strokeWidth={2.5} aria-hidden />
                          </Menu.RadioItemIndicator>
                          <ShortcutHint slot={slot} />
                        </span>
                      </Menu.RadioItem>
                    );
                  })}
                </Menu.RadioGroup>
              </Menu.Group>

              <Menu.Separator className="my-1 h-px bg-[#ebebeb]" />

              <Menu.Item
                closeOnClick
                onClick={() => router.push("/settings")}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-lg py-2 pr-2 pl-2 text-sm outline-none select-none",
                  "text-[#333] data-[highlighted]:bg-[#ffeee0] data-[highlighted]:text-[#333]",
                )}
              >
                <Plus className="size-4 text-[#858585]" strokeWidth={2} aria-hidden />
                Add store
              </Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
    </div>
  );
}
