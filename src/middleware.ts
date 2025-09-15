import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get("token")?.value;

  // Paths that a logged-in user should be redirected away from
  const authPaths = ["/login", "/register", "/"]; // <-- Added the root path

  // If a logged-in user tries to access an auth path or the root, send them to the dashboard
  if (token && authPaths.includes(path)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If a logged-out user tries to access a protected page
  if (
    !token &&
    (path.startsWith("/dashboard") ||
      path.startsWith("/playlist") ||
      path.startsWith("/item"))
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
