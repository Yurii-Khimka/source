"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  Clock,
  EyeOff,
  Newspaper,
  Bell,
  BookOpen,
  Check,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { dark } from "@/lib/tokens";
import { getSourceLogoUrl } from "@/lib/source-logo";
import { Button } from "@/components/ui/button";

const mono = "'JetBrains Mono', monospace";
const serif = "'Source Serif 4', Georgia, serif";
const sans = "'Inter', system-ui, sans-serif";

type Source = {
  id: string;
  handle: string;
  name: string;
  logo_url: string | null;
  site_url: string | null;
};

type Tag = {
  id: string;
  slug: string;
  name: string;
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [sources, setSources] = useState<Source[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [followedSourceIds, setFollowedSourceIds] = useState<Set<string>>(new Set());
  const [followedTagIds, setFollowedTagIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [srcRes, tagRes] = await Promise.all([
        fetch("/api/onboarding/sources"),
        fetch("/api/onboarding/tags"),
      ]);
      const srcData = await srcRes.json();
      const tagData = await tagRes.json();
      setSources(srcData.sources ?? []);
      setTags(tagData.tags ?? []);

      // Load existing follows
      const followRes = await fetch("/api/onboarding/follows");
      const followData = await followRes.json();
      setFollowedSourceIds(new Set(followData.source_ids ?? []));
      setFollowedTagIds(new Set(followData.tag_ids ?? []));

      setLoading(false);
    }
    load();
  }, []);

  async function completeOnboarding() {
    await fetch("/api/onboarding", { method: "POST" });
    window.dispatchEvent(new CustomEvent("followChanged"));
    window.dispatchEvent(new CustomEvent("tagFollowChanged"));
    router.push("/");
  }

  async function toggleSource(sourceId: string) {
    const was = followedSourceIds.has(sourceId);
    setFollowedSourceIds((prev) => {
      const next = new Set(prev);
      if (was) next.delete(sourceId);
      else next.add(sourceId);
      return next;
    });
    await fetch("/api/follow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source_id: sourceId }),
    });
  }

  async function toggleTag(tagId: string) {
    const was = followedTagIds.has(tagId);
    setFollowedTagIds((prev) => {
      const next = new Set(prev);
      if (was) next.delete(tagId);
      else next.add(tagId);
      return next;
    });
    await fetch("/api/follow-tag", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tag_id: tagId }),
    });
  }

  function next() {
    if (step < 3) setStep(step + 1);
    else completeOnboarding();
  }

  function back() {
    if (step > 0) setStep(step - 1);
  }

  const avatarColors: Record<string, string> = {
    B: "#3d5a80", D: "#e0b14f", E: "#ee6c4d", G: "#5b8fb9",
    R: "#9c6ade", S: "#44bd8f", T: "#cf6a87", U: "#3d5a80",
  };

  return (
    <div style={{ minHeight: "100vh", background: dark.bg, color: dark.text }}>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "48px 24px" }}>
        {/* Header */}
        <div className="flex items-center justify-between" style={{ marginBottom: 32 }}>
          <Link href="/" className="flex items-center gap-[10px]" style={{ textDecoration: "none" }}>
            <Image src="/logo-white.svg" alt="The Source" width={32} height={32} style={{ flexShrink: 0 }} />
            <div style={{ lineHeight: 1.3 }}>
              <div style={{ fontFamily: sans, fontSize: 13, fontWeight: 600, color: dark.text, letterSpacing: 0.8 }}>
                The Source
              </div>
              <div style={{ fontFamily: sans, fontSize: 11, color: dark.textDim }}>
                Source of Truth
              </div>
            </div>
          </Link>
          <button
            onClick={completeOnboarding}
            className="text-link cursor-pointer"
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "none", border: "none",
              fontFamily: mono, fontSize: 12, color: dark.textMute,
              cursor: "pointer",
            }}
          >
            <span>Skip</span> <ArrowRight size={12} />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center" style={{ gap: 6, marginBottom: 24 }}>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                width: i === step ? 24 : 6,
                height: 6,
                borderRadius: 3,
                background: i === step ? dark.accent : dark.surface2,
                transition: "all 0.2s",
              }}
            />
          ))}
        </div>

        {/* Step card */}
        <div
          className="onboarding-card"
          style={{
            background: dark.surface,
            border: `1px solid ${dark.line}`,
            borderRadius: 8,
            padding: 32,
            width: "100%",
          }}
        >
          {loading ? (
            <div style={{ textAlign: "center", padding: 40, fontFamily: mono, fontSize: 12, color: dark.textMute }}>
              Loading...
            </div>
          ) : (
            <>
              {step === 0 && <StepWelcome />}
              {step === 1 && (
                <StepSources
                  sources={sources}
                  followedIds={followedSourceIds}
                  onToggle={toggleSource}
                  avatarColors={avatarColors}
                />
              )}
              {step === 2 && (
                <StepTags
                  tags={tags}
                  followedIds={followedTagIds}
                  onToggle={toggleTag}
                />
              )}
              {step === 3 && <StepComplete />}
            </>
          )}
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-between" style={{ marginTop: 20 }}>
          <div style={{ width: 120 }}>
            {step > 0 && (
              <Button
                onClick={back}
                className="btn-outline"
                style={{
                  background: "none",
                  border: `1px solid ${dark.line2}`,
                  borderRadius: 6,
                  padding: "8px 16px",
                  fontFamily: sans,
                  fontSize: 13,
                  color: dark.textSub,
                  display: "flex", alignItems: "center", gap: 6,
                  whiteSpace: "nowrap",
                }}
              >
                <ArrowLeft size={12} />
                <span>Back</span>
              </Button>
            )}
          </div>
          <span style={{ fontFamily: mono, fontSize: 12, color: dark.textMute }}>
            step {step + 1} of 4
          </span>
          <div style={{ width: 120, textAlign: "right" }}>
            <Button
              onClick={next}
              className="btn-primary"
              style={{
                background: dark.accent,
                border: "none",
                borderRadius: 6,
                padding: "8px 16px",
                fontFamily: sans,
                fontSize: 13,
                fontWeight: 600,
                color: "#fff",
                display: "flex", alignItems: "center", gap: 6,
                whiteSpace: "nowrap",
              }}
            >
              <span>{step === 3 ? "Go to my feed" : "Continue"}</span>
              <ArrowRight size={12} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Step components ─────────────────────────────────── */

function StepWelcome() {
  const features = [
    { icon: ShieldCheck, text: "All sources are manually verified" },
    { icon: Clock, text: "Chronological feed \u2014 no algorithmic ranking" },
    { icon: EyeOff, text: "No ads. No tracking. No noise." },
  ];

  return (
    <>
      <div style={{ fontFamily: mono, fontSize: 11, textTransform: "uppercase", color: dark.textMute, letterSpacing: 1 }}>
        Welcome to SORCE
      </div>
      <h1 style={{ fontFamily: serif, fontSize: 28, fontWeight: 700, color: dark.text, marginTop: 8, lineHeight: 1.2 }}>
        Clean news. No noise.
      </h1>
      <p style={{ fontFamily: sans, fontSize: 14, color: dark.textSub, lineHeight: 1.7, marginTop: 12 }}>
        SORCE is a curated news terminal. Every source is manually vetted.
        No algorithms. No anonymous actors. Just the news — in the order it happened.
      </p>
      <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 14 }}>
        {features.map((f) => (
          <div key={f.text} className="flex items-center gap-3">
            <f.icon size={16} style={{ color: dark.accent, flexShrink: 0 }} />
            <span style={{ fontFamily: sans, fontSize: 13, color: dark.textSub }}>{f.text}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function StepSources({
  sources,
  followedIds,
  onToggle,
  avatarColors,
}: {
  sources: Source[];
  followedIds: Set<string>;
  onToggle: (id: string) => void;
  avatarColors: Record<string, string>;
}) {
  return (
    <>
      <div style={{ fontFamily: mono, fontSize: 11, textTransform: "uppercase", color: dark.textMute, letterSpacing: 1 }}>
        Step 1 of 2 &middot; Sources
      </div>
      <h1 style={{ fontFamily: serif, fontSize: 28, fontWeight: 700, color: dark.text, marginTop: 8, lineHeight: 1.2 }}>
        Follow sources you trust
      </h1>
      <p style={{ fontFamily: sans, fontSize: 14, color: dark.textSub, lineHeight: 1.7, marginTop: 12 }}>
        Choose at least one source to personalise your feed.
        You can change this at any time.
      </p>
      <div className="onboarding-sources-grid" style={{ marginTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {sources.map((s) => {
          const followed = followedIds.has(s.id);
          const initial = s.name.charAt(0).toUpperCase();
          const bg = avatarColors[initial] ?? "#6C727E";
          return (
            <button
              key={s.id}
              onClick={() => onToggle(s.id)}
              className={`cursor-pointer ${followed ? "onboarding-source-card-selected" : "onboarding-source-card"}`}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: 12,
                borderRadius: 6,
                border: followed
                  ? `1px solid ${dark.accent}`
                  : `1px solid ${dark.line}`,
                background: followed ? dark.accentBg : dark.surface,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              {followed && (
                <div
                  style={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    width: 18,
                    height: 18,
                    borderRadius: 9,
                    background: dark.accentBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Check size={12} style={{ color: dark.accent }} />
                </div>
              )}
              {(() => {
                const logoSrc = getSourceLogoUrl(s.logo_url, s.site_url);
                return logoSrc ? (
                  <img
                    src={logoSrc}
                    alt={s.name}
                    style={{ width: 32, height: 32, borderRadius: 6, objectFit: "cover", flexShrink: 0 }}
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                ) : (
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: 32, height: 32, borderRadius: 6, background: bg,
                      fontFamily: sans, fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0,
                    }}
                  >
                    {initial}
                  </div>
                );
              })()}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: sans, fontSize: 13, color: dark.text, fontWeight: 500 }}>
                  {s.name}
                </div>
                <div style={{ fontFamily: mono, fontSize: 11, color: dark.textMute }}>
                  @{s.handle}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}

function StepTags({
  tags,
  followedIds,
  onToggle,
}: {
  tags: Tag[];
  followedIds: Set<string>;
  onToggle: (id: string) => void;
}) {
  return (
    <>
      <div style={{ fontFamily: mono, fontSize: 11, textTransform: "uppercase", color: dark.textMute, letterSpacing: 1 }}>
        Step 2 of 2 &middot; Tags
      </div>
      <h1 style={{ fontFamily: serif, fontSize: 28, fontWeight: 700, color: dark.text, marginTop: 8, lineHeight: 1.2 }}>
        Pick your topics
      </h1>
      <p style={{ fontFamily: sans, fontSize: 14, color: dark.textSub, lineHeight: 1.7, marginTop: 12 }}>
        Follow tags to filter your feed by topic.
        You can always follow more later.
      </p>
      <div className="flex flex-wrap" style={{ marginTop: 20, gap: 8 }}>
        {tags.map((t) => {
          const followed = followedIds.has(t.id);
          return (
            <button
              key={t.id}
              onClick={() => onToggle(t.id)}
              className={`cursor-pointer ${followed ? "onboarding-tag-pill-active" : "onboarding-tag-pill"}`}
              style={{
                fontFamily: mono,
                fontSize: 13,
                padding: "6px 14px",
                borderRadius: 4,
                border: followed
                  ? `1px solid ${dark.accent}`
                  : `1px solid ${dark.line}`,
                background: followed ? "rgba(100,104,240,0.15)" : dark.surface,
                color: followed ? dark.accent : dark.textSub,
                cursor: "pointer",
              }}
            >
              #{t.slug}
            </button>
          );
        })}
      </div>
    </>
  );
}

function StepComplete() {
  const features = [
    { icon: Newspaper, text: "Your feed is waiting" },
    { icon: Bell, text: "Follow more sources anytime from Discovery" },
    { icon: BookOpen, text: "Read the Trust Standards to learn how we vet sources" },
  ];

  return (
    <>
      <div style={{ fontFamily: mono, fontSize: 11, textTransform: "uppercase", color: dark.textMute, letterSpacing: 1 }}>
        All set
      </div>
      <h1 style={{ fontFamily: serif, fontSize: 28, fontWeight: 700, color: dark.text, marginTop: 8, lineHeight: 1.2 }}>
        You&apos;re ready.
      </h1>
      <p style={{ fontFamily: sans, fontSize: 14, color: dark.textSub, lineHeight: 1.7, marginTop: 12 }}>
        Your feed is personalised. New articles from your followed sources
        and tags will appear in chronological order.
      </p>
      <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 14 }}>
        {features.map((f) => (
          <div key={f.text} className="flex items-center gap-3">
            <f.icon size={16} style={{ color: dark.accent, flexShrink: 0 }} />
            <span style={{ fontFamily: sans, fontSize: 13, color: dark.textSub }}>{f.text}</span>
          </div>
        ))}
      </div>
    </>
  );
}
