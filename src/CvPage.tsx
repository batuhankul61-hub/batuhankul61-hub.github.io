import { useEffect } from "react";
import { content } from "./content";
import { tx } from "./i18n";
import "./cv.css";

/* Hızlı CV: 3D sahneyi hiç yüklemeden, tek sayfada okunabilen ve
   yazdırılabilen (PDF olarak kaydedilebilen) özgeçmiş. Adres: #cv */

const host = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
const abs = (url: string) => (url.startsWith("/") ? window.location.origin + url : url);

export function CvPage({ backHref }: { backHref: string }) {
  const c = content;

  useEffect(() => {
    document.body.dataset.cv = "1";
    window.scrollTo(0, 0);
    return () => {
      delete document.body.dataset.cv;
    };
  }, []);

  return (
    <div className="cv-root">
      <div className="cv-bar" role="toolbar" aria-label={tx("Özgeçmiş araçları", "Resume tools")}>
        <a className="cv-bar-btn" href={backHref}>
          ← {tx("Etkileşimli siteye dön", "Back to interactive site")}
        </a>
        <button className="cv-bar-btn primary" onClick={() => window.print()}>
          {tx("PDF olarak kaydet", "Save as PDF")}
        </button>
      </div>

      <article className="cv-paper">
        <header className="cv-head">
          <img className="cv-avatar" src={c.avatar} alt="" width={84} height={84} />
          <div>
            <h1>{c.name}</h1>
            <p className="cv-title">{c.title}</p>
            <p className="cv-meta">{c.location}</p>
            <p className="cv-links">
              {c.email && <a href={`mailto:${c.email}`}>{c.email}</a>}
              {c.socials.map((s) => (
                <a key={s.label} href={s.url} target="_blank" rel="noreferrer">
                  {s.label}: {host(s.url)}
                </a>
              ))}
            </p>
          </div>
        </header>

        <p className="cv-lead">{c.headline}</p>

        <ul className="cv-metrics">
          {c.metrics.map((m) => (
            <li key={m.label}>
              <b>{m.value}</b>
              <span>{m.label}</span>
            </li>
          ))}
        </ul>

        <section>
          <h2>{tx("Deneyim", "Experience")}</h2>
          {c.experience.map((j) => (
            <div key={j.role + j.company} className="cv-item">
              <div className="cv-row">
                <h3>{j.role}</h3>
                <span className="cv-date">{j.period}</span>
              </div>
              <p className="cv-sub">
                {j.company} · {j.place}
              </p>
              <ul>
                {j.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section>
          <h2>{tx("Seçili projeler", "Selected projects")}</h2>
          <div className="cv-projects">
            {c.projects.map((p) => (
              <div key={p.slug} className="cv-project">
                <div className="cv-row">
                  <h3>{p.title}</h3>
                  <span className="cv-date">
                    {p.year} · {p.status}
                  </span>
                </div>
                <p>{p.tagline}</p>
                {p.results && (
                  <p className="cv-results">
                    {p.results.map((r) => `${r.value} ${r.label}`).join(" · ")}
                  </p>
                )}
                <p className="cv-tags">{p.tags.join(" · ")}</p>
                {(p.repo || p.demo) && (
                  <p className="cv-plinks">
                    {p.demo && (
                      <a href={abs(p.demo)} target="_blank" rel="noreferrer">
                        {tx("Canlı demo", "Live demo")}
                      </a>
                    )}
                    {p.repo && (
                      <a href={p.repo} target="_blank" rel="noreferrer">
                        {tx("Kaynak kod", "Source code")}
                      </a>
                    )}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2>{tx("Eğitim", "Education")}</h2>
          {c.education.map((e) => (
            <div key={e.school} className="cv-item">
              <div className="cv-row">
                <h3>{e.school}</h3>
                <span className="cv-date">{e.period}</span>
              </div>
              <p className="cv-sub">{e.degree}</p>
              <p className="cv-note">{e.note}</p>
            </div>
          ))}
        </section>

        <section>
          <h2>{tx("Yetenekler", "Skills")}</h2>
          <dl className="cv-skills">
            {c.skillGroups.map((g) => (
              <div key={g.group}>
                <dt>{g.group}</dt>
                <dd>{g.items.join(", ")}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="cv-two">
          <div>
            <h2>{tx("Diller", "Languages")}</h2>
            <p>{c.languages.map((l) => `${l.name} (${l.level})`).join(" · ")}</p>
          </div>
          <div>
            <h2>{tx("Sertifika", "Certification")}</h2>
            <p>{c.certification}</p>
          </div>
        </section>

        <footer className="cv-foot">
          {tx("Etkileşimli portfolyo", "Interactive portfolio")}: {host(window.location.origin + window.location.pathname)}
        </footer>
      </article>
    </div>
  );
}
