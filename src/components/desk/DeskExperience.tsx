"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { deskPaths, deskText, modelCredits, type SpotId, spotifyUrl, spots } from "@/content/desk";
import models from "@/content/models.json";
import { projects } from "@/content/projects";
import { type Lang, otherLang, paths, site } from "@/content/site";
import { DesktopOS } from "./DesktopOS";
import type { Phase } from "./Scene";
import "./desk.css";

const Scene = dynamic(() => import("./Scene"), { ssr: false });
const credits = modelCredits(models);

export function DeskExperience({ lang }: { lang: Lang }) {
  const d = deskText[lang];
  const other = otherLang(lang);
  const [phase, setPhase] = useState<Phase>("intro");
  const [osOpen, setOsOpen] = useState(false);
  const [ready, setReady] = useState(false);

  // Let the camera reach the monitor before the desktop fades in.
  useEffect(() => {
    if (phase !== "pc") {
      setOsOpen(false);
      return;
    }
    const id = setTimeout(() => setOsOpen(true), 900);
    return () => clearTimeout(id);
  }, [phase]);

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") setPhase((p) => (p === "intro" ? p : "overview"));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const labels = useMemo(
    () =>
      ({
        pc: d.pc,
        music: spots.music.label[lang],
        collection: spots.collection.label[lang],
        games: spots.games.label[lang],
        football: spots.football.label[lang],
        gym: spots.gym.label[lang],
      }) satisfies Record<SpotId, string>,
    [d.pc, lang],
  );
  const icons = useMemo(() => [d.projectsFolder, ...projects.map((p) => p.name)], [d.projectsFolder]);

  const spot = phase !== "intro" && phase !== "overview" && phase !== "pc" ? spots[phase] : null;

  return (
    <div className="desk-root">
      <div className="desk-canvas">
        <Scene
          phase={phase}
          interactive={phase === "overview"}
          labels={labels}
          screenTitle={site.name}
          screenIcons={icons}
          onSelect={setPhase}
          onReady={() => setReady(true)}
        />
      </div>
      {!ready && (
        <p className="desk-loading" role="status">
          {d.loading}…
        </p>
      )}

      <header className="desk-top">
        <Link href={paths[lang].home} className="desk-chip">
          ← {d.classic}
        </Link>
        <Link href={deskPaths[other]} className="desk-chip" hrefLang={other}>
          {other.toUpperCase()}
        </Link>
      </header>

      {phase === "intro" && (
        <section className="desk-intro">
          <p className="desk-kicker">{site.name}</p>
          <h1>{d.welcome}</h1>
          <p>{d.intro}</p>
          <button type="button" className="btn btn-primary" onClick={() => setPhase("overview")} autoFocus>
            {d.enter}
          </button>
        </section>
      )}

      {phase === "overview" && <p className="desk-hint">{d.hint}</p>}

      {spot && (
        <aside className="desk-panel" key={spot.id}>
          <button type="button" className="desk-chip" onClick={() => setPhase("overview")}>
            ← {d.back}
          </button>
          <p className="desk-kicker">{spot.label[lang]}</p>
          <h2>{spot.title[lang]}</h2>
          <p>{spot.body[lang]}</p>
          {spot.items && (
            <ul className="desk-list">
              {spot.items.map((it) => (
                <li key={it.name}>
                  <strong>{it.name}</strong>
                  <span>{it.note[lang]}</span>
                </li>
              ))}
            </ul>
          )}
          {spot.id === "music" && spotifyUrl && (
            <a href={spotifyUrl} className="btn btn-primary" target="_blank" rel="noreferrer">
              {d.spotify}
            </a>
          )}
        </aside>
      )}

      {credits.length > 0 && phase !== "pc" && (
        <details className="desk-credits">
          <summary>{d.credits}</summary>
          <ul>
            {credits.map((c) => (
              <li key={c.sourceUrl}>
                <a href={c.sourceUrl} target="_blank" rel="noreferrer">
                  {c.title}
                </a>{" "}
                ·{" "}
                <a href={c.authorUrl} target="_blank" rel="noreferrer">
                  {c.author}
                </a>{" "}
                ·{" "}
                <a href={c.licenseUrl} target="_blank" rel="noreferrer">
                  {c.license}
                </a>
              </li>
            ))}
          </ul>
        </details>
      )}

      {phase === "pc" && osOpen && <DesktopOS lang={lang} onClose={() => setPhase("overview")} />}
    </div>
  );
}
