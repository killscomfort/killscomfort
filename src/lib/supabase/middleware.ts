import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function safeInternalPath(value: string | null | undefined, fallback = "/dashboard") {
  if (!value) return fallback;
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options: CookieOptions;
          }[]
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAdminRoute = pathname.startsWith("/admin");
  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/register");
  const isPasswordResetRoute =
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password");
  const isAuthCallback = pathname.startsWith("/auth/callback");

  const copyAuthCookies = (response: NextResponse) => {
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie.name, cookie.value);
    });
    return response;
  };

  if (isAuthCallback) {
    return supabaseResponse;
  }

  // Recovery links sometimes land on /login?code= — send to callback handler.
  if (pathname === "/login" && request.nextUrl.searchParams.get("code")) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/callback";
    if (!url.searchParams.get("next")) {
      url.searchParams.set("next", "/reset-password");
    }
    return copyAuthCookies(NextResponse.redirect(url));
  }

  // Academy "Continue as guest" creates an anonymous session. That still counts as
  // a logged-in user, so /admin was bouncing guests to /dashboard instead of login.
  if (isAdminRoute) {
    if (!user || user.is_anonymous) {
      if (user?.is_anonymous) {
        await supabase.auth.signOut();
      }
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.search = "";
      url.searchParams.set(
        "redirect",
        safeInternalPath(`${pathname}${request.nextUrl.search}`, "/admin")
      );
      return copyAuthCookies(NextResponse.redirect(url));
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      url.search = "";
      return copyAuthCookies(NextResponse.redirect(url));
    }
  }

  // Logged-in users hitting /login should land on their intended path (e.g. /admin),
  // not always /dashboard. Leave anonymous guests on the login form so they can switch accounts.
  if (isAuthRoute && user && !user.is_anonymous && !isPasswordResetRoute) {
    const requested = safeInternalPath(
      request.nextUrl.searchParams.get("redirect"),
      "/dashboard"
    );

    if (requested.startsWith("/admin")) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      const url = request.nextUrl.clone();
      url.pathname = profile?.role === "admin" ? requested : "/dashboard";
      url.search = "";
      return copyAuthCookies(NextResponse.redirect(url));
    }

    const url = request.nextUrl.clone();
    url.pathname = requested;
    url.search = "";
    return copyAuthCookies(NextResponse.redirect(url));
  }

  return supabaseResponse;
}
