import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Shell } from "@/components/Shell";
import { site, t } from "@/content/site";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: t.tr.metaTitle,
  description: t.tr.metaDescription,
  alternates: { canonical: "/", languages: { en: "/en/" } },
  openGraph: { title: t.tr.metaTitle, description: t.tr.metaDescription, locale: "tr_TR", type: "website" },
};

export default function Layout({ children }: { children: ReactNode }) {
  return <Shell lang="tr">{children}</Shell>;
}
