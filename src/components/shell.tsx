import { createClient } from "@/lib/supabase/server";

export async function Shell({ children }: { children: React.ReactNode }) {
  const supabase = createClient();

  const { data: sources } = await supabase
    .from("sources")
    .select("id, name, handle")
    .eq("is_hidden", false)
    .order("name");

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0a", color: "#e8e8e8" }}>
      {/* Header */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5"
        style={{
          height: 48,
          background: "#0a0a0a",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <span
          className="text-sm font-bold tracking-tight"
          style={{ fontFamily: "var(--font-geist-mono), monospace" }}
        >
          SORCE
        </span>
        <div>{/* center — empty for now */}</div>
        <a
          href="/sign-in"
          className="text-sm"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          Sign in
        </a>
      </header>

      {/* Sidebar */}
      <aside
        className="fixed top-[48px] left-0 bottom-0 flex flex-col justify-between overflow-y-auto"
        style={{
          width: 220,
          borderRight: "1px solid rgba(255,255,255,0.08)",
          background: "#0a0a0a",
        }}
      >
        <nav className="px-3 py-4 space-y-1">
          {[
            { label: "Feed", icon: "◉" },
            { label: "Search", icon: "⌕" },
            { label: "Bookmarks", icon: "★" },
            { label: "Settings", icon: "⚙" },
          ].map((item) => (
            <a
              key={item.label}
              href="#"
              className="flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-white/5 transition-colors"
              style={{
                fontFamily: "var(--font-geist-mono), monospace",
                color: "#e8e8e8",
              }}
            >
              <span className="w-5 text-center text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                {item.icon}
              </span>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="px-3 pb-4">
          <div
            className="text-[11px] uppercase tracking-wider mb-2 px-2"
            style={{
              fontFamily: "var(--font-geist-mono), monospace",
              color: "rgba(255,255,255,0.4)",
            }}
          >
            Sources
          </div>
          <ul className="space-y-0.5">
            {sources?.map((source) => (
              <li key={source.id}>
                <a
                  href="#"
                  className="block px-2 py-1 rounded text-sm hover:bg-white/5 transition-colors truncate"
                  style={{ color: "rgba(255,255,255,0.4)" }}
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
