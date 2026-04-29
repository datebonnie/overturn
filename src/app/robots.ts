import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://hioverturn.com/sitemap.xml",
    host: "https://hioverturn.com",
  };
}
