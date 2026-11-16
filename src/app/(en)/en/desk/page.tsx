import { DeskExperience } from "@/components/desk/DeskExperience";
import { deskPaths, deskText } from "@/content/desk";
import { otherLang } from "@/content/site";
import { deskMetadata } from "@/lib/meta";

export const metadata = deskMetadata("en", deskText.en, deskPaths.en, deskPaths[otherLang("en")]);

export default function Page() {
  return <DeskExperience lang="en" />;
}
