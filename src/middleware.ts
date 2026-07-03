import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./lib/jwt";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Run intl middleware first to handle locales
  const response = intlMiddleware(request);

  // 2. Custom Auth Logic - Protect admin and customer routes
  const isAdminRoute = /^\/(en|hi|pa)\/admin(\/.*)?$/.test(pathname);
  const isCustomerRoute = /^\/(en|hi|pa)\/customer(\/.*)?$/.test(pathname);

  if (isAdminRoute || isCustomerRoute) {
    const token = request.cookies.get("token")?.value;
    const localeMatch = pathname.match(/^\/(en|hi|pa)\b/);
    const locale = localeMatch ? localeMatch[1] : "en";
    const loginUrl = new URL(`/login?locale=${locale}`, request.url);

    if (!token) {
      return NextResponse.redirect(loginUrl);
    }

    const payload = await verifyToken(token);
    if (!payload) {
      const redirectResponse = NextResponse.redirect(loginUrl);
      // Clear the invalid token cookie
      redirectResponse.cookies.set("token", "", { maxAge: 0, path: "/" });
      return redirectResponse;
    }

    // Role verification
    if (isAdminRoute && payload.role !== "ADMIN" && payload.role !== "SUPER_ADMIN") {
      const redirectResponse = NextResponse.redirect(loginUrl);
      redirectResponse.cookies.set("token", "", { maxAge: 0, path: "/" });
      return redirectResponse;
    }

    if (isCustomerRoute && payload.role !== "CUSTOMER" && payload.role !== "ADMIN" && payload.role !== "SUPER_ADMIN") {
      const redirectResponse = NextResponse.redirect(loginUrl);
      redirectResponse.cookies.set("token", "", { maxAge: 0, path: "/" });
      return redirectResponse;
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|apple-touch-icon.png|.*\\.png$).*)"],
};
