import { ProjectPage, projectMetadata } from "@/components/ProjectPage";
import { projects } from "@/content/projects";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => projects.map((p) => ({ slug: p.slug }));
export const generateMetadata = async ({ params }: Props) => projectMetadata("tr", (await params).slug);

export default async function Page({ params }: Props) {
  return <ProjectPage lang="tr" slug={(await params).slug} />;
}
