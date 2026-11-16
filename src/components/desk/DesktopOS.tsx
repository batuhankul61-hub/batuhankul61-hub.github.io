"use client";

import Link from "next/link";
import { type PointerEvent as RPointerEvent, type ReactNode, useEffect, useRef, useState } from "react";
import { deskText, spotifyUrl } from "@/content/desk";
import { projects } from "@/content/projects";
import { type Lang, paths, site, t } from "@/content/site";

type Kind = "projects" | "project" | "demo" | "about" | "contact";
type Win = { id: string; kind: Kind; slug?: string; x: number; y: number };

const Glyph = ({ kind, mark, hue }: { kind: "folder" | "file" | "link" | "app"; mark?: string; hue?: number }) => (
  <span
    className={`os-glyph os-glyph-${kind}`}
    style={hue === undefined ? undefined : { background: `hsl(${hue} 55% 42%)` }}
    aria-hidden="true"
  >
    {mark}
  </span>
);

/** Screenshot slideshow standing in for a live demo inside the desk PC. */
function DemoViewer({ shots, demo, lang }: { shots: { src: string; alt: Record<Lang, string> }[]; demo?: string; lang: Lang }) {
  const d = deskText[lang];
  const [i, setI] = useState(0);
  const go = (n: number) => setI((n + shots.length) % shots.length);
  const shot = shots[i];
  return (
    <div
      className="os-demo"
      tabIndex={0}
      onKeyDown={(ev) => {
        if (ev.key === "ArrowRight") go(i + 1);
        else if (ev.key === "ArrowLeft") go(i - 1);
      }}
    >
      <figure className="os-demo-stage">
        <img key={shot.src} src={shot.src} alt={shot.alt[lang]} />
        {shots.length > 1 && (
          <>
            <button type="button" className="os-demo-nav is-prev" onClick={() => go(i - 1)} aria-label={d.prev}>
              ‹
            </button>
            <button type="button" className="os-demo-nav is-next" onClick={() => go(i + 1)} aria-label={d.next}>
              ›
            </button>
          </>
        )}
      </figure>
      <div className="os-demo-foot">
        <p>{shot.alt[lang]}</p>
        {shots.length > 1 && (
          <div className="os-demo-dots">
            {shots.map((s, n) => (
              <button key={s.src} type="button" aria-label={`${n + 1} / ${shots.length}`} aria-current={n === i} onClick={() => go(n)} />
            ))}
          </div>
        )}
      </div>
      {demo && (
        <div className="os-actions">
          <a href={demo} className="btn btn-primary" target="_blank" rel="noreferrer">
            {d.openLive} ↗
          </a>
        </div>
      )}
    </div>
  );
}

export function DesktopOS({ lang, onClose }: { lang: Lang; onClose: () => void }) {
  const d = deskText[lang];
  const s = t[lang];
  const [wins, setWins] = useState<Win[]>([{ id: "projects", kind: "projects", x: 150, y: 40 }]);
  const [clock, setClock] = useState("");
  const drag = useRef<{ id: string; dx: number; dy: number } | null>(null);

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString(lang === "tr" ? "tr-TR" : "en-GB", { hour: "2-digit", minute: "2-digit" }));
    tick();
    const id = setInterval(tick, 20_000);
    return () => clearInterval(id);
  }, [lang]);

  const open = (kind: Kind, slug?: string) =>
    setWins((ws) => {
      const id = slug ? `${kind}:${slug}` : kind;
      const found = ws.find((w) => w.id === id);
      if (found) return [...ws.filter((w) => w.id !== id), found];
      const n = ws.length;
      return [...ws, { id, kind, slug, x: 190 + n * 34, y: 56 + n * 30 }];
    });
  const close = (id: string) => setWins((ws) => ws.filter((w) => w.id !== id));
  const front = (id: string) =>
    setWins((ws) => (ws[ws.length - 1]?.id === id ? ws : [...ws.filter((w) => w.id !== id), ws.find((w) => w.id === id)!]));

  const onDown = (ev: RPointerEvent<HTMLElement>, w: Win) => {
    if ((ev.target as HTMLElement).closest("button")) return;
    front(w.id);
    drag.current = { id: w.id, dx: ev.clientX - w.x, dy: ev.clientY - w.y };
    ev.currentTarget.setPointerCapture(ev.pointerId);
  };
  const onMove = (ev: RPointerEvent<HTMLElement>) => {
    const g = drag.current;
    if (!g) return;
    const x = Math.max(-200, ev.clientX - g.dx);
    const y = Math.max(0, ev.clientY - g.dy);
    setWins((ws) => ws.map((w) => (w.id === g.id ? { ...w, x, y } : w)));
  };
  const onUp = () => {
    drag.current = null;
  };

  const title = (w: Win) =>
    w.kind === "project" || w.kind === "demo"
      ? `${projects.find((p) => p.slug === w.slug)?.name ?? ""}${w.kind === "demo" ? ` · ${d.screenshots}` : ""}`
      : w.kind === "projects"
        ? d.projectsFolder
        : w.kind === "about"
          ? d.about
          : d.contact;

  const body = (w: Win): ReactNode => {
    if (w.kind === "projects")
      return (
        <ul className="os-files">
          {projects.map((p) => (
            <li key={p.slug}>
              <button type="button" className="os-icon" onClick={() => open("project", p.slug)}>
                {p.logo ? (
                  <img className="os-logo" src={p.logo} alt="" width={44} height={44} decoding="async" />
                ) : (
                  <Glyph kind="file" mark={p.mark} hue={p.hue} />
                )}
                <span>{p.name}</span>
              </button>
            </li>
          ))}
        </ul>
      );
    if (w.kind === "project") {
      const p = projects.find((x) => x.slug === w.slug);
      if (!p) return null;
      return (
        <div className="os-doc">
          {p.image && <img src={p.image.src} alt={p.image.alt[lang]} className="os-shot" />}
          <p className="os-meta">
            {p.year} · {p.status[lang]}
          </p>
          <h3>{p.tagline[lang]}</h3>
          <p>{p.summary[lang]}</p>
          {p.results && (
            <dl className="os-results">
              {p.results.map((r) => (
                <div key={r.value}>
                  <dt>{r.label[lang]}</dt>
                  <dd>{r.value}</dd>
                </div>
              ))}
            </dl>
          )}
          <ul className="chips">
            {p.stack.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
          <div className="os-actions">
            <Link href={paths[lang].project(p.slug)} prefetch={false} className="btn btn-primary">
              {d.openProject}
            </Link>
            {p.repo && (
              <a href={`${site.github}/${p.repo}`} className="btn" target="_blank" rel="noreferrer">
                GitHub
              </a>
            )}
            {p.shots ? (
              <button type="button" className="btn" onClick={() => open("demo", p.slug)}>
                {p.demo ? s.project.demo : d.screenshots}
              </button>
            ) : (
              p.demo && (
                <a href={p.demo} className="btn" target="_blank" rel="noreferrer">
                  {s.project.demo} ↗
                </a>
              )
            )}
          </div>
        </div>
      );
    }
    if (w.kind === "demo") {
      const p = projects.find((x) => x.slug === w.slug);
      if (!p?.shots) return null;
      return <DemoViewer shots={p.shots} demo={p.demo} lang={lang} />;
    }
    if (w.kind === "about")
      return (
        <div className="os-doc os-text">
          <p className="os-meta">{s.role}</p>
          <h3>{site.name}</h3>
          <p>{s.heroLead}</p>
          <p className="os-meta">{site.location[lang]}</p>
        </div>
      );
    return (
      <div className="os-doc">
        <h3>{s.contactTitle}</h3>
        <p>{s.contactLead}</p>
        <div className="os-actions">
          <a href={site.linkedin} className="btn btn-primary" target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <a href={site.github} className="btn" target="_blank" rel="noreferrer">
            GitHub
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className="os" role="dialog" aria-label={d.desktopTitle}>
      <ul className="os-desktop">
        <li>
          <button type="button" className="os-icon" onClick={() => open("projects")}>
            <Glyph kind="folder" />
            <span>{d.projectsFolder}</span>
          </button>
        </li>
        <li>
          <button type="button" className="os-icon" onClick={() => open("about")}>
            <Glyph kind="file" mark="txt" />
            <span>{d.about}</span>
          </button>
        </li>
        <li>
          <button type="button" className="os-icon" onClick={() => open("contact")}>
            <Glyph kind="app" mark="@" />
            <span>{d.contact}</span>
          </button>
        </li>
        <li>
          <a className="os-icon" href={site.github} target="_blank" rel="noreferrer">
            <Glyph kind="link" mark="git" />
            <span>GitHub</span>
          </a>
        </li>
        {spotifyUrl && (
          <li>
            <a className="os-icon" href={spotifyUrl} target="_blank" rel="noreferrer">
              <Glyph kind="link" mark="♪" hue={141} />
              <span>Spotify</span>
            </a>
          </li>
        )}
      </ul>

      {wins.map((w, i) => (
        <section
          key={w.id}
          className={`os-win os-win-${w.kind}`}
          style={{ left: w.x, top: w.y, zIndex: 10 + i }}
          onPointerDown={() => front(w.id)}
          aria-label={title(w)}
        >
          <header className="os-bar" onPointerDown={(ev) => onDown(ev, w)} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
            <span className="os-bar-title">{title(w)}</span>
            <button type="button" className="os-x" onClick={() => close(w.id)} aria-label={`${title(w)} ×`}>
              ×
            </button>
          </header>
          <div className="os-body">{body(w)}</div>
        </section>
      ))}

      <footer className="os-taskbar">
        <button type="button" className="os-start" onClick={onClose}>
          ← {d.shutdown}
        </button>
        <div className="os-tabs">
          {wins.map((w) => (
            <button key={w.id} type="button" className={w.id === wins[wins.length - 1].id ? "is-front" : undefined} onClick={() => front(w.id)}>
              {title(w)}
            </button>
          ))}
        </div>
        <span className="os-clock">{clock}</span>
      </footer>
    </div>
  );
}
