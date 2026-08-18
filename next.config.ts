import type { NextConfig } from "next";

// Allow the current Replit development Preview to load Next.js dev assets.
// REPLIT_DEV_DOMAIN is set automatically by Replit in development environments.
// This is not a production access policy — allowedDevOrigins has no effect in
// production builds.
const replitDevHostname = (() => {
  const raw = process.env.REPLIT_DEV_DOMAIN;
  if (!raw) return undefined;
  try {
    // Accept the value with or without a protocol prefix.
    const url = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
    return url.hostname || undefined;
  } catch {
    return undefined;
  }
})();

const nextConfig: NextConfig = {
  ...(replitDevHostname && { allowedDevOrigins: [replitDevHostname] }),
};

export default nextConfig;
