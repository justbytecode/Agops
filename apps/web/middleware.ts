import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Paths that require authentication
const protectedPaths = [
  "/dashboard",
  "/websites",
  "/agents",
  "/incidents",
  "/integrations",
  "/metrics",
  "/pipelines",
  "/infrastructure",
  "/security",
  "/team",
  "/settings",
];

// Paths that should redirect to dashboard if authenticated
const authPaths = ["/login", "/signup"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get token from cookies
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET || "your-secret-key-change-in-production" 
  });

  const isAuthenticated = !!token;
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  const isAuthPath = authPaths.some(path => pathname === path);

  // Redirect to login if accessing protected path without session
  if (isProtectedPath && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to dashboard if accessing auth pages while logged in
  if (isAuthPath && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
