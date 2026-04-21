"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
import { useEffect, useState } from "react";

import { AdminSidebar } from "@/components/app/admin-sidebar";
import { APP_LOGO_SRC, APP_NAME } from "@/lib/branding";
import type { StoreListRow } from "@/lib/queries/stores";
import type { StoreScope } from "@/lib/store-cookie";

export function AdminAppShell({
  stores,
  selectedScope,
  children,
}: {
  stores: StoreListRow[];
  selectedScope: StoreScope;
  children: React.ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const closeMobileNav = () => setMobileNavOpen(false);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMobileNav();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileNavOpen]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileNavOpen]);

  return (
    <div className="flex min-h-dvh bg-[#fdfdfd]">
      {mobileNavOpen ? (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] lg:hidden"
          onClick={closeMobileNav}
        />
      ) : null}

      <AdminSidebar
        stores={stores}
        selectedScope={selectedScope}
        mobileNavOpen={mobileNavOpen}
        onCloseMobileNav={closeMobileNav}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-[#ebebeb] bg-[#fdfdfd]/95 px-4 py-3 backdrop-blur-md supports-backdrop-blur:bg-[#fdfdfd]/80 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-[#ebebeb] bg-white text-[#333] shadow-[0_1px_2px_rgba(51,51,51,0.04)] outline-none transition-colors hover:bg-[#fafafa] focus-visible:ring-2 focus-visible:ring-[#ff6b1e]/25"
            aria-expanded={mobileNavOpen}
            aria-controls="admin-sidebar"
          >
            <Menu className="size-5" strokeWidth={2} aria-hidden />
            <span className="sr-only">Open navigation menu</span>
          </button>
          <Link
            href="/dashboard"
            className="flex min-w-0 flex-1 items-center gap-2"
            onClick={closeMobileNav}
          >
            <span className="relative flex h-7 shrink-0 items-center">
              <Image
                src={APP_LOGO_SRC}
                alt=""
                width={120}
                height={32}
                className="h-7 w-auto max-w-[104px] object-contain object-left"
                priority
              />
            </span>
            <span className="truncate text-lg font-semibold tracking-tight text-[#333]">{APP_NAME}</span>
          </Link>
        </header>

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
