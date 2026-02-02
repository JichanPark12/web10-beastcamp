import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/_next/",
        "/api/",
        "/reservations/",
        "/result/",
        "/waiting-queue/",
      ],
    },
    sitemap: "https://www.neticket.site/sitemap.xml",
  };
}
