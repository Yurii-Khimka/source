/**
 * Returns the best available logo URL for a source.
 * Priority: logo_url > favicon from site_url > null (use initials)
 */
export function getSourceLogoUrl(
  logoUrl: string | null | undefined,
  siteUrl: string | null | undefined
): string | null {
  if (logoUrl) return logoUrl;
  if (siteUrl) {
    try {
      const domain = new URL(siteUrl).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch {
      return null;
    }
  }
  return null;
}
