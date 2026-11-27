import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

// Build note: the font declarations in app/layout.tsx changed on purpose, so the
// font stylesheet is compiled afresh and matches the classes in the pages.
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enables instrumentation.ts (runs the DB security lockdown at server start).
  experimental: { instrumentationHook: true },
  // Image optimization: prefer AVIF, fallback WebP
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    deviceSizes: [360, 480, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 24, 32, 48, 64, 96, 128, 200, 256, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "geeipdnizshcpdmcgvdv.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },

  // Modular imports cut the client bundle by only importing what's used
  modularizeImports: {
    "lucide-react": {
      transform: "lucide-react/dist/esm/icons/{{kebabCase member}}",
      preventFullImport: true,
    },
  },

  // Aggressive compression
  compress: true,

  // Production source maps off to shrink payload
  productionBrowserSourceMaps: false,

  // Strict mode for cleaner renders
  reactStrictMode: true,

  async headers() {
    return [
      {
        source: "/api/(.*)",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
          {
            key: "Content-Range",
            value: "bytes : 0-9/*",
          },
        ],
      },
      // Long-term caching for static assets
      {
        source: "/:all*(svg|jpg|jpeg|png|webp|avif|gif|ico|woff|woff2)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Word clips: kept a day by the browser, then refreshed in the background. Not "immutable":
      // a clip recorded again keeps its file name.
      {
        source: "/audio/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
      // Cache Rive animations
      {
        source: "/animations/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
