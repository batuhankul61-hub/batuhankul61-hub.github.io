import { useEffect, useRef } from "react";
import { yt, useYt, thumb, type Playlist } from "./yt";
import { tx } from "../i18n";
import { sfx } from "../sfx";
import "./player.css";

/* Tek bir kalıcı pencere: çalara yakınlaşınca "panel", çalarken başka
   yerdeyken köşede "mini", yoksa gizli. iframe DOM'da hiç taşınmıyor
   (taşınırsa yeniden yüklenir); yalnızca stili değişiyor.
   skin: "studio" (cam, sade) ya da "retro" (Windows 98 penceresi). */

export type DockMode = "panel" | "mini" | "hidden";

const Ic = {
  play: <path d="M8 5.5v13l11-6.5z" fill="currentColor" />,
  pause: (
    <g fill="currentColor">
      <rect x="6.5" y="5" width="4" height="14" rx="1" />
      <rect x="13.5" y="5" width="4" height="14" rx="1" />
    </g>
  ),
  prev: <path d="M7 6v12M18 6l-8.5 6 8.5 6z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />,
  next: <path d="M17 6v12M6 6l8.5 6L6 18z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />,
  expand: <path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />,
  vol: <path d="M11 5 6 9H3v6h3l5 4zM15.5 8.5a5 5 0 0 1 0 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
};
const Icon = ({ d, size = 18 }: { d: JSX.Element; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    {d}
  </svg>
);

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const cover = (id: string) => ({ backgroundImage: `url(${thumb(id)})` });

export function PlayerDock({ mode, onOpen, list, skin }: { mode: DockMode; onOpen: () => void; list: Playlist; skin: "studio" | "retro" }) {
  const { index, playing, loaded, error, track, volume, time, duration } = useYt();
  const frame = useRef<HTMLDivElement>(null);
  const opened = useRef(false);
  const retro = skin === "retro";

  useEffect(() => {
    yt.use(list);
  }, [list]);

  // YouTube yalnızca pencere ilk kez açılınca yüklenir
  useEffect(() => {
    if (mode === "panel" && !opened.current && frame.current) {
      opened.current = true;
      yt.mount(frame.current);
    }
  }, [mode]);

  useEffect(() => () => yt.dispose(), []);

  const title = retro ? tx("Radyo-Teyp 98 · NFS Klasikleri", "Boombox 98 · NFS Classics") : tx("Müzik", "Music");

  return (
    <section className={`pd pd-${mode} pd-${skin}`} aria-label={tx("Müzik çalar", "Music player")} aria-hidden={mode === "hidden"}>
      {retro ? (
        <div className="pd-titlebar">
          <span>♪ {title}</span>
          {mode === "mini" && (
            <button className="pd-tb-btn" onClick={onOpen} aria-label={tx("Çaları büyüt", "Expand player")}>
              □
            </button>
          )}
        </div>
      ) : (
        <header className="pd-head">
          <h2>{title}</h2>
          <p>{tx("Masadaki hoparlör", "The speaker on the desk")}</p>
        </header>
      )}

      <div className="pd-body">
        <div className="pd-video">
          <div ref={frame} className="pd-frame" />
          {!loaded && <div className="pd-loading">{tx("YouTube yükleniyor…", "Loading YouTube…")}</div>}
        </div>

        <div className="pd-now">
          <span className="pd-cover" style={cover(track.id)} aria-hidden="true" />
          <div className="pd-meta">
            <b>{track.title}</b>
            <span>{error ? tx("Bu şarkı burada çalınamıyor, sıradakine geç.", "Can't play this one here, skip ahead.") : track.artist}</span>
          </div>
          {mode === "mini" && !retro && (
            <button className="pd-ic" onClick={onOpen} aria-label={tx("Çaları büyüt", "Expand player")}>
              <Icon d={Ic.expand} size={16} />
            </button>
          )}
        </div>

        <div className="pd-progress">
          <span>{mmss(time)}</span>
          <input
            type="range"
            min={0}
            max={Math.max(1, Math.floor(duration))}
            step={1}
            value={Math.min(Math.floor(time), Math.floor(duration) || 0)}
            onChange={(e) => yt.seek(Number(e.target.value))}
            disabled={!loaded || !duration}
            aria-label={tx("Şarkıda ilerle", "Seek")}
            style={{ "--p": `${duration ? (time / duration) * 100 : 0}%` } as React.CSSProperties}
          />
          <span>{mmss(duration)}</span>
        </div>

        <div className="pd-controls">
          <button className="pd-ic" onClick={() => (sfx.tap(), yt.prev())} aria-label={tx("Önceki şarkı", "Previous track")} disabled={!loaded}>
            <Icon d={Ic.prev} />
          </button>
          <button className="pd-ic pd-main" onClick={() => yt.toggle()} aria-label={playing ? tx("Duraklat", "Pause") : tx("Çal", "Play")} disabled={!loaded}>
            <Icon d={playing ? Ic.pause : Ic.play} size={22} />
          </button>
          <button className="pd-ic" onClick={() => (sfx.tap(), yt.next())} aria-label={tx("Sonraki şarkı", "Next track")} disabled={!loaded}>
            <Icon d={Ic.next} />
          </button>
          <label className="pd-vol">
            <Icon d={Ic.vol} size={16} />
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={(e) => yt.setVolume(Number(e.target.value))}
              aria-label={tx("Ses düzeyi", "Volume")}
              style={{ "--p": `${volume}%` } as React.CSSProperties}
            />
          </label>
        </div>

        <ol className="pd-list">
          {list.tracks.map((t, i) => (
            <li key={t.id}>
              <button className={i === index ? "on" : ""} onClick={() => yt.play(i)} disabled={!loaded} aria-current={i === index ? "true" : undefined}>
                <span className="pd-num">{i + 1}</span>
                <span className="pd-cover sm" style={cover(t.id)} aria-hidden="true" />
                <span className="pd-meta">
                  <b>{t.title}</b>
                  <span>{t.artist}</span>
                </span>
                {i === index && playing && (
                  <span className="pd-eq" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </span>
                )}
              </button>
            </li>
          ))}
        </ol>

        <p className="pd-note">{tx("YouTube üzerinden çalar; şarkıların başında reklam çıkabilir.", "Plays via YouTube; an ad may play before a track.")}</p>
      </div>
    </section>
  );
}
