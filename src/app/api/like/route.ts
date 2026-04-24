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

    // Check if like exists
    const { data: existing } = await supabase
      .from("likes")
      .select("*")
      .eq("user_id", user.id)
      .eq("article_id", article_id)
      .maybeSingle();

    if (existing) {
      // Remove like
      const { error: deleteError } = await supabase
        .from("likes")
        .delete()
        .eq("user_id", user.id)
        .eq("article_id", article_id);

      if (deleteError) {
        console.error("Like delete error:", deleteError);
        return NextResponse.json({ error: deleteError.message }, { status: 500 });
      }

      // Decrement via SECURITY DEFINER function
      const { data: newCount, error: rpcError } = await supabase
        .rpc("increment_like_count", { p_article_id: article_id, delta: -1 });

      if (rpcError) {
        console.error("Like decrement RPC error:", rpcError);
        // Fetch count as fallback
        const { data: article } = await supabase
          .from("articles").select("like_count").eq("id", article_id).single();
        return NextResponse.json({ liked: false, like_count: article?.like_count ?? 0 });
      }

      return NextResponse.json({ liked: false, like_count: newCount ?? 0 });
    } else {
      // Add like
      const { error: insertError } = await supabase
        .from("likes")
        .insert({ user_id: user.id, article_id });

      if (insertError) {
        console.error("Like insert error:", insertError);
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }

      // Increment via SECURITY DEFINER function
      const { data: newCount, error: rpcError } = await supabase
        .rpc("increment_like_count", { p_article_id: article_id, delta: 1 });

      if (rpcError) {
        console.error("Like increment RPC error:", rpcError);
        const { data: article } = await supabase
          .from("articles").select("like_count").eq("id", article_id).single();
        return NextResponse.json({ liked: true, like_count: article?.like_count ?? 0 });
      }

      return NextResponse.json({ liked: true, like_count: newCount ?? 0 });
    }
  } catch (error) {
    console.error("Like API error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
