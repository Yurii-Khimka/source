"use client";

const mono = "'JetBrains Mono', monospace";
const serif = "'Source Serif 4', Georgia, serif";
const inter = "'Inter', system-ui, sans-serif";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      style={{
        background: "var(--bg)",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ position: "relative", textAlign: "center" }}>
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontFamily: mono,
            fontSize: 120,
            fontWeight: 700,
            color: "var(--accent)",
            opacity: 0.15,
            letterSpacing: -4,
            zIndex: 0,
            userSelect: "none",
            lineHeight: 1,
          }}
        >
          502
        </div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontFamily: mono, fontSize: 12, color: "var(--text-mute)", marginBottom: 16 }}>
            {"// error 502 · bad gateway"}
          </div>
          <h1 style={{ fontFamily: serif, fontSize: 32, fontWeight: 700, color: "var(--text)", letterSpacing: -0.5, margin: 0 }}>
            Signal lost.
          </h1>
          <p style={{ fontFamily: inter, fontSize: 14, color: "var(--text-dim)", lineHeight: 1.6, maxWidth: 400, margin: "12px auto 0" }}>
            Our servers are having a moment. This is not a drill — we are already on it. Try again in a few seconds.
          </p>
          <div style={{ marginTop: 28 }}>
            <button
              onClick={reset}
              className="btn-primary"
              style={{ display: "inline-block", background: "var(--accent)", color: "var(--on-accent)", padding: "10px 24px", borderRadius: 4, fontFamily: inter, fontSize: 14, fontWeight: 500, border: "none", cursor: "pointer" }}
            >
              Try again
            </button>
          </div>
          <div style={{ fontFamily: mono, fontSize: 11, color: "var(--text-mute)", marginTop: 48 }}>
            SORCE · srct.news
          </div>
        </div>
      </div>
    </div>
  );
}
