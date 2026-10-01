import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactStrictMode: true,

  async redirects() {
    return [
      // While Pondicherry is the only region, /temples means its temples.
      // When a second region exists, /temples becomes the list of regions.
      { source: "/temples", destination: "/pondicherry", permanent: false },
      // A temple's History page became "The Temple and its Stories" (October 2026).
      { source: "/:region/:temple/history", destination: "/:region/:temple/temple-and-its-stories", permanent: true },
    ];
  },

  // Payload's source imports use ".js" endings for TypeScript files.
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      ".cjs": [".cts", ".cjs"],
      ".js": [".ts", ".tsx", ".js", ".jsx"],
      ".mjs": [".mts", ".mjs"],
    };
    return webpackConfig;
  },

  turbopack: { root: path.resolve(dirname) },

  // Building against the local database: fewer parallel workers, so they
  // don't crowd its connections. (With Neon, the default.)
  experimental: process.env.PGLITE_DIR ? { cpus: 2 } : {},
};

// Adds the admin (/admin) and its API (/api) to the site.
export default withPayload(nextConfig, { devBundleServerPackages: false });
