"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tag, VolumeX } from "lucide-react";
import { dark } from "@/lib/tokens";
import { Spinner } from "@/components/ui/spinner";

const mono = "'JetBrains Mono', monospace";
const inter = "'Inter', system-ui, sans-serif";

type Props = {
  tagId: string;
  initialFollowing: boolean;
  initialMuted: boolean;
  isLoggedIn: boolean;
};

export function TagActionBlock({ tagId, initialFollowing, initialMuted, isLoggedIn }: Props) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [muted, setMuted] = useState(initialMuted);
  const [followLoading, setFollowLoading] = useState(false);
  const [muteLoading, setMuteLoading] = useState(false);

  async function handleFollow() {
    if (!isLoggedIn) { router.push("/auth/signin"); return; }
    if (followLoading) return;
    setFollowLoading(true);
    const was = following;
    setFollowing(!was);
    try {
      const res = await fetch("/api/follow-tag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tag_id: tagId }),
      });
      if (res.ok) {
        const data = await res.json();
        setFollowing(data.following);
      } else {
        setFollowing(was);
      }
    } finally {
      setFollowLoading(false);
    }
  }

  async function handleMute() {
    if (!isLoggedIn) { router.push("/auth/signin"); return; }
    if (muteLoading) return;
    setMuteLoading(true);
    const was = muted;
    setMuted(!was);
    try {
      const res = await fetch("/api/mute-tag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tag_id: tagId }),
      });
      if (res.ok) {
        const data = await res.json();
        setMuted(data.muted);
      } else {
        setMuted(was);
      }
    } finally {
      setMuteLoading(false);
    }
  }

  return (
    <div
      style={{
        background: dark.surface,
        border: `1px solid ${dark.line}`,
        borderRadius: 8,
        padding: 14,
        marginBottom: 24,
      }}
    >
      <div
        style={{
          fontFamily: mono,
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: 1.2,
          color: dark.textMute,
          marginBottom: 12,
        }}
      >
        THIS TAG
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <button
          onClick={handleFollow}
          disabled={followLoading}
          className="cursor-pointer"
          style={{
            width: "100%",
            padding: "7px 0",
            borderRadius: 5,
            fontFamily: inter,
            fontSize: 12,
            fontWeight: 600,
            cursor: followLoading ? "wait" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            transition: "all 0.12s",
            background: following ? "transparent" : dark.accent,
            color: following ? dark.accent : "#fff",
            border: following ? `1px solid ${dark.accentLine}` : `1px solid ${dark.accent}`,
          }}
        >
          {followLoading ? <Spinner /> : <Tag size={13} />}
          {following ? "Following" : "Follow tag"}
        </button>

        <button
          onClick={handleMute}
          disabled={muteLoading}
          className="cursor-pointer"
          style={{
            width: "100%",
            padding: "7px 0",
            borderRadius: 5,
            fontFamily: inter,
            fontSize: 12,
            fontWeight: 600,
            cursor: muteLoading ? "wait" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            transition: "all 0.12s",
            background: dark.surface2,
            color: muted ? dark.textMute : dark.textDim,
            border: `1px solid ${dark.line2}`,
          }}
        >
          {muteLoading ? <Spinner /> : <VolumeX size={13} />}
          {muted ? "Muted" : "Mute tag"}
        </button>
      </div>

      <div style={{ borderTop: `1px solid ${dark.line}`, marginTop: 14, paddingTop: 12 }}>
        <p
          style={{
            fontFamily: inter,
            fontSize: 12,
            color: dark.textDim,
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          Following this tag adds matching posts to your home feed.
        </p>
      </div>
    </div>
  );
}
