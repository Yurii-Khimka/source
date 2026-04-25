import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SourceList, TagList } from "@/components/settings-actions";
import { BackButton } from "@/components/ui/back-button";
import { SettingsThemeToggle } from "@/components/settings-theme-toggle";
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

  const { data: mutesData } = await supabase
    .from("mutes")
    .select("source_id, tag_id, sources:sources(id, name, handle, logo_url, site_url), tags:tags(id, slug, label)")
    .eq("user_id", user.id);

  const mutedSources = (mutesData ?? [])
    .filter((r) => r.source_id != null)
    .map(
      (r) => r.sources as unknown as { id: string; name: string; handle: string; logo_url: string | null; site_url: string | null }
    )
    .filter(Boolean);

  const mutedTags = (mutesData ?? [])
    .filter((r) => r.tag_id != null)
    .map(
      (r) => r.tags as unknown as { id: string; slug: string; label: string }
    )
    .filter(Boolean);

  return (
    <div className="page-content p-6">
      <BackButton />
      <h1
        style={{
          fontFamily: "'Source Serif 4', Georgia, serif",
          fontSize: 24,
          fontWeight: 700,
          color: dark.text,
          marginBottom: 24,
        }}
      >
        Settings
      </h1>

      {/* Muted sources */}
      <div>
        <h2 style={sectionHeading}>Muted sources ({mutedSources.length})</h2>
        <SourceList sources={mutedSources} type="mute" />
      </div>

      {/* Muted tags */}
      <div style={sectionSeparator}>
        <h2 style={sectionHeading}>Muted tags ({mutedTags.length})</h2>
        <TagList tags={mutedTags} />
      </div>

      {/* Theme */}
      <div style={sectionSeparator}>
        <h2 style={sectionHeading}>Theme</h2>
        <SettingsThemeToggle />
      </div>
    </div>
  );
}
