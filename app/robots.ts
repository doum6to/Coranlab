import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://www.quranlab.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/blog", "/blog/"],
        disallow: [
          "/learn",
          "/lecons",
          "/courses",
          "/lesson",
          "/settings",
          "/quests",
          "/leaderboard",
          "/premium",
          "/admin",
          "/api",
          "/auth",
          "/onboarding",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
