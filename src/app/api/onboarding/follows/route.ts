import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
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
    return NextResponse.json({ source_ids: [], tag_ids: [] });
  }

  const [{ data: sourceFollows }, { data: tagFollows }] = await Promise.all([
    supabase
      .from("follows")
      .select("source_id")
      .eq("user_id", user.id)
      .not("source_id", "is", null),
    supabase
      .from("follows")
      .select("tag_id")
      .eq("user_id", user.id)
      .not("tag_id", "is", null),
  ]);

  return NextResponse.json({
    source_ids: (sourceFollows ?? []).map((f) => f.source_id),
    tag_ids: (tagFollows ?? []).map((f) => f.tag_id),
  });
}
