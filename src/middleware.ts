import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get("token")?.value;

  const publicPaths = ["/login", "/register", "/profile"];
  const isPublicPath =
    publicPaths.some((p) => path.startsWith(p)) || path === "/";

  // Paths that a logged-in user should be redirected away from
  const authAndRootPaths = ["/login", "/register", "/"];

  // --- Logic for logged-in users ---
  if (token) {
    // If a logged-in user is on the homepage, login, or register page,
    // redirect them to the dashboard.
    if (authAndRootPaths.includes(path)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }
  // --- Logic for logged-out users ---
  else {
    // If a logged-out user tries to access any non-public page,
    // redirect them to login.
    if (!isPublicPath) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
