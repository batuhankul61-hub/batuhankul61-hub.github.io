import type { Metadata } from "next";
import { DeskExperience } from "@/components/desk/DeskExperience";
import { deskText } from "@/content/desk";

export const metadata: Metadata = {
  title: `${deskText.tr.welcome} · Batuhan Kul`,
  description: deskText.tr.intro,
  alternates: { canonical: "/masa/", languages: { en: "/en/desk/" } },
};

export default function Page() {
  return <DeskExperience lang="tr" />;
}
