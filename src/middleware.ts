/**
 * Root middleware.
 *
 * Two responsibilities:
 *   1. Refresh the Supabase auth session cookie on every request so server
 *      components see a fresh user. This is the standard @supabase/ssr pattern.
 *   2. Gate /app/* routes behind authentication. Unauthenticated users hitting
 *      /app/* are redirected to /login with a `next` query param so they
 *      land back where they tried to go after signing in.
 *
 * Public marketing routes, auth pages, and API routes are unaffected.
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PATH_PREFIX = "/app";
const AUTH_ROUTES = new Set([
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
]);

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // IMPORTANT: getUser() is the only auth call that revalidates the session.
  // Do NOT call getSession() here — it does not refresh.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // Gate /app/*: unauthenticated → /login
  if (path.startsWith(PROTECTED_PATH_PREFIX) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path + request.nextUrl.search);
    return NextResponse.redirect(url);
  }

  // Bounce authenticated users away from auth routes — they're already in.
  if (AUTH_ROUTES.has(path) && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/app";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    // Match everything except Next.js internals and static assets.
    "/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|opengraph-image|robots.txt|sitemap.xml|logo.png).*)",
  ],
};
