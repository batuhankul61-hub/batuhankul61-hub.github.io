import Link from "next/link";
import type { Metadata } from "next";
import { getProject, projects } from "@/content/projects";
import { type Lang, paths, site, t } from "@/content/site";
import { Cover } from "./Cover";
import { Footer, Header } from "./Header";

export function projectMetadata(lang: Lang, slug: string): Metadata {
  const p = getProject(slug);
  if (!p) return {};
  const other: Lang = lang === "tr" ? "en" : "tr";
  return {
    title: `${p.name} · ${site.name}`,
    description: p.tagline[lang],
    alternates: {
      canonical: paths[lang].project(slug),
      languages: { [other]: paths[other].project(slug) },
    },
    openGraph: { title: p.name, description: p.tagline[lang], images: p.image ? [p.image.src] : undefined },
  };
}

export function ProjectPage({ lang, slug }: { lang: Lang; slug: string }) {
  const p = getProject(slug)!;
  const s = t[lang];
  const other: Lang = lang === "tr" ? "en" : "tr";
  const idx = projects.indexOf(p);
  const next = projects[(idx + 1) % projects.length];
  const repoUrl = p.repo ? `${site.github}/${p.repo}` : undefined;

  return (
    <>
      <Header lang={lang} altHref={paths[other].project(slug)} />
      <main className="container project">
        <Link href={`${paths[lang].home}#work`} className="back">
          ← {s.project.back}
        </Link>

        <header className="project-head reveal">
          <h1>{p.name}</h1>
          <p className="lead">{p.tagline[lang]}</p>
          <div className="actions">
            {repoUrl && (
              <a href={repoUrl} className="btn btn-primary" target="_blank" rel="noreferrer">
                {s.project.source} ↗
              </a>
            )}
            {p.demo && (
              <a href={p.demo} className="btn" target="_blank" rel="noreferrer">
                {s.project.demo} ↗
              </a>
            )}
          </div>
        </header>

        <dl className="meta">
          <div>
            <dt>{s.project.year}</dt>
            <dd>{p.year}</dd>
          </div>
          <div>
            <dt>{s.project.status}</dt>
            <dd>{p.status[lang]}</dd>
          </div>
          <div className="meta-wide">
            <dt>{s.project.stack}</dt>
            <dd>{p.stack.join(" · ")}</dd>
          </div>
        </dl>

        {p.results && (
          <dl className="metrics metrics-project" aria-label={s.project.results}>
            {p.results.map((r) => (
              <div key={r.value}>
                <dt>{r.label[lang]}</dt>
                <dd>{r.value}</dd>
              </div>
            ))}
          </dl>
        )}

        <Cover project={p} lang={lang} priority />

        <div className="project-body">
          <div className="prose">
            <p>{p.summary[lang]}</p>
            {p.credit && <p className="muted small">{p.credit[lang]}</p>}
          </div>
          <div>
            <h2 className="mono-label">{s.project.highlights}</h2>
            <ul className="highlights">
              {p.highlights[lang].map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </div>
        </div>

        {p.gallery?.map((g) => (
          <div className="cover" key={g.src}>
            <img src={g.src} alt={g.alt[lang]} loading="lazy" decoding="async" />
          </div>
        ))}

        <Link href={paths[lang].project(next.slug)} className="next">
          <span className="mono-label">{s.project.next}</span>
          <span className="next-name">{next.name} →</span>
        </Link>
      </main>
      <Footer lang={lang} />
    </>
  );
}
