import { NextRequest, NextResponse } from "next/server";

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


  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }


  if (pathname.includes(".")) {
    return NextResponse.next();
  }


  const token = request.cookies.get("coreinvent_token")?.value;

  if (!token) {

    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }




  const response = NextResponse.next();
  response.headers.set("x-forwarded-token", token);
  response.headers.set("x-request-pathname", pathname);

  return response;
}

export const config = {

  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
