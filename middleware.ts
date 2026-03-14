import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./lib/auth";

// Routes not requiring authentication
const publicPaths = ["/login", "/signup", "/api/auth/login", "/api/auth/signup"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check authentication
  const token = request.cookies.get("coreinvent_token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const payload = verifyToken(token);
  if (!payload) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("coreinvent_token");
    return response;
  }

  // Add user info to headers for API routes
  const response = NextResponse.next();
  response.headers.set("x-user-id", payload.userId);
  response.headers.set("x-user-role", payload.role);
  response.headers.set("x-user-name", payload.name);
  response.headers.set("x-user-email", payload.email);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
