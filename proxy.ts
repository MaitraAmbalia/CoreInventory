import { NextRequest, NextResponse } from "next/server";

// Routes that are publicly accessible (no auth needed)
const PUBLIC_PATHS = [
  "/login",
  "/signup",
  "/api/auth/login",
  "/api/auth/signup",
  "/api/seed",
  "/_next",
  "/favicon",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ─── Allow public paths ──────────────────────────────
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // ─── Allow static assets ─────────────────────────────
  if (pathname.includes(".")) {
    return NextResponse.next();
  }

  // ─── Check auth cookie ───────────────────────────────
  const token = request.cookies.get("coreinvent_token")?.value;

  if (!token) {
    // API routes → 401 JSON response
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Pages → proxy redirect to /login while preserving the original URL
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ─── Proxy: forward user identity via headers ────────
  // Full JWT verification still happens server-side in each route/layout
  // Middleware just gates the route and forwards the raw token for fast routing
  const response = NextResponse.next();
  response.headers.set("x-forwarded-token", token);
  response.headers.set("x-request-pathname", pathname);

  return response;
}

export const config = {
  // Match all routes except Next.js internals
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
