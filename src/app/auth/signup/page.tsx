"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { dark } from "@/lib/tokens";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      router.push("/");
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
          <ShieldCheck size={20} style={{ color: "#fff" }} />
          <span
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 18,
              fontWeight: 700,
              color: "#fff",
            }}
          >
            SORCE
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
          Create account
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

        {/* Form */}
        <form onSubmit={handleSignUp} className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg outline-none"
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
            className="w-full rounded-lg outline-none"
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
            placeholder="Confirm password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            className="w-full rounded-lg outline-none"
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
            className="w-full rounded-lg cursor-pointer"
            style={{
              background: dark.accent,
              color: "#fff",
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 14,
              fontWeight: 600,
              padding: "10px 0",
              border: "none",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        {/* Sign in link */}
        <p
          className="text-center mt-5"
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 13,
            color: dark.textMute,
          }}
        >
          Already have an account?{" "}
          <a href="/auth/signin" style={{ color: dark.accent }}>
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
