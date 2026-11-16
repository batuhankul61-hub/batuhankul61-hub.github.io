import type { Metadata } from "next";
import { DeskExperience } from "@/components/desk/DeskExperience";
import { deskText } from "@/content/desk";

export const metadata: Metadata = {
  title: `${deskText.en.welcome} · Batuhan Kul`,
  description: deskText.en.intro,
  alternates: { canonical: "/en/desk/", languages: { tr: "/masa/" } },
};

export default function Page() {
  return <DeskExperience lang="en" />;
}
