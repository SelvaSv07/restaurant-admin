import { NextResponse } from "next/server";

import { ADMIN_SESSION_COOKIE } from "@/lib/auth/constants";
import { signSession } from "@/lib/auth/session-sign-node";

export async function POST(request: Request) {
  const password = process.env.ADMIN_DASHBOARD_PASSWORD?.trim();
  if (!password) {
    return NextResponse.json({ error: "Server misconfigured: ADMIN_DASHBOARD_PASSWORD" }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const pwd =
    typeof body === "object" &&
    body !== null &&
    "password" in body &&
    typeof (body as { password: unknown }).password === "string"
      ? (body as { password: string }).password
      : "";

  if (pwd !== password) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  let token: string;
  try {
    token = signSession();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Session error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  const res = NextResponse.json({ ok: true });
  const secure = process.env.NODE_ENV === "production";
  res.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
  return res;
}
