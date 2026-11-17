import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

function redirectToHome(request: NextRequest, authError?: string) {
  const destination = new URL("/", request.url);
  if (authError) destination.searchParams.set("auth_error", authError);
  return NextResponse.redirect(destination);
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const authError = searchParams.get("error_code");
  if (authError || searchParams.has("error")) {
    return redirectToHome(request, authError === "otp_expired" ? "otp_expired" : "auth_failed");
  }
  if (!code) return redirectToHome(request, "auth_failed");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return redirectToHome(request, "supabase_not_configured");
  }

  const response = redirectToHome(request);
  const cookieStore = cookies();
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet: { name: string; value: string; options: CookieOptions }[]) => {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return redirectToHome(request, "auth_failed");
  return response;
}
