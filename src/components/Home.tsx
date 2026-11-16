import Link from "next/link";
import { deskPaths, deskText } from "@/content/desk";
import { projects } from "@/content/projects";
import {
  certification,
  education,
  experience,
  type Lang,
  languages,
  metrics,
  paths,
  site,
  stack,
  t,
} from "@/content/site";
import { Cover } from "./Cover";
import { Footer, Header } from "./Header";

export const Arrow = () => (
  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
    <path d="M4 12 12 4M6 4h6v6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export function Home({ lang }: { lang: Lang }) {
  const s = t[lang];
  const other: Lang = lang === "tr" ? "en" : "tr";

  return (
    <>
      <Header lang={lang} altHref={paths[other].home} />
      <main>
        <section className="hero container">
          <p className="pill reveal">
            <span className="dot" />
            {s.role} · {site.location[lang]}
          </p>
          <h1 className="hero-title reveal" style={{ animationDelay: "60ms" }}>
            {s.heroTitle.map((line, i) => (
              <span key={i} className={i === s.heroTitle.length - 1 ? "dim" : undefined}>
                {line}
              </span>
            ))}
          </h1>
          <p className="lead reveal" style={{ animationDelay: "120ms" }}>
            {s.heroLead}
          </p>
          <div className="actions reveal" style={{ animationDelay: "180ms" }}>
            <a href="#work" className="btn btn-primary">
              {s.ctaWork}
            </a>
            <Link href={deskPaths[lang]} className="btn">
              {deskText[lang].welcome}
            </Link>
            <a href={site.linkedin} className="btn" target="_blank" rel="noreferrer">
              {s.ctaLinkedin} <Arrow />
            </a>
            <a href={site.github} className="btn" target="_blank" rel="noreferrer">
              {s.ctaGithub} <Arrow />
            </a>
          </div>

          <dl className="metrics reveal" style={{ animationDelay: "240ms" }} aria-label={s.metricsLabel}>
            {metrics.map((m) => (
              <div key={m.value}>
                <dt>{m.label[lang]}</dt>
                <dd>{m.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section id="work" className="section container">
          <div className="section-head">
            <h2>{s.workTitle}</h2>
            <p className="muted">{s.workLead}</p>
          </div>
          <div className="grid">
            {projects.map((p, i) => (
              <Link
                key={p.slug}
                href={paths[lang].project(p.slug)}
                className={`card${p.wide ? " card-wide" : ""}${p.half ? " card-half" : ""}`}
              >
                <Cover project={p} lang={lang} priority={i < 2} />
                <div className="card-body">
                  <div className="card-top">
                    <h3>{p.name}</h3>
                    <span className="tag">{p.status[lang]}</span>
                  </div>
                  <p className="muted">{p.tagline[lang]}</p>
                  {p.wide && p.results && (
                    <dl className="card-results">
                      {p.results.map((r) => (
                        <div key={r.value}>
                          <dd>{r.value}</dd>
                          <dt>{r.label[lang]}</dt>
                        </div>
                      ))}
                    </dl>
                  )}
                  <ul className="chips">
                    {p.stack.slice(0, p.wide ? 6 : 4).map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section id="experience" className="section container">
          <div className="section-head">
            <h2>{s.experienceTitle}</h2>
          </div>
          <ol className="timeline">
            {experience.map((job) => (
              <li key={job.company + job.start} className="job">
                <div className="job-when mono-label">
                  {job.start} – {job.end ?? s.present}
                </div>
                <div className="job-main">
                  <h3>{job.role[lang]}</h3>
                  <p className="job-org">
                    {job.company} <span className="muted">· {job.place}</span>
                  </p>
                  <ul className="highlights">
                    {job.bullets[lang].map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>

          <div className="edu">
            <div>
              <h3 className="mono-label">{s.educationTitle}</h3>
              {education.map((e) => (
                <div key={e.start} className="edu-item">
                  <p className="edu-head">
                    <strong>{e.school[lang]}</strong>
                    <span className="mono-label">
                      {e.start} – {e.end ?? s.present}
                    </span>
                  </p>
                  <p>{e.degree[lang]}</p>
                  <p className="muted small">{e.note[lang]}</p>
                </div>
              ))}
            </div>
            <div className="edu-side">
              <div>
                <h3 className="mono-label">{s.languagesTitle}</h3>
                <ul className="plain">
                  {languages.map((l) => (
                    <li key={l.name.en}>
                      {l.name[lang]} <span className="muted">· {l.level[lang]}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="mono-label">{s.certTitle}</h3>
                <p className="small">{certification[lang]}</p>
              </div>
            </div>
          </div>
        </section>

        <section id="stack" className="section container">
          <div className="section-head">
            <h2>{s.stackTitle}</h2>
          </div>
          <div className="stack">
            {stack.map((g) => (
              <div key={g.group.en} className="stack-group">
                <h3 className="mono-label">{g.group[lang]}</h3>
                <ul className="chips">
                  {g.items.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section id="contact" className="section container">
          <div className="contact">
            <h2>{s.contactTitle}</h2>
            <p className="muted">{s.contactLead}</p>
            <div className="actions">
              <a href={site.linkedin} className="btn btn-primary" target="_blank" rel="noreferrer">
                LinkedIn <Arrow />
              </a>
              <a href={site.github} className="btn" target="_blank" rel="noreferrer">
                GitHub <Arrow />
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer lang={lang} />
    </>
  );
}
