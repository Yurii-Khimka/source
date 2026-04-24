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
      return NextResponse.json({ tags: [] });
    }

    const { data: follows } = await supabase
      .from("follows")
      .select("tag_id")
      .eq("user_id", user.id)
      .not("tag_id", "is", null);

    if (!follows || follows.length === 0) {
      return NextResponse.json({ tags: [] });
    }

    const { data: tags } = await supabase
      .from("tags")
      .select("id, slug, label")
      .in("id", follows.map((f) => f.tag_id))
      .order("label");

    return NextResponse.json({ tags: tags ?? [] });
  } catch (error) {
    console.error("Followed tags error:", error);
    return NextResponse.json({ tags: [] });
  }
}
