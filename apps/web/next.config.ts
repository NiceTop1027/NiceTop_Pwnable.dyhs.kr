import type { NextConfig } from "next";
import { existsSync, readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

function readProductionBuildId(): string {
  if (process.env.BUILD_ID) return process.env.BUILD_ID;
  const buildIdFile = path.join(rootDir, ".build-id");
  if (existsSync(buildIdFile)) {
    return readFileSync(buildIdFile, "utf8").trim();
  }
  return `b${Date.now().toString(36)}`;
}

const productionBuildId = readProductionBuildId();
const productionAssetPrefix =
  process.env.NODE_ENV === "production" ? `/_b/${productionBuildId}` : undefined;

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' https://static.cloudflareinsights.com",
      "script-src-elem 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' https://static.cloudflareinsights.com",
      "script-src-attr 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: http: https:",
      "font-src 'self' data:",
      "connect-src 'self' http: https: ws: wss:",
      "worker-src 'self' blob:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

function resolveApiOrigin() {
  if (process.env.INTERNAL_API_URL) return process.env.INTERNAL_API_URL;
  if (
    process.env.API_URL &&
    process.env.WEB_URL &&
    process.env.API_URL === process.env.WEB_URL &&
    process.env.API_PORT
  ) {
    return `http://localhost:${process.env.API_PORT}`;
  }
  return process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";
}

const apiOrigin = resolveApiOrigin();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  generateBuildId: async () => productionBuildId,
  assetPrefix: productionAssetPrefix,
  turbopack: {
    root: path.join(rootDir, "../.."),
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiOrigin}/api/:path*`,
      },
    ];
  },
  async headers() {
    const headers = [...securityHeaders];
    if (process.env.NODE_ENV === "production") {
      headers.push({
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      });
    }
    return [
      {
        source: "/_b/:build/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
      { source: "/(.*)", headers },
    ];
  },
};

export default nextConfig;
