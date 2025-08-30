import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  // Define protected and public routes
  const protectedRoutes = ["/dashboard", "/playlists"];
  const publicRoutes = ["/login", "/register", "/"];

  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );
  const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname);

  // 1. Redirect to login if accessing a protected route without a token
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. Redirect to dashboard if logged in and trying to access a public auth page
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 3. New: Redirect from the homepage to login if there is no token
  if (request.nextUrl.pathname === "/" && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Continue to the next handler if no redirect is needed
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
