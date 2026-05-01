import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Authenticated app + auth pages are not crawlable. Page-level
      // robots metadata noindexes them too; this site-level rule blocks
      // crawlers from ever requesting them.
      disallow: [
        "/app",
        "/app/",
        "/signup",
        "/login",
        "/forgot-password",
        "/reset-password",
        "/check-email",
        "/auth/",
        "/api/",
      ],
    },
    sitemap: "https://hioverturn.com/sitemap.xml",
    host: "https://hioverturn.com",
  };
}
