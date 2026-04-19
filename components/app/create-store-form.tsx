"use client";

import { useState } from "react";

import { createStore } from "@/app/actions/stores";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateStoreForm() {
  const [secret, setSecret] = useState<string | null>(null);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <Card className="shadow-[0_4px_24px_rgba(51,51,51,0.06)] ring-[#ebebeb]">
      <CardHeader>
        <CardTitle className="text-lg text-[#333]">Add store</CardTitle>
        <CardDescription>
          Creates a store record and a one-time sync secret. Copy the secret into each POS install (Settings → Cloud
          sync).
        </CardDescription>
      </CardHeader>
      <CardContent>
        {secret && storeId ? (
          <div className="space-y-3 rounded-xl bg-[#ffeee0] p-4 text-sm text-[#333] ring-1 ring-[#ffd4b8]">
            <p className="font-semibold">Copy these values now — the secret won’t be shown again.</p>
            <div className="space-y-1">
              <p className="text-xs font-medium text-[#858585]">Store id</p>
              <pre className="overflow-x-auto rounded-lg bg-white p-3 text-xs ring-1 ring-[#ebebeb]">{storeId}</pre>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-[#858585]">Sync secret</p>
              <pre className="overflow-x-auto rounded-lg bg-white p-3 text-xs ring-1 ring-[#ebebeb]">{secret}</pre>
            </div>
            <Button type="button" variant="outline" className="mt-2" onClick={() => setSecret(null)}>
              Done
            </Button>
          </div>
        ) : (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              void (async () => {
                setPending(true);
                setError(null);
                try {
                  const fd = new FormData(form);
                  const res = await createStore(fd);
                  if (!res.ok) {
                    setError(res.error);
                    return;
                  }
                  setStoreId(res.storeId);
                  setSecret(res.secret);
                  form.reset();
                } finally {
                  setPending(false);
                }
              })();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="name">Display name</Label>
              <Input id="name" name="name" required placeholder="Main Street outlet" className="h-10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (unique)</Label>
              <Input id="slug" name="slug" placeholder="main-street (optional)" className="h-10" />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button type="submit" className="bg-[#ff6b1e] hover:bg-[#ff6b1e]/90" disabled={pending}>
              {pending ? "Creating…" : "Create store"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
