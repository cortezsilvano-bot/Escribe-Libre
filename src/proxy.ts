import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const adminPath = (path: string) => path.startsWith("/admin") || path.startsWith("/api/admin");
const providerPath = (path: string) => path.startsWith("/provider") || path.startsWith("/api/provider");

export async function proxy(request: NextRequest) {
  if ((process.env.APP_DATA_MODE ?? "mock") === "mock") return NextResponse.next();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return request.nextUrl.pathname.startsWith("/api/")
    ? NextResponse.json({ ok: false, error: { code: "AUTH_NOT_CONFIGURED", message: "Production authentication is unavailable." } }, { status: 503 })
    : NextResponse.redirect(new URL("/sign-in?error=auth_not_configured", request.url));

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, anon, { cookies: { getAll: () => request.cookies.getAll(), setAll: (values) => { values.forEach(({ name, value }) => request.cookies.set(name, value)); response = NextResponse.next({ request }); values.forEach(({ name, value, options }) => response.cookies.set(name, value, options)); } } });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return request.nextUrl.pathname.startsWith("/api/")
    ? NextResponse.json({ ok: false, error: { code: "UNAUTHORIZED", message: "A valid server-verified session is required." } }, { status: 401 })
    : NextResponse.redirect(new URL(`/sign-in?next=${encodeURIComponent(request.nextUrl.pathname)}`, request.url));

  const requiredRoles = adminPath(request.nextUrl.pathname) ? ["moderator", "admin"] : providerPath(request.nextUrl.pathname) ? ["provider", "admin"] : [];
  if (requiredRoles.length) {
    const { data: roles } = await supabase.from("role_assignments").select("role").eq("user_id", user.id).in("role", requiredRoles);
    if (!roles?.length) return request.nextUrl.pathname.startsWith("/api/")
      ? NextResponse.json({ ok: false, error: { code: "FORBIDDEN", message: "The required database-backed role is missing." } }, { status: 403 })
      : NextResponse.redirect(new URL("/account?error=forbidden", request.url));
  }
  return response;
}

export const config = { matcher: ["/account/:path*", "/saved/:path*", "/saved-searches/:path*", "/compare/:path*", "/alerts/:path*", "/tours/:path*", "/contact-requests/:path*", "/settings/:path*", "/provider/:path*", "/admin/:path*", "/api/account/:path*", "/api/saved-listings/:path*", "/api/saved-searches/:path*", "/api/contact-requests/:path*", "/api/tour-requests/:path*", "/api/provider/:path*", "/api/admin/:path*"] };
