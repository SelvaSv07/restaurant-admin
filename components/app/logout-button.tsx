"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <Button variant="ghost" size="sm" type="button" className="text-[#858585] hover:text-[#333]" onClick={() => void logout()}>
      <LogOut className="size-[18px]" strokeWidth={2} />
      Log out
    </Button>
  );
}
