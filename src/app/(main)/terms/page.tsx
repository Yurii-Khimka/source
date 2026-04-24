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

export default function TermsPage() {
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
        Terms of Use
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

      {/* Acceptance */}
      <div style={{ marginTop: 32 }}>
        <div style={sectionLabel}>Acceptance</div>
        <p style={paragraph}>
          By accessing or using SORCE (srct.news), you agree to these terms.
          If you do not agree, please do not use the platform.
        </p>
      </div>

      {/* What SORCE Is */}
      <div style={{ marginTop: 32 }}>
        <div style={sectionLabel}>What SORCE Is</div>
        <p style={paragraph}>
          SORCE is a read-only news aggregator. We collect and display
          publicly available articles from a curated list of vetted media sources.
          We do not host, own, or modify the original content. All articles link
          directly to their original source.
        </p>
      </div>

      {/* User Accounts */}
      <div style={{ marginTop: 32 }}>
        <div style={sectionLabel}>User Accounts</div>
        <p style={paragraph}>
          You may use SORCE without an account. Creating an account allows
          you to follow sources, follow tags, bookmark articles, and like posts.
          You are responsible for maintaining the confidentiality of your credentials.
          You must not create accounts using false identities or automated means.
        </p>
      </div>

      {/* Acceptable Use */}
      <div style={{ marginTop: 32 }}>
        <div style={sectionLabel}>Acceptable Use</div>
        <p style={paragraph}>
          You agree not to use SORCE to:
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
          <li>Attempt to disrupt, overload, or gain unauthorised access to the platform</li>
          <li>Scrape or harvest data in a way that degrades service for other users</li>
          <li>Circumvent any security or access control measures</li>
        </ul>
      </div>

      {/* Intellectual Property */}
      <div style={{ marginTop: 32 }}>
        <div style={sectionLabel}>Intellectual Property</div>
        <p style={paragraph}>
          The SORCE codebase is open source and available on GitHub under
          its stated licence. The SORCE name, logo, and design system are the property
          of the SORCE project. Article content belongs to the respective original publishers.
        </p>
      </div>

      {/* Disclaimer */}
      <div style={{ marginTop: 32 }}>
        <div style={sectionLabel}>Disclaimer</div>
        <p style={paragraph}>
          SORCE aggregates third-party content and does not editorial-verify
          individual articles in real time. We vet sources, not every story. We are not
          liable for the accuracy, completeness, or legality of content published by
          third-party sources.
        </p>
      </div>

      {/* Changes to These Terms */}
      <div style={{ marginTop: 32 }}>
        <div style={sectionLabel}>Changes to These Terms</div>
        <p style={paragraph}>
          We may update these terms as the platform evolves. Continued use
          of SORCE after changes are posted constitutes acceptance of the revised terms.
        </p>
      </div>

      {/* Contact */}
      <div style={{ marginTop: 32 }}>
        <div style={sectionLabel}>Contact</div>
        <p style={paragraph}>
          Questions about these terms? Open an issue on our GitHub repository.
        </p>
      </div>
    </div>
  );
}
