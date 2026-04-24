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

const collectCards = [
  {
    title: "Account Data",
    body: "If you register, we store your email address and a hashed password, or your Google OAuth token if you sign in with Google. We do not store your Google password.",
  },
  {
    title: "Interaction Data",
    body: "Likes, bookmarks, follows, and mutes are stored in our database and associated with your account. This data is private — only you can see it.",
  },
  {
    title: "Usage Data",
    body: "We do not run third-party analytics. We do not track your browsing behaviour across other websites. Server logs may record IP addresses for security purposes only and are not retained beyond 30 days.",
  },
];

export default function PrivacyPage() {
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
        Privacy Policy
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
        Last updated: April 2026
      </p>

      {/* Our Commitment */}
      <div style={{ marginTop: 32 }}>
        <div style={sectionLabel}>Our Commitment</div>
        <p style={paragraph}>
          SORCE is built on the principle of radical transparency. We collect
          the minimum data required to operate the platform. We do not sell your data.
          We do not serve ads. We do not use tracking pixels or third-party analytics scripts.
        </p>
      </div>

      {/* What We Collect */}
      <div style={{ marginTop: 32 }}>
        <div style={sectionLabel}>What We Collect</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {collectCards.map((c) => (
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

      {/* What We Do Not Collect */}
      <div style={{ marginTop: 32 }}>
        <div style={sectionLabel}>What We Do Not Collect</div>
        <p style={paragraph}>
          We do not collect: payment information, precise location data,
          device fingerprints, behavioural advertising profiles, or any data from
          users who are not logged in beyond standard server logs.
        </p>
      </div>

      {/* Data Storage */}
      <div style={{ marginTop: 32 }}>
        <div style={sectionLabel}>Data Storage</div>
        <p style={paragraph}>
          Your data is stored on Supabase (PostgreSQL), hosted in the EU.
          Supabase is SOC 2 Type II certified. We apply Row Level Security — your
          private data (likes, bookmarks, follows) is only accessible by your account.
        </p>
      </div>

      {/* Third-Party Services */}
      <div style={{ marginTop: 32 }}>
        <div style={sectionLabel}>Third-Party Services</div>
        <p style={paragraph}>
          SORCE uses the following third-party services:
        </p>
        <ul
          style={{
            ...paragraph,
            marginTop: 8,
            paddingLeft: 20,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <li>Supabase — authentication and database (EU-hosted)</li>
          <li>Vercel — hosting and edge delivery</li>
          <li>Cloudflare — DDoS protection and CDN</li>
          <li>Google OAuth — optional sign-in only</li>
        </ul>
        <p style={{ ...paragraph, marginTop: 12 }}>
          No advertising networks, no data brokers, no tracking services.
        </p>
      </div>

      {/* Your Rights */}
      <div style={{ marginTop: 32 }}>
        <div style={sectionLabel}>Your Rights</div>
        <p style={paragraph}>
          You may request deletion of your account and all associated data
          at any time by contacting us via GitHub. We will process deletion requests
          within 30 days.
        </p>
      </div>

      {/* Changes to This Policy */}
      <div style={{ marginTop: 32 }}>
        <div style={sectionLabel}>Changes to This Policy</div>
        <p style={paragraph}>
          If we make material changes to this policy, we will update the
          date at the top of this page. Continued use of SORCE constitutes acceptance.
        </p>
      </div>

      {/* Contact */}
      <div style={{ marginTop: 32 }}>
        <div style={sectionLabel}>Contact</div>
        <p style={paragraph}>
          Privacy questions? Open an issue on our GitHub repository.
        </p>
      </div>
    </div>
  );
}
