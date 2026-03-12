import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Read cookies
  const accessToken = req.cookies.get("access_token")?.value;

  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/register");

  const isProtectedRoute = pathname.startsWith("/dashboard");

  // 1️⃣ Protected route without token → redirect to login
  if (isProtectedRoute && !accessToken) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 2️⃣ Logged user going to auth route → redirect to dashboard
  if (isAuthRoute && accessToken) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",  // protect full dashboard
    "/login",             // handle login redirect
    "/register",          // handle register redirect
  ],
};

















