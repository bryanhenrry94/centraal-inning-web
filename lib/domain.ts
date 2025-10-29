export function getSubdomain(hostname?: string) {
  if (!hostname) return null;

  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || "localhost:3000";
  const cleanHost = hostname.split(":")[0];

  if (cleanHost === baseDomain || cleanHost === "localhost") {
    return null;
  }

  const parts = cleanHost.split(".");
  return parts.length >= 2 ? parts[0] : null;
}
