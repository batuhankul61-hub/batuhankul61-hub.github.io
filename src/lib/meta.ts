import type { Metadata } from "next";
import { type Lang, site, t } from "@/content/site";

export const ogImage = { url: "/og.png", width: 1200, height: 630, alt: site.name };

/** Shared head tags for every page in a language tree; pages override title, description and URLs. */
export function rootMetadata(lang: Lang): Metadata {
  const s = t[lang];
  return {
    metadataBase: new URL(site.url),
    title: s.metaTitle,
    description: s.metaDescription,
    alternates: lang === "tr" ? { canonical: "/", languages: { en: "/en/" } } : { canonical: "/en/", languages: { tr: "/" } },
    icons: {
      icon: [
        { url: "/icon.svg", type: "image/svg+xml" },
        { url: "/icon.png", type: "image/png", sizes: "512x512" },
      ],
      apple: "/apple-touch-icon.png",
    },
    openGraph: {
      title: s.metaTitle,
      description: s.metaDescription,
      siteName: site.name,
      locale: lang === "tr" ? "tr_TR" : "en_US",
      type: "website",
      images: [ogImage],
    },
    twitter: { card: "summary_large_image", title: s.metaTitle, description: s.metaDescription, images: [ogImage.url] },
  };
}

/** schema.org Person so search engines tie the name to the profiles. */
export function personJsonLd(lang: Lang) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    url: site.url + (lang === "tr" ? "/" : "/en/"),
    image: `${site.url}/avatar.jpg`,
    jobTitle: t[lang].role,
    address: { "@type": "PostalAddress", addressLocality: "İstanbul", addressCountry: "TR" },
    alumniOf: { "@type": "CollegeOrUniversity", name: "Yıldız Technical University" },
    sameAs: [site.github, site.linkedin],
  };
}

/** Head tags for the 3D desk page. */
export function deskMetadata(lang: Lang, d: { welcome: string; intro: string }, url: string, alt: string): Metadata {
  const title = `${d.welcome} · ${site.name}`;
  return {
    title,
    description: d.intro,
    alternates: { canonical: url, languages: { [lang === "tr" ? "en" : "tr"]: alt } },
    openGraph: { title, description: d.intro, siteName: site.name, type: "website", url, images: [ogImage] },
    twitter: { card: "summary_large_image", title, description: d.intro, images: [ogImage.url] },
  };
}

/** JSON-LD ready for a <script> tag: "<" is escaped so the payload can never close the tag. */
export const personJsonLdHtml = (lang: Lang) => JSON.stringify(personJsonLd(lang)).replace(/</g, "\\u003c");
