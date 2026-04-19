"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(body.error ?? "Login failed");
        return;
      }
      router.push(nextPath.startsWith("/") ? nextPath : "/dashboard");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#fdfdfd] p-6">
      <Card className="w-full max-w-md shadow-[0_4px_24px_rgba(51,51,51,0.06)] ring-[#ebebeb]">
        <CardHeader>
          <CardTitle className="text-xl text-[#333]">Master admin</CardTitle>
          <CardDescription>Sign in with the dashboard password configured on the server.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={(e) => void onSubmit(e)}>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10"
                required
              />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button type="submit" className="w-full bg-[#ff6b1e] hover:bg-[#ff6b1e]/90" disabled={pending}>
              {pending ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
