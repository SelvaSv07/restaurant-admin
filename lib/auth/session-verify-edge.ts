import { ADMIN_SESSION_COOKIE } from "@/lib/auth/constants";

export { ADMIN_SESSION_COOKIE };

const encoder = new TextEncoder();

function base64UrlToBytes(b64url: string): Uint8Array {
  const pad = b64url.length % 4 === 0 ? "" : "=".repeat(4 - (b64url.length % 4));
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)!;
  return out;
}

function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i)! ^ b.charCodeAt(i)!;
  return diff === 0;
}

function bytesToBase64Url(bytes: ArrayBuffer): string {
  const u8 = new Uint8Array(bytes);
  let binary = "";
  for (let i = 0; i < u8.length; i++) binary += String.fromCharCode(u8[i]!);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

/** Verifies cookies created by `signSession()` (must match Node HMAC/base64url output). */
export async function verifyAdminSessionCookie(token: string | undefined): Promise<boolean> {
  const secret = process.env.ADMIN_SESSION_SECRET?.trim();
  if (!secret || secret.length < 16) return false;
  if (!token) return false;

  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;
  if (!payload || !sig) return false;

  try {
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );

    const expectedBuf = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
    const expected = bytesToBase64Url(expectedBuf);
    if (!timingSafeEqualStr(expected, sig)) return false;

    const jsonText = new TextDecoder().decode(base64UrlToBytes(payload));
    const json = JSON.parse(jsonText) as { exp?: number };
    return typeof json.exp === "number" && json.exp > Date.now();
  } catch {
    return false;
  }
}
