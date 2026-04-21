import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionCookie,
} from "@/lib/auth/session-verify-edge";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/api/ingest") ||
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname === "/login"
  ) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    if (!(await verifyAdminSessionCookie(token))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!(await verifyAdminSessionCookie(token))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|.*\\.(?:ico|png|jpg|jpeg|svg|webp|gif|woff2?)$).*)",
  ],
};
