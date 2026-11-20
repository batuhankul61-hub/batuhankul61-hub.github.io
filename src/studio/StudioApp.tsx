import { useEffect, useState } from "react";
import { StudioScene, StudioPhase } from "./StudioScene";
import { Mark } from "./glyphs";
import { content } from "../content";
import { sfx, setMuted, isMuted } from "../sfx";
import { tx } from "../i18n";
import { PlayerDock } from "../player/PlayerDock";
import { useYt, STUDIO_LIST } from "../player/yt";
import "./studio-app.css";

function Intro({ onStart, leaving }: { onStart: () => void; leaving: boolean }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 1400);
    return () => window.clearTimeout(t);
  }, []);
  useEffect(() => {
    if (!ready) return;
    const k = (e: KeyboardEvent) => e.key === "Enter" && onStart();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [ready, onStart]);

  return (
    <div className={"st-intro " + (leaving ? "leaving" : "")}>
      <div className="st-intro-inner">
        <div className="st-mark">
          <Mark size={44} />
        </div>
        {!ready ? (
          <div className="st-progress" aria-label={tx("Yükleniyor", "Loading")}>
            <i />
          </div>
        ) : (
          <>
            <h1 className="st-hello">{tx("Merhaba.", "Hello.")}</h1>
            <p className="st-lead">
              {tx("Ben", "I'm")} {content.name}. {content.title}.
              <br />
              <span>{tx("Masama hoş geldin. Kedi uyuyor, sessiz ol.", "Welcome to my desk. The cat is asleep, keep it down.")}</span>
            </p>
            <button className="st-cta" onClick={onStart} autoFocus>
              {tx("İçeri gir", "Come in")}
            </button>
            <a className="st-cv" href="#cv">
              {tx("ya da özgeçmişi doğrudan gör", "or view the resume directly")} →
            </a>
          </>
        )}
      </div>
    </div>
  );
}

const IconBack = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
    <path d="M15 5l-7 7 7 7" />
  </svg>
);
const IconSound = ({ off }: { off: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M11 5 6 9H3v6h3l5 4z" />
    {off ? <path d="M22 9l-6 6M16 9l6 6" /> : <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />}
  </svg>
);

export function StudioApp() {
  const [phase, setPhase] = useState<StudioPhase>("intro");
  const [intro, setIntro] = useState<"on" | "leaving" | "off">("on");
  const [muted, setMute] = useState(isMuted());
  const { playing } = useYt();

  useEffect(() => {
    const exit = () => setPhase("room");
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPhase((p) => (p === "screen" || p === "player" ? "room" : p));
    };
    window.addEventListener("os:exit", exit);
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("os:exit", exit);
      window.removeEventListener("keydown", key);
    };
  }, []);

  useEffect(() => {
    if (phase === "screen" || phase === "player") document.body.dataset.zoomed = "1";
    else delete document.body.dataset.zoomed;
    return () => {
      delete document.body.dataset.zoomed;
    };
  }, [phase]);

  const start = () => {
    if (intro !== "on") return;
    sfx.unlock();
    sfx.soft();
    setIntro("leaving");
    setPhase("room");
    window.setTimeout(() => setIntro("off"), 900);
  };

  return (
    <div className="st-root">
      <div className="stage">
        <StudioScene
          phase={phase}
          onZoom={() => {
            sfx.tap();
            setPhase("screen");
          }}
          onPlayer={() => {
            sfx.tap();
            setPhase("player");
          }}
        />
      </div>

      {intro === "off" && (
        <PlayerDock mode={phase === "player" ? "panel" : playing ? "mini" : "hidden"} onOpen={() => setPhase("player")} list={STUDIO_LIST} skin="studio" />
      )}

      {intro !== "off" && <Intro onStart={start} leaving={intro === "leaving"} />}

      {intro === "off" && (
        <div className="st-hud">
          {phase === "room" && <div className="st-hint">{tx("Ekrana dokun", "Tap the screen")}</div>}
          {(phase === "screen" || phase === "player") && (
            <button className={"st-pill st-back" + (phase === "player" ? " on-player" : "")} onClick={() => setPhase("room")}>
              <IconBack /> {tx("Masaya dön", "Back to desk")}
            </button>
          )}
          <button
            className="st-pill st-mute"
            aria-label={muted ? tx("Sesi aç", "Unmute") : tx("Sesi kapat", "Mute")}
            onClick={() => {
              setMuted(!muted);
              setMute(!muted);
            }}
          >
            <IconSound off={muted} />
          </button>
        </div>
      )}
    </div>
  );
}
