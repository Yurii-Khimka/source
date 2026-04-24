import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { article_id } = await request.json();

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

  const { data: existing } = await supabase
    .from("likes")
    .select("id")
    .eq("user_id", user.id)
    .eq("article_id", article_id)
    .maybeSingle();

  if (existing) {
    const { error: deleteError } = await supabase
      .from("likes")
      .delete()
      .eq("user_id", user.id)
      .eq("article_id", article_id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // Decrement like_count
    const { data: current } = await supabase
      .from("articles")
      .select("like_count")
      .eq("id", article_id)
      .single();
    const newCount = Math.max(0, (current?.like_count ?? 1) - 1);
    await supabase.from("articles").update({ like_count: newCount }).eq("id", article_id);

    return NextResponse.json({ liked: false, like_count: newCount });
  }

  const { error: insertError } = await supabase
    .from("likes")
    .insert({ user_id: user.id, article_id });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // Increment like_count
  const { data: current } = await supabase
    .from("articles")
    .select("like_count")
    .eq("id", article_id)
    .single();
  const newCount = (current?.like_count ?? 0) + 1;
  await supabase.from("articles").update({ like_count: newCount }).eq("id", article_id);

  return NextResponse.json({ liked: true, like_count: newCount });
}
