import Link from "next/link";

const bg = "#0A0E14";
const text = "#EEF1F6";
const textDim = "#A3ACBD";
const textMute = "#6C727E";
const accent = "rgb(100,104,240)";

const mono = "'JetBrains Mono', monospace";
const serif = "'Source Serif 4', Georgia, serif";
const inter = "'Inter', system-ui, sans-serif";

export default function NotFound() {
  return (
    <div
      style={{
        background: bg,
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ position: "relative", textAlign: "center" }}>
        {/* Large background number */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontFamily: mono,
            fontSize: 120,
            fontWeight: 700,
            color: accent,
            opacity: 0.15,
            letterSpacing: -4,
            zIndex: 0,
            userSelect: "none",
            lineHeight: 1,
          }}
        >
          404
        </div>

        {/* Content */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              fontFamily: mono,
              fontSize: 12,
              color: textMute,
              marginBottom: 16,
            }}
          >
            {"// error 404 · page not found"}
          </div>

          <h1
            style={{
              fontFamily: serif,
              fontSize: 32,
              fontWeight: 700,
              color: text,
              letterSpacing: -0.5,
              margin: 0,
            }}
          >
            This page has been redacted.
          </h1>

          <p
            style={{
              fontFamily: inter,
              fontSize: 14,
              color: textDim,
              lineHeight: 1.6,
              maxWidth: 400,
              margin: "12px auto 0",
            }}
          >
            The URL you requested does not exist, has been moved,
            or was never approved for publication.
          </p>

          <div style={{ marginTop: 28 }}>
            <Link
              href="/"
              style={{
                display: "inline-block",
                background: accent,
                color: "#fff",
                padding: "10px 24px",
                borderRadius: 4,
                fontFamily: inter,
                fontSize: 14,
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              Return to feed
            </Link>
          </div>

          <div
            style={{
              fontFamily: mono,
              fontSize: 11,
              color: textMute,
              marginTop: 48,
            }}
          >
            SORCE · srct.news
          </div>
        </div>
      </div>
    </div>
  );
}
