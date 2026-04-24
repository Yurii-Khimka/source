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
      return NextResponse.json({ sources: [] });
    }

    const { data: follows } = await supabase
      .from("follows")
      .select("source_id")
      .eq("user_id", user.id)
      .not("source_id", "is", null);

    if (!follows || follows.length === 0) {
      return NextResponse.json({ sources: [] });
    }

    const { data: sources } = await supabase
      .from("sources")
      .select("id, name, handle, logo_url, site_url")
      .in("id", follows.map((f) => f.source_id))
      .eq("is_hidden", false)
      .order("name");

    return NextResponse.json({ sources: sources ?? [] });
  } catch (error) {
    console.error("Followed sources error:", error);
    return NextResponse.json({ sources: [] });
  }
}
