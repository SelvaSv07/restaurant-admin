import { NextResponse } from "next/server";

import { ADMIN_SESSION_COOKIE } from "@/lib/auth/constants";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  const secure = process.env.NODE_ENV === "production";
  res.cookies.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 0,
  });
  return res;
}
