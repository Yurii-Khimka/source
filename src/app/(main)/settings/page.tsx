import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton, SourceList } from "@/components/settings-actions";
import { dark } from "@/lib/tokens";

export const revalidate = 0;

const sectionHeading = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 11,
  color: dark.textMute,
  textTransform: "uppercase" as const,
  letterSpacing: 1,
  marginBottom: 12,
};

const sectionSeparator = {
  borderTop: `1px solid ${dark.line}`,
  marginTop: 24,
  paddingTop: 24,
};

export default async function SettingsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin");
  }

  const [followsRes, mutesRes] = await Promise.all([
    supabase
      .from("follows")
      .select("source_id, sources:sources(id, name, handle, logo_url)")
      .eq("user_id", user.id),
    supabase
      .from("mutes")
      .select("source_id, sources:sources(id, name, handle, logo_url)")
      .eq("user_id", user.id),
  ]);

  const followedSources = (followsRes.data ?? []).map(
    (r) => r.sources as unknown as { id: string; name: string; handle: string; logo_url: string | null }
  ).filter(Boolean);

  const mutedSources = (mutesRes.data ?? []).map(
    (r) => r.sources as unknown as { id: string; name: string; handle: string; logo_url: string | null }
  ).filter(Boolean);

  return (
    <div className="p-6">
      <h1
        style={{
          fontFamily: "'Source Serif 4', Georgia, serif",
          fontSize: 24,
          fontWeight: 700,
          color: "#EEF1F6",
          marginBottom: 24,
        }}
      >
        Settings
      </h1>

      {/* Account */}
      <div>
        <h2 style={sectionHeading}>Account</h2>
        <div className="flex items-center justify-between" style={{ padding: "12px 0" }}>
          <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13, color: dark.textDim }}>
            {user.email}
          </span>
          <SignOutButton />
        </div>
      </div>

      {/* Following */}
      <div style={sectionSeparator}>
        <h2 style={sectionHeading}>Following ({followedSources.length})</h2>
        <SourceList sources={followedSources} type="follow" />
      </div>

      {/* Muted */}
      <div style={sectionSeparator}>
        <h2 style={sectionHeading}>Muted ({mutedSources.length})</h2>
        <SourceList sources={mutedSources} type="mute" />
      </div>

      {/* Theme */}
      <div style={sectionSeparator}>
        <h2 style={sectionHeading}>Theme</h2>
        <div className="flex gap-2" style={{ padding: "12px 0" }}>
          <button
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 13,
              color: "#fff",
              background: dark.accent,
              border: "none",
              borderRadius: 6,
              padding: "6px 16px",
            }}
          >
            Dark
          </button>
          <button
            disabled
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 13,
              color: dark.textMute,
              background: "none",
              border: `1px solid ${dark.line2}`,
              borderRadius: 6,
              padding: "6px 16px",
              opacity: 0.5,
              cursor: "not-allowed",
            }}
          >
            Light (coming soon)
          </button>
        </div>
      </div>
    </div>
  );
}
