"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, VolumeX } from "lucide-react";
import { dark } from "@/lib/tokens";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";

const mono = "'JetBrains Mono', monospace";
const inter = "'Inter', system-ui, sans-serif";

type Props = {
  sourceId: string;
  initialFollowing: boolean;
  initialMuted: boolean;
  isLoggedIn: boolean;
};

export function SourceActionBlock({ sourceId, initialFollowing, initialMuted, isLoggedIn }: Props) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [muted, setMuted] = useState(initialMuted);
  const [followLoading, setFollowLoading] = useState(false);
  const [muteLoading, setMuteLoading] = useState(false);

  useEffect(() => {
    function onFollowChanged(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (detail?.sourceId === sourceId) setFollowing(detail.following);
    }
    function onMuteChanged(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (detail?.sourceId === sourceId) setMuted(detail.muted);
    }
    window.addEventListener("sourceFollowChanged", onFollowChanged);
    window.addEventListener("sourceMuteChanged", onMuteChanged);
    return () => {
      window.removeEventListener("sourceFollowChanged", onFollowChanged);
      window.removeEventListener("sourceMuteChanged", onMuteChanged);
    };
  }, [sourceId]);

  async function handleFollow() {
    if (!isLoggedIn) { router.push("/auth/signin"); return; }
    if (followLoading) return;
    setFollowLoading(true);
    const was = following;
    setFollowing(!was);
    try {
      const res = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source_id: sourceId }),
      });
      if (res.ok) {
        const data = await res.json();
        setFollowing(data.following);
        window.dispatchEvent(new CustomEvent("followChanged"));
        window.dispatchEvent(new CustomEvent("sourceFollowChanged", { detail: { sourceId, following: data.following } }));
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
      const res = await fetch("/api/mute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source_id: sourceId }),
      });
      if (res.ok) {
        const data = await res.json();
        setMuted(data.muted);
        window.dispatchEvent(new CustomEvent("sourceMuteChanged", { detail: { sourceId, muted: data.muted } }));
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
        THIS SOURCE
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <Button
          onClick={handleFollow}
          disabled={followLoading}
          className={following ? "btn-following" : "btn-primary"}
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
          {followLoading ? <Spinner /> : <UserPlus size={13} />}
          {following ? "Following" : "Follow source"}
        </Button>

        <Button
          onClick={handleMute}
          disabled={muteLoading}
          className="btn-outline"
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
          {muted ? "Muted" : "Mute notifications"}
        </Button>
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
          Following puts this source on your home feed and enables alerts for corrections and breaking posts.
        </p>
      </div>
    </div>
  );
}
