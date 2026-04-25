"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { dark } from "@/lib/tokens";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/auth/callback" },
    });
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      // Check if user has completed onboarding
      const res = await fetch("/api/onboarding");
      const data = await res.json();
      if (!data.onboarding_completed) {
        router.push("/onboarding");
      } else {
        router.push("/");
      }
      router.refresh();
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: dark.bg }}
    >
      <div
        style={{
          maxWidth: 400,
          width: "100%",
          background: dark.surface,
          border: `1px solid ${dark.line}`,
          borderRadius: 12,
          padding: 32,
        }}
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <Image src="/logo-white.svg" alt="The Source" width={32} height={32} />
          <span
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 18,
              fontWeight: 700,
              color: "#fff",
            }}
          >
            The Source
          </span>
        </div>

        {/* Heading */}
        <h1
          className="text-center mb-1"
          style={{
            fontFamily: "'Source Serif 4', Georgia, serif",
            fontSize: 22,
            fontWeight: 700,
            color: dark.text,
          }}
        >
          Sign in to The Source
        </h1>
        <p
          className="text-center mb-6"
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 13,
            color: dark.textMute,
          }}
        >
          Follow sources. Bookmark articles. No noise.
        </p>

        {/* Google */}
        <button
          onClick={handleGoogle}
          className="btn-primary w-full rounded-lg cursor-pointer"
          style={{
            background: dark.accent,
            color: "#fff",
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 14,
            fontWeight: 600,
            padding: "10px 0",
            border: "none",
          }}
        >
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1" style={{ height: 1, background: dark.line }} />
          <span
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 12,
              color: dark.textMute,
            }}
          >
            or
          </span>
          <div className="flex-1" style={{ height: 1, background: dark.line }} />
        </div>

        {/* Email form */}
        <form onSubmit={handleEmail} className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg outline-none input-field"
            style={{
              background: dark.surface2,
              border: `1px solid ${dark.line2}`,
              color: dark.text,
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 14,
              padding: "10px 12px",
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-lg outline-none input-field"
            style={{
              background: dark.surface2,
              border: `1px solid ${dark.line2}`,
              color: dark.text,
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 14,
              padding: "10px 12px",
            }}
          />

          {error && (
            <p style={{ color: dark.danger, fontSize: 13, fontFamily: "'Inter', system-ui, sans-serif" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-outline w-full rounded-lg cursor-pointer"
            style={{
              background: "transparent",
              color: dark.text,
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 14,
              fontWeight: 600,
              padding: "10px 0",
              border: `1px solid ${dark.line2}`,
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Signing in…" : "Sign in with email"}
          </button>
        </form>

        {/* Sign up link */}
        <p
          className="text-center mt-5"
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 13,
            color: dark.textMute,
          }}
        >
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="text-link" style={{ color: dark.accent }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
