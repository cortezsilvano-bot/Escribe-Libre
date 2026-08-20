import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const destination = new URL("/account", request.url);
  const response = NextResponse.redirect(destination);
  const code = request.nextUrl.searchParams.get("code");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!code || !url || !anon) return response;
  const supabase = createServerClient(url, anon, { cookies: { getAll: () => request.cookies.getAll(), setAll: (values) => values.forEach(({ name, value, options }) => response.cookies.set(name, value, options)) } });
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL("/sign-in?error=callback", request.url));
  return response;
}
