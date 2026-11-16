import type { Project } from "@/content/projects";
import type { Lang } from "@/content/site";

/** Screenshot if the project has one, otherwise a generated typographic cover. */
export function Cover({ project, lang, priority }: { project: Project; lang: Lang; priority?: boolean }) {
  if (project.image) {
    return (
      <div className="cover">
        <img
          src={project.image.src}
          alt={project.image.alt[lang]}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
        />
      </div>
    );
  }
  return (
    <div className="cover cover-gen" style={{ "--h": project.hue } as React.CSSProperties} aria-hidden="true">
      <span className="cover-mark">{project.mark}</span>
      {project.repo && <span className="cover-repo">{project.repo}</span>}
    </div>
  );
}
