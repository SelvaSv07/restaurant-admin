"use client";

import Image from "next/image";
import Link from "next/link";
import { ClipboardList, LayoutGrid, Package2, Settings } from "lucide-react";
import { usePathname } from "next/navigation";

import type { StoreListRow } from "@/lib/queries/stores";
import type { StoreScope } from "@/lib/store-cookie";

import { LogoutButton } from "@/components/app/logout-button";
import { StoreSwitcher } from "@/components/app/store-switcher";
import { cn } from "@/lib/utils";

const logoSymbol =
  "https://www.figma.com/api/mcp/asset/712fbe8e-e10c-41ba-9b1d-9b770192e8be";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/bills", label: "Bills", icon: ClipboardList },
  { href: "/inventory", label: "Inventory", icon: Package2 },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

type Props = {
  stores: StoreListRow[];
  selectedScope: StoreScope;
};

export function AdminSidebar({ stores, selectedScope }: Props) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-dvh w-[241px] shrink-0 flex-col overflow-hidden border-r border-[#ebebeb] bg-[#fdfdfd] px-5 pb-5 pt-6">
      <div className="shrink-0 px-3 pb-6">
        <Link href="/dashboard" className="flex cursor-pointer items-center gap-2">
          <span className="relative size-6 shrink-0">
            <Image
              src={logoSymbol}
              alt="Reztro Admin"
              width={24}
              height={24}
              className="size-6"
              unoptimized
            />
          </span>
          <span className="text-2xl font-semibold tracking-tight text-[#333]">Reztro</span>
        </Link>
      </div>

      <StoreSwitcher stores={stores} selectedScope={selectedScope} />

      <div className="my-6 h-px bg-[#ebebeb]" />

      <nav className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex w-full cursor-pointer items-center gap-2 rounded-xl transition-colors",
                active ? "text-[#ff6b1e]" : "text-[#858585] hover:bg-black/[0.03]",
              )}
            >
              {active ? (
                <>
                  <span className="h-6 w-1 shrink-0 rounded-full bg-[#ff6b1e]" aria-hidden />
                  <span className="flex min-w-0 flex-1 items-center gap-2 rounded-xl bg-[#ffeee0] px-2 py-2.5">
                    <Icon className="size-6 shrink-0" strokeWidth={2} />
                    <span className="text-sm font-semibold leading-none">{link.label}</span>
                  </span>
                </>
              ) : (
                <span className="flex w-full items-center gap-2 px-4 py-2.5">
                  <Icon className="size-6 shrink-0" strokeWidth={2} />
                  <span className="text-sm font-medium leading-none">{link.label}</span>
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto shrink-0 space-y-3 border-t border-[#ebebeb] pt-4">
        <LogoutButton />
      </div>
    </aside>
  );
}
