import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { article_id } = await request.json();

    // Check if bookmark exists
    const { data: existing } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", user.id)
      .eq("article_id", article_id)
      .maybeSingle();

    if (existing) {
      // Remove bookmark
      const { error: deleteError } = await supabase
        .from("bookmarks")
        .delete()
        .eq("user_id", user.id)
        .eq("article_id", article_id);

      if (deleteError) {
        console.error("Bookmark delete error:", deleteError);
        return NextResponse.json({ error: deleteError.message }, { status: 500 });
      }

      return NextResponse.json({ bookmarked: false });
    } else {
      // Add bookmark
      const { error: insertError } = await supabase
        .from("bookmarks")
        .insert({ user_id: user.id, article_id });

      if (insertError) {
        console.error("Bookmark insert error:", insertError);
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }

      return NextResponse.json({ bookmarked: true });
    }
  } catch (error) {
    console.error("Bookmark API error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
