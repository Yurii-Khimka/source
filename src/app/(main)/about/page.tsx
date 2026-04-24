import { dark } from "@/lib/tokens";
import { BackButton } from "@/components/ui/back-button";

const mono = "'JetBrains Mono', monospace";
const serif = "'Georgia', 'Times New Roman', serif";

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

const philosophy = [
  {
    title: "Radical Transparency",
    body: "We are an Open Source project. Every line of our code is open for audit. We believe that the transparency of the tool is a prerequisite for the transparency of information.",
  },
  {
    title: "Accountability",
    body: "In our ecosystem, a voice only carries weight when it is backed by a real identity. We maintain zero tolerance for anonymity among those who shape the discourse.",
  },
  {
    title: "Strict Chronology",
    body: "We do not decide what is interesting for you. We show the truth as it is — in the exact order it occurs.",
  },
];

export default function AboutPage() {
  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 24px" }}>
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
        SORCE: Source of Truth
      </h1>

      {/* Intro */}
      <p style={{ ...paragraph, marginTop: 16 }}>
        We live in an age of information noise. Social media algorithms are designed for
        engagement, not for truth. They create &ldquo;echo chambers&rdquo; where manipulation and
        clickbait often triumph over facts. We built SORCE to give control back to the reader.
      </p>

      {/* What is SORCE? */}
      <div style={{ marginTop: 32 }}>
        <div style={sectionLabel}>What is SORCE?</div>
        <p style={paragraph}>
          SORCE is an open-source ecosystem for &ldquo;information hygiene.&rdquo; It is the news terminal
          of the future — a space where manipulative algorithms, bot farms, and anonymous
          hostility have no place. Our goal is to become the primary window into a world of
          clean, verified, and timely information.
        </p>
      </div>

      {/* Our Philosophy */}
      <div style={{ marginTop: 32 }}>
        <div style={sectionLabel}>Our Philosophy</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {philosophy.map((c) => (
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

      {/* Our Journey */}
      <div style={{ marginTop: 32 }}>
        <div style={sectionLabel}>Our Journey</div>
        <p style={paragraph}>
          Today, SORCE operates as a high-fidelity aggregator, gathering news from the world&apos;s
          most reliable sources. This is our first step toward creating a global registry of
          truth. Our roadmap leads to a platform where verified sources can interact with their
          audience directly.
        </p>
        <p style={{ ...paragraph, marginTop: 12 }}>
          SORCE belongs to the community. We invite every developer, journalist, and concerned
          citizen to join our code on GitHub and help us build a future free from censorship
          and deception.
        </p>
      </div>
    </div>
  );
}
