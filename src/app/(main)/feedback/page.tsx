"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { dark } from "@/lib/tokens";
import { BackButton } from "@/components/ui/back-button";

const mono = "'JetBrains Mono', monospace";
const serif = "'Georgia', 'Times New Roman', serif";

const categories = [
  "Bug report",
  "Feature request",
  "Source suggestion",
  "General feedback",
];

const labelStyle: React.CSSProperties = {
  fontFamily: mono,
  fontSize: 12,
  textTransform: "uppercase",
  color: dark.textMute,
  marginBottom: 6,
  display: "block",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: dark.surface,
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 6,
  padding: "10px 14px",
  fontSize: 14,
  color: dark.text,
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
};

export default function FeedbackPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("General feedback");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit() {
    if (!message.trim()) {
      setError("Please enter a message.");
      return;
    }

    setSending(true);
    setError("");

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, category, message }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Something went wrong. Please try again.");
        setSending(false);
        return;
      }

      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="page-content" style={{ maxWidth: 600, margin: "0 auto", padding: "32px 24px" }}>
        <BackButton />
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <CheckCircle size={32} style={{ color: dark.accent }} />
          <h2
            style={{
              fontFamily: serif,
              fontSize: 20,
              fontWeight: 400,
              color: dark.text,
              marginTop: 12,
              marginBottom: 0,
            }}
          >
            Message received.
          </h2>
          <p style={{ fontSize: 14, color: dark.textDim, marginTop: 8 }}>
            Thank you. We read every message and take all feedback seriously.
          </p>
          <Link
            href="/"
            style={{
              display: "inline-block",
              marginTop: 20,
              fontSize: 14,
              color: dark.accent,
              textDecoration: "none",
            }}
          >
            &larr; Back to feed
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content" style={{ maxWidth: 600, margin: "0 auto", padding: "32px 24px" }}>
      <BackButton />

      <h1
        style={{
          fontFamily: serif,
          fontSize: 32,
          fontWeight: 400,
          color: dark.text,
          margin: 0,
        }}
      >
        Send us feedback
      </h1>
      <p style={{ fontSize: 14, color: dark.textDim, marginTop: 6, marginBottom: 0 }}>
        We read every message. Honest feedback makes SORCE better.
      </p>

      <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Name */}
        <div>
          <label style={labelStyle}>Name</label>
          <input
            type="text"
            placeholder="Your name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(100,104,240,0.6)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
          />
        </div>

        {/* Email */}
        <div>
          <label style={labelStyle}>Email</label>
          <input
            type="email"
            placeholder="your@email.com (optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(100,104,240,0.6)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
          />
          <div style={{ fontSize: 11, color: dark.textMute, marginTop: 4 }}>
            Only if you&apos;d like a reply.
          </div>
        </div>

        {/* Category */}
        <div>
          <label style={labelStyle}>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ ...inputStyle, appearance: "auto" }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(100,104,240,0.6)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Message */}
        <div>
          <label style={labelStyle}>Message</label>
          <textarea
            rows={5}
            placeholder="Tell us what's on your mind..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={{ ...inputStyle, resize: "vertical" }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(100,104,240,0.6)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
          />
        </div>

        {/* Error */}
        {error && (
          <div style={{ fontSize: 13, color: "#F87171", marginTop: -8 }}>
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={sending}
          className="cursor-pointer"
          style={{
            width: "100%",
            height: 42,
            background: sending ? "rgba(100,104,240,0.7)" : dark.accent,
            color: "#fff",
            border: "none",
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 500,
            cursor: sending ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          {sending && (
            <span
              style={{
                width: 14,
                height: 14,
                border: "2px solid rgba(255,255,255,0.3)",
                borderTopColor: "#fff",
                borderRadius: "50%",
                animation: "spin 0.6s linear infinite",
                display: "inline-block",
              }}
            />
          )}
          {sending ? "Sending..." : "Send feedback"}
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
