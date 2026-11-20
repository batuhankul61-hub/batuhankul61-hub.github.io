import { useCallback, useEffect, useRef, useState } from "react";
import { APPS, AppId, AppCtx } from "./apps";
import { content } from "../content";
import { sfx } from "../sfx";
import { locale, setLang, tx, useLang } from "../i18n";
import "./os.css";

type Win = { id: AppId; x: number; y: number; z: number; min: boolean; max: boolean };

const SCREEN_W = 1024;
const SCREEN_H = 768;
const TASKBAR_H = 36;

function Clock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 10_000);
    return () => window.clearInterval(t);
  }, []);
  return <div className="clock sunken">{now.toLocaleTimeString(locale(), { hour: "2-digit", minute: "2-digit" })}</div>;
}

function Screensaver() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let x = 120,
      y = 90,
      vx = 1.6,
      vy = 1.2,
      hue = 0,
      raf = 0;
    const tick = () => {
      const el = ref.current;
      if (el) {
        const w = el.offsetWidth,
          h = el.offsetHeight;
        x += vx;
        y += vy;
        if (x < 0 || x + w > SCREEN_W) {
          vx *= -1;
          hue = (hue + 70) % 360;
        }
        if (y < 0 || y + h > SCREEN_H) {
          vy *= -1;
          hue = (hue + 70) % 360;
        }
        el.style.transform = `translate(${x}px, ${y}px)`;
        el.style.color = `hsl(${hue}, 90%, 65%)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div className="screensaver">
      <div ref={ref} className="ss-logo">
        <div className="ss-title">{content.osName}</div>
        <div className="ss-sub">{tx("ekrana tıkla", "click the screen")}</div>
      </div>
    </div>
  );
}

function Splash({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = window.setTimeout(onDone, 2200);
    return () => window.clearTimeout(t);
  }, [onDone]);
  return (
    <div className="splash">
      <div className="splash-logo">
        <div className="flag" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>
        <div>
          <div className="splash-title">
            Makara<b>OS</b>
            <sup>98</sup>
          </div>
          <div className="splash-sub">{tx("Ciddi İşler İçin Ciddiyetsiz Sistem", "A Silly System for Serious Work")}</div>
        </div>
      </div>
      <div className="splash-bar">
        <div />
      </div>
      <div className="splash-foot">{tx("Kediler yükleniyor…", "Loading cats…")}</div>
    </div>
  );
}

function Crash({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = window.setTimeout(onDone, 4200);
    return () => window.clearTimeout(t);
  }, [onDone]);
  return (
    <div className="crash" onClick={onDone}>
      <div className="crash-box">
        <p className="crash-tag"> {content.osName} </p>
        <p>{tx("KRİTİK HATA 0xC0FFEE: Kahve seviyesi sıfıra ulaştı.", "FATAL ERROR 0xC0FFEE: Coffee level has reached zero.")}</p>
        <p>{tx("Sistem bir mola vermeye karar verdi. Bu tamamen senin suçun.", "The system has decided to take a break. This is entirely your fault.")}</p>
        <p>{tx("* Devam etmek için herhangi bir yere tıkla.", "* Click anywhere to continue.")}</p>
        <p>{tx("* Kediyi suçlamak için iki kere tıkla.", "* Double-click to blame the cat.")}</p>
        <p className="blink">{tx("Yeniden başlatılıyor_", "Restarting_")}</p>
      </div>
    </div>
  );
}

export function RetroOS({ active }: { active: boolean }) {
  const lang = useLang();
  const [stage, setStage] = useState<"saver" | "splash" | "desktop" | "crash">("saver");
  const [wins, setWins] = useState<Win[]>([]);
  const zRef = useRef(10);
  const nextZ = () => ++zRef.current;
  const [startOpen, setStartOpen] = useState(false);
  const [selected, setSelected] = useState<AppId | null>(null);
  const [wallpaper, setWallpaper] = useState("wp-sea");
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (active && stage === "saver") setStage("splash");
  }, [active, stage]);

  const finishSplash = useCallback(() => {
    sfx.chime();
    setStage("desktop");
    setWins([{ id: "readme", x: 300, y: 120, z: nextZ(), min: false, max: false }]);
  }, []);

  const focus = (id: AppId) => {
    const nz = nextZ();
    setWins((ws) => ws.map((w) => (w.id === id ? { ...w, z: nz, min: false } : w)));
  };

  const open = (id: AppId) => {
    setStartOpen(false);
    const existing = wins.find((w) => w.id === id);
    if (existing) {
      focus(id);
      return;
    }
    sfx.open();
    const app = APPS.find((a) => a.id === id)!;
    const n = wins.length;
    const x = Math.min(SCREEN_W - app.w - 10, 140 + n * 28);
    const y = Math.min(SCREEN_H - TASKBAR_H - app.h - 10, 40 + n * 24);
    const nz = nextZ();
    setWins((ws) => [...ws, { id, x: Math.max(0, x), y: Math.max(0, y), z: nz, min: false, max: false }]);
  };

  const close = (id: AppId) => {
    sfx.close();
    setWins((ws) => ws.filter((w) => w.id !== id));
  };

  const crash = () => {
    setWins([]);
    setStartOpen(false);
    setStage("crash");
  };

  const patch = (id: AppId, p: Partial<Win>) => setWins((ws) => ws.map((w) => (w.id === id ? { ...w, ...p } : w)));

  // Html transform içinde ölçek: ekrandaki px / DOM px
  const scale = () => {
    const r = root.current?.getBoundingClientRect();
    return r && r.width > 0 ? r.width / SCREEN_W : 1;
  };

  const startDrag = (e: React.PointerEvent, w: Win) => {
    if (w.max || e.button !== 0) return;
    e.preventDefault();
    focus(w.id);
    const s = scale();
    const sx = e.clientX,
      sy = e.clientY,
      ox = w.x,
      oy = w.y;
    const app = APPS.find((a) => a.id === w.id)!;
    const move = (ev: PointerEvent) => {
      const nx = ox + (ev.clientX - sx) / s;
      const ny = oy + (ev.clientY - sy) / s;
      patch(w.id, {
        x: Math.max(-app.w + 80, Math.min(SCREEN_W - 80, nx)),
        y: Math.max(0, Math.min(SCREEN_H - TASKBAR_H - 24, ny)),
      });
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const topId = wins.filter((w) => !w.min).sort((a, b) => b.z - a.z)[0]?.id;

  return (
    <div ref={root} className={"os crt " + (active ? "is-active" : "")} style={{ width: SCREEN_W, height: SCREEN_H }}>
      {stage === "saver" && <Screensaver />}
      {stage === "splash" && <Splash onDone={finishSplash} />}
      {stage === "crash" && (
        <Crash
          onDone={() => {
            setStage("splash");
          }}
        />
      )}

      {stage === "desktop" && (
        <div
          className={"desktop " + wallpaper}
          onPointerDown={() => {
            setSelected(null);
            setStartOpen(false);
          }}
        >
          <div className="icons">
            {APPS.filter((a) => a.desktop).map((a) => (
              <button
                key={a.id}
                className={"icon " + (selected === a.id ? "sel" : "")}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  setSelected(a.id);
                }}
                onDoubleClick={() => open(a.id)}
                onKeyDown={(e) => e.key === "Enter" && open(a.id)}
                title={tx("Açmak için çift tıkla", "Double-click to open")}
              >
                <a.icon size={34} />
                <span>{a.label}</span>
              </button>
            ))}
          </div>

          {wins.map((w) => {
            const app = APPS.find((a) => a.id === w.id)!;
            const ctx: AppCtx = {
              open,
              wallpaper,
              setWallpaper,
              crash,
              close: () => close(w.id),
            };
            const style = w.max
              ? { left: 0, top: 0, width: SCREEN_W, height: SCREEN_H - TASKBAR_H, zIndex: w.z }
              : { left: w.x, top: w.y, width: app.w, height: app.h, zIndex: w.z };
            return (
              <div
                key={w.id}
                className={"window " + (w.min ? "min " : "") + (topId === w.id ? "focused" : "")}
                style={style}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  if (topId !== w.id) focus(w.id);
                }}
                role="dialog"
                aria-label={app.title}
              >
                <div className="titlebar" onPointerDown={(e) => startDrag(e, w)} onDoubleClick={() => patch(w.id, { max: !w.max })}>
                  <app.icon size={16} />
                  <span className="title">{app.title}</span>
                  <div className="tb-btns" onPointerDown={(e) => e.stopPropagation()}>
                    <button aria-label={tx("Küçült", "Minimize")} onClick={() => { sfx.click(); patch(w.id, { min: true }); }}>
                      <span className="g-min" />
                    </button>
                    <button aria-label={tx("Büyüt", "Maximize")} onClick={() => { sfx.click(); patch(w.id, { max: !w.max }); }}>
                      <span className="g-max" />
                    </button>
                    <button aria-label={tx("Kapat", "Close")} onClick={() => close(w.id)}>
                      <span className="g-x">×</span>
                    </button>
                  </div>
                </div>
                <div className="win-body">{app.render(ctx)}</div>
              </div>
            );
          })}

          {startOpen && (
            <div className="startmenu" onPointerDown={(e) => e.stopPropagation()}>
              <div className="sm-side">
                <span>
                  Makara<b>OS</b> 98
                </span>
              </div>
              <ul>
                {APPS.filter((a) => a.id !== "danger").map((a) => (
                  <li key={a.id}>
                    <button onClick={() => open(a.id)}>
                      <a.icon size={22} />
                      {a.label}
                    </button>
                  </li>
                ))}
                <li className="sep" />
                <li>
                  <button
                    onClick={() => {
                      sfx.click();
                      setLang(lang === "en" ? "tr" : "en");
                    }}
                  >
                    <span className="power" aria-hidden="true">🌐</span>
                    {lang === "en" ? "Türkçe" : "English"}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setStartOpen(false);
                      window.dispatchEvent(new CustomEvent("os:exit"));
                    }}
                  >
                    <span className="power" aria-hidden="true">⏻</span>
                    {tx("Masadan kalk…", "Leave the desk…")}
                  </button>
                </li>
              </ul>
            </div>
          )}

          <div className="taskbar" onPointerDown={(e) => e.stopPropagation()}>
            <button
              className={"startbtn " + (startOpen ? "pressed" : "")}
              onClick={() => {
                sfx.click();
                setStartOpen((v) => !v);
              }}
            >
              <span className="flag mini" aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
              </span>
              {tx("Başlat", "Start")}
            </button>
            <div className="tasks">
              {wins.map((w) => {
                const app = APPS.find((a) => a.id === w.id)!;
                return (
                  <button
                    key={w.id}
                    className={"task " + (topId === w.id ? "pressed" : "")}
                    onClick={() => {
                      sfx.click();
                      if (topId === w.id) patch(w.id, { min: true });
                      else focus(w.id);
                    }}
                  >
                    <app.icon size={16} />
                    <span>{app.label}</span>
                  </button>
                );
              })}
            </div>
            <Clock />
          </div>
        </div>
      )}
    </div>
  );
}
