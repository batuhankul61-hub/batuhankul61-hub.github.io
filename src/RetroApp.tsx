import { useEffect, useState } from "react";
import { Experience, Phase } from "./scene/Experience";
import { content } from "./content";
import { sfx, setMuted } from "./sfx";
import { tx } from "./i18n";
import { PlayerDock } from "./player/PlayerDock";
import { useYt, RETRO_LIST } from "./player/yt";

const biosLines = () => [
  `${content.osName} BIOS v4.20, (C) 1998 ${tx("Makara Yazılım A.Ş.", "Makara Software Inc.")}`,
  "",
  tx("İşlemci : Pentium-ish 233 MHz", "CPU : Pentium-ish 233 MHz"),
  tx("Bellek testi : %RAM% KB OK", "Memory test : %RAM% KB OK"),
  "",
  tx("Klavye algılandı ............ OK", "Keyboard detected ........... OK"),
  tx("Fare algılandı .............. OK (biraz tozlu)", "Mouse detected .............. OK (a bit dusty)"),
  tx("Kedi algılandı .............. UYUYOR", "Cat detected ................ ASLEEP"),
  tx("Kahve seviyesi .............. %12  [UYARI]", "Coffee level ................ 12%  [WARNING]"),
  tx("Motivasyon sürücüsü ......... yükleniyor...", "Motivation driver ........... loading..."),
  tx("Disket A: ................... 'yedek??' bulundu", "Floppy A: ................... 'backup??' found"),
  "",
  tx("Önyükleme aygıtı hazır.", "Boot device ready."),
];

function Boot({ onStart }: { onStart: () => void }) {
  const [shown, setShown] = useState(0);
  const [ram, setRam] = useState(0);
  const lines = biosLines();
  const done = shown >= lines.length;

  useEffect(() => {
    if (done) return;
    const t = window.setTimeout(() => setShown((s) => s + 1), shown === 3 ? 700 : 160 + Math.random() * 180);
    return () => window.clearTimeout(t);
  }, [shown, done]);

  useEffect(() => {
    if (shown < 4 || ram >= 65536) return;
    const t = window.setTimeout(() => setRam((r) => Math.min(65536, r + 2048)), 18);
    return () => window.clearTimeout(t);
  }, [shown, ram]);

  useEffect(() => {
    if (!done) return;
    const k = (e: KeyboardEvent) => e.key === "Enter" && onStart();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [done, onStart]);

  return (
    <div className="boot" onClick={() => done && onStart()}>
      <a className="boot-cv" href="#cv" onClick={(e) => e.stopPropagation()}>
        {tx("Acelen mi var? Özgeçmişi doğrudan gör →", "In a hurry? View the resume directly →")}
      </a>
      <div className="boot-energy" aria-hidden="true">
        <span>{tx("Enerji", "Energy")}</span>
        <b>{tx("Dostu", "Friendly")}</b>
        <small>{tx("(kahve hariç)", "(except coffee)")}</small>
      </div>
      <pre className="boot-text">
        {lines.slice(0, shown)
          .map((l) => l.replace("%RAM%", String(ram)))
          .join("\n")}
        {!done && <span className="cursor">_</span>}
      </pre>
      {done && (
        <div className="boot-start">
          <p>{tx("Portfolyoya girmek için tıkla ya da ENTER'a bas", "Click or press ENTER to enter the portfolio")}</p>
          <button className="boot-btn" onClick={onStart} autoFocus>
            {tx("BAŞLAT", "START")}
          </button>
        </div>
      )}
    </div>
  );
}

export function RetroApp() {
  const [phase, setPhase] = useState<Phase>("boot");
  const [booting, setBooting] = useState(true);
  const [muted, setMute] = useState(false);
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
    sfx.unlock();
    sfx.beep();
    setBooting(false);
    setPhase("room");
  };

  return (
    <>
      <div className="stage">
        <Experience
          phase={phase}
          onZoom={() => {
            sfx.click();
            setPhase("screen");
          }}
          onPlayer={() => {
            sfx.click();
            setPhase("player");
          }}
        />
      </div>

      {!booting && (
        <PlayerDock mode={phase === "player" ? "panel" : playing ? "mini" : "hidden"} onOpen={() => setPhase("player")} list={RETRO_LIST} skin="retro" />
      )}

      {booting && <Boot onStart={start} />}

      {!booting && (
        <div className="hud">
          {phase === "room" && <div className="hint">{tx("Monitöre tıkla", "Click the monitor")} <span className="cursor">_</span></div>}
          {(phase === "screen" || phase === "player") && (
            <button className={"hud-btn back" + (phase === "player" ? " on-player" : "")} onClick={() => setPhase("room")}>
              ← {tx("Masaya dön", "Back to desk")} <kbd>ESC</kbd>
            </button>
          )}
          <button
            className="hud-btn mute"
            aria-label={muted ? tx("Sesi aç", "Unmute") : tx("Sesi kapat", "Mute")}
            onClick={() => {
              setMuted(!muted);
              setMute(!muted);
            }}
          >
            {muted ? "🔇" : "🔊"}
          </button>
        </div>
      )}
    </>
  );
}
