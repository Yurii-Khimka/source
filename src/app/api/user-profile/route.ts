import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ user: null, profile: null });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("avatar_url, display_name")
      .eq("id", user.id)
      .single();

    return NextResponse.json({
      user: { id: user.id, email: user.email },
      profile: profile ?? null,
    });
  } catch (error) {
    console.error("User profile error:", error);
    return NextResponse.json({ user: null, profile: null });
  }
}
