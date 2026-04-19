import { NextResponse } from "next/server";

import { applyIngestJson } from "@/lib/ingest/apply-sync";

export async function POST(request: Request) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = await applyIngestJson(raw);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ ok: true, applied: result.applied });
}
