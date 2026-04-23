import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Newspaper, Search, Bookmark, Settings, ShieldCheck } from "lucide-react";
import { dark } from "@/lib/tokens";

export async function Shell({ children }: { children: React.ReactNode }) {
  const supabase = createClient();

  const { data: sources } = await supabase
    .from("sources")
    .select("id, name, handle")
    .eq("is_hidden", false)
    .order("name");

  const { data: { user } } = await supabase.auth.getUser();

  let profile: { avatar_url: string | null; display_name: string | null } | null = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("avatar_url, display_name")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  return (
    <div className="min-h-screen" style={{ background: dark.bg, color: dark.text }}>
      {/* Header */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5"
        style={{
          height: 48,
          background: dark.bg,
          borderBottom: `1px solid ${dark.line}`,
        }}
      >
        <span
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 15,
            fontWeight: 700,
            color: "#fff",
          }}
        >
          <ShieldCheck size={16} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
          The Source
        </span>
        <div>{/* center — empty for now */}</div>
        {user ? (
          <div className="flex items-center gap-2">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt=""
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                className="flex items-center justify-center"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: dark.accent,
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#fff",
                }}
              >
                {(profile?.display_name ?? user.email ?? "?").charAt(0).toUpperCase()}
              </div>
            )}
            <span
              style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: 13,
                color: dark.textSub,
              }}
            >
              {profile?.display_name ?? user.email?.split("@")[0] ?? "User"}
            </span>
          </div>
        ) : (
          <Link
            href="/auth/signin"
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 13,
              color: dark.textDim,
            }}
          >
            Sign in
          </Link>
        )}
      </header>

      {/* Sidebar */}
      <aside
        className="fixed top-[48px] left-0 bottom-0 flex flex-col justify-between overflow-y-auto"
        style={{
          width: 220,
          borderRight: `1px solid ${dark.line}`,
          background: dark.bgAlt,
        }}
      >
        <nav className="px-3 py-4 space-y-0.5">
          {[
            { label: "Feed", icon: <Newspaper size={15} />, href: "/", active: true },
            { label: "Search", icon: <Search size={15} />, href: "/search", active: false },
            { label: "Bookmarks", icon: <Bookmark size={15} />, href: "/bookmarks", active: false },
            { label: "Settings", icon: <Settings size={15} />, href: "/settings", active: false },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-2 px-2 py-1.5 rounded transition-colors"
              style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: 13,
                color: item.active ? "#fff" : dark.textDim,
                background: item.active ? dark.hover : undefined,
              }}
            >
              <span
                className="w-5 flex justify-center"
                style={{ color: item.active ? "#fff" : dark.textMute }}
              >
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="px-3 pb-4">
          <div
            className="uppercase tracking-wider mb-2 px-2"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: dark.textMute,
            }}
          >
            Sources
          </div>
          <ul className="space-y-0.5">
            {sources?.map((source) => (
              <li key={source.id}>
                <a
                  href="#"
                  className="block px-2 py-1 rounded transition-colors truncate"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 11,
                    color: dark.textMute,
                  }}
                >
                  {source.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Main content */}
      <main
        className="mx-auto"
        style={{
          marginLeft: 220,
          paddingTop: 48,
          maxWidth: 740,
        }}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
