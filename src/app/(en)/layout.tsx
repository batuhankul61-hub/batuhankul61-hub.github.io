import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Shell } from "@/components/Shell";
import { site, t } from "@/content/site";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: t.en.metaTitle,
  description: t.en.metaDescription,
  alternates: { canonical: "/en/", languages: { tr: "/" } },
  openGraph: { title: t.en.metaTitle, description: t.en.metaDescription, locale: "en_US", type: "website" },
};

export default function Layout({ children }: { children: ReactNode }) {
  return <Shell lang="en">{children}</Shell>;
}
