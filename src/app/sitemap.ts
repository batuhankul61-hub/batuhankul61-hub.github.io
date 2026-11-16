import type { MetadataRoute } from "next";
import { deskPaths } from "@/content/desk";
import { projects } from "@/content/projects";
import { paths, site } from "@/content/site";

export const dynamic = "force-static";

const pair = (tr: string, en: string, priority: number): MetadataRoute.Sitemap =>
  [tr, en].map((p) => ({
    url: site.url + p,
    priority,
    alternates: { languages: { tr: site.url + tr, en: site.url + en } },
  }));

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...pair(paths.tr.home, paths.en.home, 1),
    ...projects.flatMap((p) => pair(paths.tr.project(p.slug), paths.en.project(p.slug), 0.8)),
    ...pair(deskPaths.tr, deskPaths.en, 0.5),
  ];
}
