import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSettings } from "./Layout";
const labels: Record<string, string> = {
  "/": "South Sudan Safari Journeys",
  "/migration": "The Great Nile Migration",
  "/about": "About Us",
  "/safaris": "Safari Itineraries",
  "/gallery": "Photography Gallery",
  "/contact": "Contact Our Team",
  "/book": "Book a Safari",
  "/submit-photo": "Submit Your Safari Photograph",
  "/privacy": "Privacy Policy",
  "/booking-terms": "Booking Terms",
  "/cancellation-policy": "Cancellation Policy",
  "/photo-submission-terms": "Photo Submission Terms",
};
export function SEO() {
  const path = useLocation().pathname,
    s = useSettings();
  useEffect(() => {
    const title = `${labels[path] || "Safari"} | ${s.company_name}`;
    document.title = title;
    for (const [name, content] of [
      ["description", s.seo_description || s.short_description],
      ["og:title", title],
      ["og:description", s.seo_description || s.short_description],
      ["og:type", "website"],
      ["twitter:card", "summary"],
    ]) {
      const property = name.startsWith("og:") ? "property" : "name";
      let tag = document.head.querySelector<HTMLMetaElement>(
        `meta[${property}="${name}"]`,
      );
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute(property, name);
        document.head.append(tag);
      }
      tag.content = content;
    }
    const env = (import.meta as unknown as { env: Record<string, string> }).env;
    let canonical = document.head.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    );
    if (env.VITE_SITE_URL) {
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.rel = "canonical";
        document.head.append(canonical);
      }
      canonical.href = new URL(path, env.VITE_SITE_URL).href;
    } else canonical?.remove();
  }, [path, s]);
  return null;
}
