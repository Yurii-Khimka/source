import { dark } from "@/lib/tokens";
import { BackButton } from "@/components/ui/back-button";
import { Heart } from "lucide-react";

const mono = "'JetBrains Mono', monospace";
const serif = "'Georgia', 'Times New Roman', serif";
const sans = "'Inter', system-ui, sans-serif";

const sectionLabel: React.CSSProperties = {
  fontFamily: mono,
  fontSize: 10,
  textTransform: "uppercase",
  letterSpacing: 1.2,
  color: dark.textMute,
  marginBottom: 10,
};

const paragraph: React.CSSProperties = {
  fontSize: 14,
  color: dark.textSub,
  lineHeight: 1.7,
};

const cards = [
  {
    title: "Infrastructure",
    body: "Domain, hosting, and servers. The Source runs lean — every article you read costs real money to deliver. Your support keeps it online.",
  },
  {
    title: "Source subscriptions",
    body: "Some of the best journalism is behind paywalls. We plan to subscribe to premium sources on behalf of our readers — so you get access to quality reporting without paying individually for each outlet.",
  },
  {
    title: "AI tools",
    body: "We use AI to help moderate content and improve the platform. We believe in disclosing this openly — AI is a tool, not a replacement for editorial judgement.",
  },
  {
    title: "Development",
    body: "Building and maintaining The Source takes time. Contributions help us improve faster and fix things sooner.",
  },
];

export default function SupportPage() {
  return (
    <div className="page-content" style={{ maxWidth: 680, margin: "0 auto", padding: "32px 24px" }}>
      <BackButton />
      {/* Title */}
      <h1
        style={{
          fontFamily: serif,
          fontSize: 32,
          fontWeight: 400,
          color: dark.text,
          margin: 0,
        }}
      >
        Support The Source
      </h1>

      {/* Intro */}
      <p style={{ ...paragraph, marginTop: 16 }}>
        The Source has no ads. No investors. No agenda. It is funded entirely by readers who
        believe in honest journalism. If this platform is useful to you, consider supporting it.
      </p>

      {/* Where your money goes */}
      <div style={{ marginTop: 32 }}>
        <div style={sectionLabel}>Where your money goes</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {cards.map((c) => (
            <div
              key={c.title}
              style={{
                background: dark.surface,
                border: `1px solid ${dark.line}`,
                padding: "16px 20px",
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: dark.text,
                  marginBottom: 6,
                }}
              >
                {c.title}
              </div>
              <div style={{ fontSize: 13, color: dark.textSub, lineHeight: 1.6 }}>
                {c.body}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Our promise */}
      <div style={{ marginTop: 32 }}>
        <div style={sectionLabel}>Our promise</div>
        <p style={paragraph}>
          We will publish a simple, honest breakdown of how donations are spent &mdash; no
          vague &ldquo;operational costs&rdquo;, no hidden salaries. If you give, you will know
          exactly where it went.
        </p>
        <p style={{ ...paragraph, marginTop: 12 }}>
          We will never accept money from media companies, political organisations, or
          advertisers. Independence is not negotiable.
        </p>
      </div>

      {/* How to support */}
      <div style={{ marginTop: 32 }}>
        <div style={sectionLabel}>How to support</div>
        <p style={paragraph}>
          Every contribution helps. There is no minimum. Thank you.
        </p>
        <a
          href="https://donatello.to/thesource"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            marginTop: 16,
            padding: "10px 24px",
            borderRadius: 6,
            background: dark.accent,
            color: "var(--on-accent)",
            fontFamily: sans,
            fontSize: 14,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          <Heart size={14} />
          Donate
        </a>
      </div>
    </div>
  );
}
