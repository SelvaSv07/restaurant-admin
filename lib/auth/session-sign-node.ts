import "server-only";

import { createHmac } from "crypto";

function getSecret(): string {
  const s = process.env.ADMIN_SESSION_SECRET?.trim();
  if (!s || s.length < 16) {
    throw new Error("ADMIN_SESSION_SECRET must be set to a long random string (min 16 chars)");
  }
  return s;
}

/** Returns `token` — two base64url segments joined by `.` */
export function signSession(): string {
  const secret = getSecret();
  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const payload = Buffer.from(JSON.stringify({ exp, v: 1 }), "utf8").toString("base64url");
  const sig = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}
