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

const criteria = [
  {
    title: "Editorial Independence",
    body: "A source must be free from the direct influence of political or oligarchic structures. We do not tolerate \u201Chidden PR\u201D or paid content disguised as news.",
  },
  {
    title: "Ownership Transparency",
    body: "Readers have the right to know who finances the media they consume. Hidden beneficiaries result in an automatic denial of access.",
  },
  {
    title: "Fact-Checking History",
    body: "We analyze a source\u2019s track record. Persistent manipulation, uncorrected fakes, or a lack of official retractions after errors will bar a source from our ecosystem.",
  },
  {
    title: "Professional Ethics",
    body: "Adherence to professional standards, including the absence of hate speech, a balance of perspectives, and a clear distinction between facts and commentary.",
  },
];

export default function TrustPage() {
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
        Media Standards: The SORCE Integrity Protocol
      </h1>

      {/* Subtitle */}
      <p
        style={{
          fontSize: 14,
          color: dark.textDim,
          marginTop: 6,
          marginBottom: 0,
        }}
      >
        How do we choose whom to trust?
      </p>

      {/* Intro */}
      <p style={{ ...paragraph, marginTop: 16 }}>
        At SORCE, we employ a &ldquo;White List&rdquo; model. This means that no source enters our feed
        by accident or through automated scripts. Every media outlet undergoes a manual
        vetting process based on strict integrity criteria.
      </p>

      {/* Our Selection Criteria */}
      <div style={{ marginTop: 32 }}>
        <div style={sectionLabel}>Our Selection Criteria</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {criteria.map((c) => (
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

      {/* Dynamic Standards */}
      <div style={{ marginTop: 32 }}>
        <div style={sectionLabel}>Dynamic Standards</div>
        <p style={paragraph}>
          We recognize that the world is changing, and with it, the methods of manipulation.
          Therefore, our standards are not static. They may evolve, but exclusively in the
          direction of strengthening requirements for transparency, integrity, and the pursuit
          of truth. If we update our rules, it is for one purpose only: to implement even more
          effective ways to filter out deception and protect our information space.
        </p>
      </div>

      {/* Community Involvement */}
      <div style={{ marginTop: 32 }}>
        <div style={sectionLabel}>Community Involvement</div>
        <p style={paragraph}>
          As SORCE is an Open Source project, we encourage the community to participate in
          shaping these standards. If you identify manipulation from a source already on our
          list, it is grounds for a public audit. Together, we will create a filter that is
          impossible to bypass.
        </p>
      </div>
    </div>
  );
}
