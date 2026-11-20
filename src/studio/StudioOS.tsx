import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { content, Project, topSkills } from "../content";
import { sfx } from "../sfx";
import { GBack, GCat, GHeart, GDoc, GFolder, GGear, GNote, GPerson, GSearch, GSend, GSparkle, Mark } from "./glyphs";
import { getLang, locale, setLang, tx, useLang } from "../i18n";
import "./studio.css";

const W = 1280;
const H = 800;
const MENU_H = 30;

type AppId = "about" | "projects" | "resume" | "contact" | "notes" | "settings" | "secret" | "system" | "hobbies";
type Win = { id: AppId; x: number; y: number; z: number; min: boolean; max: boolean };

type Ctx = {
  open: (id: AppId) => void;
  close: () => void;
  wallpaper: string;
  setWallpaper: (w: string) => void;
  dark: boolean;
  setDark: (d: boolean) => void;
  catRain: () => void;
};

type App = {
  id: AppId;
  name: string;
  glyph: (p: { size?: number }) => JSX.Element;
  tint: string;
  w: number;
  h: number;
  dock?: boolean;
  render: (c: Ctx) => JSX.Element;
};

/* ================= uygulamalar ================= */

function About() {
  return (
    <div className="s-about">
      <img className="s-avatar" src={content.avatar} alt={content.name} />
      <h1>{content.name}</h1>
      <p className="s-sub">
        {content.title} · {content.location}
      </p>
      <p className="s-headline">{content.headline}</p>
      <div className="s-about-body">
        {content.about.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      <div className="s-metrics">
        {content.metrics.map((m) => (
          <div key={m.label} className="s-metric">
            <strong>{m.value}</strong>
            <span>{m.label}</span>
          </div>
        ))}
      </div>
      <div className="s-pills">
        {topSkills.map((s) => (
          <span key={s} className="s-pill">
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

const CARD_TINTS = ["linear-gradient(135deg,#dbeafe,#bfdbfe)", "linear-gradient(135deg,#dcfce7,#bbf7d0)", "linear-gradient(135deg,#ffe4e6,#fecdd3)", "linear-gradient(135deg,#f3e8ff,#e9d5ff)", "linear-gradient(135deg,#ffedd5,#fed7aa)", "linear-gradient(135deg,#e0f2fe,#bae6fd)"];
const tintOf = (p: Project) => CARD_TINTS[content.projects.indexOf(p) % CARD_TINTS.length];

function Logo({ p, size }: { p: Project; size: number }) {
  return p.logo ? (
    <img className="s-plogo" src={p.logo} alt="" width={size} height={size} />
  ) : (
    <span className="s-plogo s-mark" style={{ width: size, height: size }}>
      {p.mark}
    </span>
  );
}

function Projects() {
  const [open, setOpen] = useState<Project | null>(null);
  const [filter, setFilter] = useState<string>("*");
  const [shot, setShot] = useState(0);
  const tags = ["*", ...Array.from(new Set(content.projects.flatMap((p) => p.tags)))].slice(0, 14);
  const list = content.projects.filter((p) => filter === "*" || p.tags.includes(filter));
  return (
    <div className="s-split">
      <aside className="s-sidebar">
        <div className="s-side-title">{tx("Etiketler", "Tags")}</div>
        {tags.map((t) => (
          <button
            key={t}
            className={"s-side-item " + (t === filter ? "on" : "")}
            onClick={() => {
              sfx.tap();
              setFilter(t);
              setOpen(null);
            }}
          >
            {t === "*" ? <GFolder size={15} /> : <span className="s-dot" />}
            {t === "*" ? tx("Tümü", "All") : t}
          </button>
        ))}
      </aside>
      <section className="s-main">
        {open ? (
          <div className="s-detail">
            <button className="s-link" onClick={() => setOpen(null)}>
              <GBack size={15} /> {tx("Projeler", "Projects")}
            </button>
            <div className="s-pd-head">
              <Logo p={open} size={56} />
              <div>
                <h2>{open.title}</h2>
                <p className="s-sub">
                  {open.year} · {open.status}
                </p>
              </div>
            </div>
            <p className="s-tagline">{open.tagline}</p>
            {open.shots && open.shots.length > 0 && (
              <figure className="s-shot">
                <img src={open.shots[shot % open.shots.length].src} alt={open.shots[shot % open.shots.length].alt} />
                {open.shots.length > 1 && (
                  <div className="s-dots">
                    {open.shots.map((s, i) => (
                      <button key={s.src} aria-label={`${tx("Görsel", "Image")} ${i + 1}`} className={i === shot % open.shots!.length ? "on" : ""} onClick={() => setShot(i)} />
                    ))}
                  </div>
                )}
                <figcaption className="s-sub">{open.shots[shot % open.shots.length].alt}</figcaption>
              </figure>
            )}
            <p>{open.description}</p>
            {open.results && (
              <div className="s-metrics">
                {open.results.map((r) => (
                  <div key={r.label} className="s-metric">
                    <strong>{r.value}</strong>
                    <span>{r.label}</span>
                  </div>
                ))}
              </div>
            )}
            <h3 className="s-h3">{tx("Öne çıkanlar", "Highlights")}</h3>
            <ul className="s-list">
              {open.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
            <div className="s-pills">
              {open.tags.map((t) => (
                <span className="s-pill" key={t}>
                  {t}
                </span>
              ))}
            </div>
            {open.credit && <p className="s-sub">{open.credit}</p>}
            <div className="s-actions">
              {open.demo && (
                <a className="s-btn primary" href={open.demo} target="_blank" rel="noreferrer">
                  {tx("Canlı demo", "Live demo")}
                </a>
              )}
              {open.repo && (
                <a className="s-btn" href={open.repo} target="_blank" rel="noreferrer">
                  {tx("Kaynak kod", "Source code")}
                </a>
              )}
            </div>
          </div>
        ) : (
          <>
            <h2 className="s-section-title">{filter === "*" ? tx("Projeler", "Projects") : filter}</h2>
            <div className="s-grid">
              {list.map((p) => (
                <button
                  key={p.slug}
                  className="s-card"
                  onClick={() => {
                    sfx.tap();
                    setShot(0);
                    setOpen(p);
                  }}
                >
                  <div className="s-thumb" style={{ background: tintOf(p) }}>
                    {p.shots?.[0] ? <img src={p.shots[0].src} alt="" /> : <Logo p={p} size={64} />}
                  </div>
                  <div className="s-card-row">
                    <Logo p={p} size={22} />
                    <div className="s-card-title">{p.title}</div>
                  </div>
                  <div className="s-sub s-clamp">{p.tagline}</div>
                </button>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function Resume() {
  return (
    <div className="s-doc">
      <header>
        <h1>{content.name}</h1>
        <p className="s-sub">
          {content.title} · {content.location}
        </p>
      </header>
      <h3>{tx("Deneyim", "Experience")}</h3>
      <ol className="s-timeline">
        {content.experience.map((j) => (
          <li key={j.role + j.company}>
            <div className="s-tl-row">
              <strong>{j.role}</strong>
              <span className="s-sub">{j.period}</span>
            </div>
            <div className="s-sub">
              {j.company} · {j.place}
            </div>
            <ul className="s-list">
              {j.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
      <h3>{tx("Eğitim", "Education")}</h3>
      <ol className="s-timeline">
        {content.education.map((e) => (
          <li key={e.school}>
            <div className="s-tl-row">
              <strong>{e.school}</strong>
              <span className="s-sub">{e.period}</span>
            </div>
            <div>{e.degree}</div>
            <div className="s-sub">{e.note}</div>
          </li>
        ))}
      </ol>
      <div className="s-two">
        <div>
          <h3>{tx("Diller", "Languages")}</h3>
          {content.languages.map((l) => (
            <div key={l.name}>
              {l.name} <span className="s-sub">· {l.level}</span>
            </div>
          ))}
        </div>
        <div>
          <h3>{tx("Sertifika", "Certification")}</h3>
          <div>{content.certification}</div>
        </div>
      </div>
      <h3>{tx("Yetenekler", "Skills")}</h3>
      {content.skillGroups.map((g) => (
        <div key={g.group} className="s-skill-group">
          <div className="s-skill-title">{g.group}</div>
          <div className="s-pills">
            {g.items.map((s) => (
              <span key={s} className="s-pill">
                {s}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function Contact() {
  const [sent, setSent] = useState(false);
  return (
    <form
      className="s-mail"
      onSubmit={(e) => {
        e.preventDefault();
        // TODO: Kendi gönderme mantığını buraya bağla.
        sfx.soft();
        setSent(true);
      }}
    >
      <p className="s-mail-lead">{content.contactLead}</p>
      <div className="s-mail-row">
        <span>{tx("Kime:", "To:")}</span>
        <span className="s-token">{content.email || content.name}</span>
      </div>
      <label className="s-mail-row">
        <span>{tx("Kimden:", "From:")}</span>
        <input name="email" type="email" placeholder={tx("sen@ornek.com", "you@example.com")} required />
      </label>
      <label className="s-mail-row">
        <span>{tx("Konu:", "Subject:")}</span>
        <input name="subject" placeholder={tx("Merhaba!", "Hello!")} required />
      </label>
      <textarea name="message" placeholder={tx("Mesajını yaz…", "Write your message…")} required />
      <div className="s-mail-foot">
        <div className="s-links">
          {content.socials.map((s) => (
            <a key={s.label} href={s.url} target="_blank" rel="noreferrer">
              {s.label}
            </a>
          ))}
        </div>
        {sent ? <span className="s-sent">{tx("Gönderildi ✓", "Sent ✓")}</span> : null}
        <button className="s-btn primary" type="submit">
          <GSend size={15} /> {tx("Gönder", "Send")}
        </button>
      </div>
    </form>
  );
}

function Hobbies() {
  return (
    <div className="s-hobbies">
      <h2 className="s-section-title">{tx("Masanın dışında", "Away from the desk")}</h2>
      <div className="s-hobby-grid">
        {content.hobbies.map((h) => (
          <article key={h.label} className="s-hobby">
            <div className="s-w-label">{h.label}</div>
            <h3>{h.title}</h3>
            <p>{h.body}</p>
            {h.items.length > 0 && (
              <div className="s-pills">
                {h.items.map((it) => (
                  <span key={it} className="s-pill">
                    {it}
                  </span>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}

const NOTES_TR = [
  {
    title: "Beni oku",
    date: "Bugün",
    body: "Hoş geldin.\n\nBu bilgisayar çok sessiz, çok ince ve çok pahalı görünüyor. Aslında içinde bir kedi ve bir fincan kahve var.\n\nİpuçları:\n• Pencereleri başlıklarından sürükle.\n• Ctrl + K ile her şeyi ara.\n• Masadaki kediye tıkla, fikirlerini paylaşır.\n• Raftaki seramik ördeğe dokun.\n• Dock'taki son uygulamayı açma. Ciddiyim.",
  },
  { title: "Yapılacaklar", date: "Dün", body: "☐ Portfolyoyu bitir\n☑ Kahve iç\n☑ Kahve iç\n☐ Kediyi besle (acil, kendisi hatırlatıyor)\n☐ Uyu (ertelendi)" },
  { title: "Tasarım ilkeleri", date: "Geçen hafta", body: "1. Az ama öz.\n2. Boşluk da bir öğedir.\n3. Gölge yumuşak olsun.\n4. Köşeler yuvarlak olsun.\n5. Bunları bozacak bir kedi her zaman vardır." },
];

const NOTES_EN = [
  {
    title: "Read me",
    date: "Today",
    body: "Welcome.\n\nThis computer looks very quiet, very thin and very expensive. Inside, it's actually a cat and a cup of coffee.\n\nTips:\n• Drag windows by their title bars.\n• Search everything with Ctrl + K.\n• Click the cat on the desk; it has opinions.\n• Tap the ceramic duck on the shelf.\n• Don't open the last app in the Dock. I mean it.",
  },
  { title: "To do", date: "Yesterday", body: "☐ Finish the portfolio\n☑ Drink coffee\n☑ Drink coffee\n☐ Feed the cat (urgent, it keeps reminding me)\n☐ Sleep (postponed)" },
  { title: "Design principles", date: "Last week", body: "1. Less, but better.\n2. Whitespace is an element too.\n3. Keep shadows soft.\n4. Keep corners round.\n5. There is always a cat that will break all of these." },
];

function Notes() {
  const [sel, setSel] = useState(0);
  return (
    <div className="s-split">
      <aside className="s-sidebar s-notes-list">
        {(getLang() === "en" ? NOTES_EN : NOTES_TR).map((n, i) => (
          <button key={n.title} className={"s-note-item " + (i === sel ? "on" : "")} onClick={() => setSel(i)}>
            <strong>{n.title}</strong>
            <span className="s-sub">{n.date}</span>
          </button>
        ))}
      </aside>
      <textarea key={sel + getLang()} className="s-note-body" defaultValue={(getLang() === "en" ? NOTES_EN : NOTES_TR)[sel].body} spellCheck={false} />
    </div>
  );
}

export const WALLS: [string, string, string][] = [
  ["sw-morning", "Sabah", "Morning"],
  ["sw-dusk", "Akşam", "Dusk"],
  ["sw-ocean", "Okyanus", "Ocean"],
  ["sw-graphite", "Grafit", "Graphite"],
];

function Settings({ wallpaper, setWallpaper, dark, setDark }: Ctx) {
  return (
    <div className="s-settings">
      <h2>{tx("Görünüm", "Appearance")}</h2>
      <div className="s-seg" role="radiogroup" aria-label={tx("Görünüm", "Appearance")}>
        {[
          [tx("Açık", "Light"), false],
          [tx("Koyu", "Dark"), true],
        ].map(([label, v]) => (
          <button
            key={label as string}
            role="radio"
            aria-checked={dark === v}
            className={dark === v ? "on" : ""}
            onClick={() => {
              sfx.tap();
              setDark(v as boolean);
            }}
          >
            {label as string}
          </button>
        ))}
      </div>
      <h2>{tx("Dil", "Language")}</h2>
      <div className="s-seg" role="radiogroup" aria-label={tx("Dil", "Language")}>
        {(
          [
            ["Türkçe", "tr"],
            ["English", "en"],
          ] as const
        ).map(([label, l]) => (
          <button
            key={l}
            role="radio"
            aria-checked={getLang() === l}
            className={getLang() === l ? "on" : ""}
            onClick={() => {
              sfx.tap();
              setLang(l);
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <h2>{tx("Duvar kâğıdı", "Wallpaper")}</h2>
      <div className="s-walls">
        {WALLS.map(([cls, trName, enName]) => (
          <button
            key={cls}
            className={"s-wall " + (wallpaper === cls ? "on" : "")}
            onClick={() => {
              sfx.tap();
              setWallpaper(cls);
            }}
          >
            <span className={"s-wall-prev " + cls} />
            {tx(trName, enName)}
          </button>
        ))}
      </div>
    </div>
  );
}

function Secret({ close, catRain }: Ctx) {
  return (
    <div className="s-alert">
      <div className="s-alert-icon">
        <GCat size={34} />
      </div>
      <h3>{tx("“Sakın Açma” açılamıyor.", "“Do Not Open” can’t be opened.")}</h3>
      <p>{tx("Bu uygulama izin verilen eğlence miktarını aşıyor. Yine de devam etmek istiyor musun?", "This app exceeds the permitted amount of fun. Do you want to continue anyway?")}</p>
      <div className="s-alert-btns">
        <button className="s-btn" onClick={close}>
          {tx("Vazgeç", "Cancel")}
        </button>
        <button
          className="s-btn primary"
          onClick={() => {
            catRain();
            close();
          }}
        >
          {tx("Yine de aç", "Open anyway")}
        </button>
      </div>
    </div>
  );
}

function System() {
  return (
    <div className="s-system">
      <div className="s-sys-art">
        <Mark size={64} />
      </div>
      <h2>{content.osName.replace("98", "")} {tx("Stüdyo", "Studio")}</h2>
      <p className="s-sub">{tx("Sürüm 26.11 (kedi onaylı)", "Version 26.11 (cat approved)")}</p>
      <dl>
        <dt>{tx("Çip", "Chip")}</dt>
        <dd>Makara M1ni</dd>
        <dt>{tx("Bellek", "Memory")}</dt>
        <dd>{tx("16 GB (12'si açık sekmeler)", "16 GB (12 of it open tabs)")}</dd>
        <dt>{tx("Ekran", "Display")}</dt>
        <dd>{tx("Bol pikselli, parlak, güzel", "Many pixels, bright, nice")}</dd>
        <dt>{tx("Seri no.", "Serial no.")}</dt>
        <dd>{tx("KEDI-0001", "CAT-0001")}</dd>
      </dl>
    </div>
  );
}

const APPS: App[] = [
  { id: "about", get name() { return tx("Hakkımda", "About Me"); }, glyph: GPerson, tint: "linear-gradient(180deg,#5ac8fa,#007aff)", w: 560, h: 640, dock: true, render: () => <About /> },
  { id: "projects", get name() { return tx("Projeler", "Projects"); }, glyph: GFolder, tint: "linear-gradient(180deg,#7dd3fc,#2563eb)", w: 900, h: 640, dock: true, render: () => <Projects /> },
  { id: "resume", get name() { return tx("Özgeçmiş", "Resume"); }, glyph: GDoc, tint: "linear-gradient(180deg,#ffb35c,#ff7a00)", w: 640, h: 640, dock: true, render: () => <Resume /> },
  { id: "contact", get name() { return tx("İletişim", "Contact"); }, glyph: GSend, tint: "linear-gradient(180deg,#6ee7b7,#10b981)", w: 560, h: 520, dock: true, render: () => <Contact /> },
  { id: "hobbies", get name() { return tx("Hobiler", "Hobbies"); }, glyph: GHeart, tint: "linear-gradient(180deg,#ff8fa3,#ff375f)", w: 640, h: 560, dock: true, render: () => <Hobbies /> },
  { id: "notes", get name() { return tx("Notlar", "Notes"); }, glyph: GNote, tint: "linear-gradient(180deg,#ffe066,#f5b700)", w: 640, h: 440, dock: true, render: () => <Notes /> },
  { id: "settings", get name() { return tx("Ayarlar", "Settings"); }, glyph: GGear, tint: "linear-gradient(180deg,#a1a1aa,#52525b)", w: 460, h: 440, dock: true, render: (c) => <Settings {...c} /> },
  { id: "secret", get name() { return tx("Sakın Açma", "Do Not Open"); }, glyph: GSparkle, tint: "linear-gradient(135deg,#ff6f91,#a855f7,#3b82f6)", w: 360, h: 300, dock: true, render: (c) => <Secret {...c} /> },
  { id: "system", get name() { return tx("Bu Bilgisayar Hakkında", "About This Computer"); }, glyph: GSparkle, tint: "", w: 360, h: 420, render: () => <System /> },
];
const app = (id: AppId) => APPS.find((a) => a.id === id)!;

/* ================= kabuk ================= */

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 10_000);
    return () => window.clearInterval(t);
  }, []);
  return now;
}

function Dock({ running, onOpen }: { running: AppId[]; onOpen: (id: AppId) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [mx, setMx] = useState<number | null>(null);
  const items = APPS.filter((a) => a.dock);
  const sizes = items.map((_, i) => {
    if (mx === null || !ref.current) return 1;
    const el = ref.current.children[i] as HTMLElement | undefined;
    if (!el) return 1;
    const r = el.getBoundingClientRect();
    const d = Math.abs(mx - (r.left + r.width / 2)) / r.width;
    return 1 + 0.45 * Math.max(0, 1 - d / 2.4);
  });
  return (
    <div className="s-dock-wrap">
      <div className="s-dock" ref={ref} onMouseMove={(e) => setMx(e.clientX)} onMouseLeave={() => setMx(null)}>
        {items.map((a, i) => (
          <button key={a.id} className="s-dock-item" style={{ ["--s" as string]: sizes[i] }} onClick={() => onOpen(a.id)} aria-label={a.name}>
            <span className="s-dock-tip">{a.name}</span>
            <span className="s-icon" style={{ background: a.tint }}>
              <a.glyph size={30} />
            </span>
            <span className={"s-run " + (running.includes(a.id) ? "on" : "")} />
          </button>
        ))}
      </div>
    </div>
  );
}

function Spotlight({ onPick, onClose }: { onPick: (id: AppId, p?: Project) => void; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [i, setI] = useState(0);
  const inp = useRef<HTMLInputElement>(null);
  useEffect(() => inp.current?.focus(), []);
  const norm = (s: string) => s.toLocaleLowerCase(locale());
  const results = [
    ...APPS.filter((a) => a.id !== "secret" && norm(a.name).includes(norm(q))).map((a) => ({ kind: tx("Uygulama", "App"), label: a.name, id: a.id, a, p: undefined as Project | undefined })),
    ...content.projects.filter((p) => q && norm(p.title + p.tags.join(" ")).includes(norm(q))).map((p) => ({ kind: tx("Proje", "Project"), label: p.title, id: "projects" as AppId, a: app("projects"), p })),
  ].slice(0, 7);
  return (
    <div className="s-spot-backdrop" onPointerDown={onClose}>
      <div className="s-spot" onPointerDown={(e) => e.stopPropagation()}>
        <div className="s-spot-input">
          <GSearch size={22} />
          <input
            ref={inp}
            value={q}
            placeholder={tx("Ara: proje, uygulama, kedi…", "Search: projects, apps, cats…")}
            onChange={(e) => {
              setQ(e.target.value);
              setI(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.stopPropagation();
                onClose();
              }
              if (e.key === "ArrowDown") setI((v) => Math.min(results.length - 1, v + 1));
              if (e.key === "ArrowUp") setI((v) => Math.max(0, v - 1));
              if (e.key === "Enter" && results[i]) onPick(results[i].id, results[i].p);
            }}
          />
        </div>
        {results.length > 0 && (
          <ul className="s-spot-list">
            {results.map((r, k) => (
              <li key={r.kind + r.label}>
                <button className={k === i ? "on" : ""} onMouseEnter={() => setI(k)} onClick={() => onPick(r.id, r.p)}>
                  <span className="s-icon sm" style={{ background: r.a.tint || "#8e8e93" }}>
                    <r.a.glyph size={16} />
                  </span>
                  {r.label}
                  <span className="s-sub">{r.kind}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {q && results.length === 0 && <div className="s-spot-empty">{tx(`“${q}” için sonuç yok. Kediye sormayı dene.`, `No results for “${q}”. Try asking the cat.`)}</div>}
      </div>
    </div>
  );
}

function CatRain() {
  const cats = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 1.6,
        dur: 1.8 + Math.random() * 1.4,
        size: 26 + Math.random() * 30,
        rot: Math.random() * 360,
        k: i,
      })),
    []
  );
  return (
    <div className="s-rain" aria-hidden="true">
      {cats.map((c) => (
        <span key={c.k} style={{ left: `${c.left}%`, animationDelay: `${c.delay}s`, animationDuration: `${c.dur}s`, fontSize: c.size, ["--r" as string]: `${c.rot}deg` }}>
          🐈
        </span>
      ))}
    </div>
  );
}

export function StudioOS({ active }: { active: boolean }) {
  const lang = useLang();
  const [booted, setBooted] = useState(false);
  const [wins, setWins] = useState<Win[]>([]);
  const zRef = useRef(10);
  const [wallpaper, setWallpaper] = useState("sw-morning");
  const [dark, setDark] = useState(false);
  const [spot, setSpot] = useState(false);
  const [menu, setMenu] = useState(false);
  const [toast, setToast] = useState<{ title: string; body: string } | null>(null);
  const [rain, setRain] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const now = useClock();

  // ilk yakınlaşmada kısa bir açılış
  useEffect(() => {
    if (!active || booted) return;
    const t = window.setTimeout(() => {
      setBooted(true);
      sfx.soft();
      openApp("about");
      window.setTimeout(() => setToast({ title: tx("Kedi", "Cat"), body: tx("Mama saati 14 dakika geçti. Sadece bilgin olsun.", "Dinner was due 14 minutes ago. Just so you know.") }), 1400);
    }, 1600);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, booted]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 5200);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!active) return;
    const k = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSpot((v) => !v);
      }
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [active]);

  const nextZ = () => ++zRef.current;
  const focus = (id: AppId) => {
    const z = nextZ();
    setWins((ws) => ws.map((w) => (w.id === id ? { ...w, z, min: false } : w)));
  };

  const openApp = useCallback((id: AppId) => {
    setMenu(false);
    sfx.pop();
    setWins((ws) => {
      const z = ++zRef.current;
      if (ws.some((w) => w.id === id)) return ws.map((w) => (w.id === id ? { ...w, z, min: false } : w));
      const a = app(id);
      const n = ws.length;
      const x = Math.max(20, Math.min(W - a.w - 20, (W - a.w) / 2 + (n - 1) * 34));
      const y = Math.max(MENU_H + 14, Math.min(H - a.h - 100, MENU_H + 40 + n * 26));
      return [...ws, { id, x, y, z, min: false, max: false }];
    });
  }, []);

  const close = (id: AppId) => {
    sfx.tap();
    setWins((ws) => ws.filter((w) => w.id !== id));
  };
  const patch = (id: AppId, p: Partial<Win>) => setWins((ws) => ws.map((w) => (w.id === id ? { ...w, ...p } : w)));

  const catRain = () => {
    sfx.meow();
    setRain(true);
    window.setTimeout(() => setToast({ title: tx("Kedi", "Cat"), body: tx("Klavyenin üstünden geçtim. Bir şey olmadı, değil mi?", "I walked across the keyboard. Nothing broke, right?") }), 900);
    window.setTimeout(() => setRain(false), 4200);
  };

  const scale = () => {
    const r = root.current?.getBoundingClientRect();
    return r && r.width > 0 ? r.width / W : 1;
  };

  const drag = (e: React.PointerEvent, w: Win) => {
    if (w.max || e.button !== 0) return;
    e.preventDefault();
    focus(w.id);
    const s = scale();
    const sx = e.clientX;
    const sy = e.clientY;
    const ox = w.x;
    const oy = w.y;
    const a = app(w.id);
    const move = (ev: PointerEvent) =>
      patch(w.id, {
        x: Math.max(-a.w + 120, Math.min(W - 120, ox + (ev.clientX - sx) / s)),
        y: Math.max(MENU_H, Math.min(H - 60, oy + (ev.clientY - sy) / s)),
      });
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const visible = wins.filter((w) => !w.min).sort((a, b) => b.z - a.z);
  const top = visible[0];
  const activeName = top ? app(top.id).name : tx("Masaüstü", "Desktop");

  return (
    <div ref={root} className={"sos " + (dark ? "dark " : "") + (active ? "is-active" : "")} style={{ width: W, height: H }}>
      <div className={"s-wallpaper " + wallpaper} />

      {!booted && (
        <div className={"s-lock " + (active ? "booting" : "")}>
          <div className="s-lock-time">{now.toLocaleTimeString(locale(), { hour: "2-digit", minute: "2-digit" })}</div>
          <div className="s-lock-date">{now.toLocaleDateString(locale(), { weekday: "long", day: "numeric", month: "long" })}</div>
          <div className="s-lock-hint">{active ? <span className="s-spinner" /> : tx("Açmak için ekrana tıkla", "Click the screen to unlock")}</div>
        </div>
      )}

      {booted && (
        <div
          className="s-desktop"
          onPointerDown={() => {
            setMenu(false);
          }}
        >
          {/* menü çubuğu */}
          <div className="s-menubar" onPointerDown={(e) => e.stopPropagation()}>
            <button className={"s-mb-mark " + (menu ? "on" : "")} onClick={() => setMenu((v) => !v)} aria-label={tx("Sistem menüsü", "System menu")}>
              <Mark size={15} />
            </button>
            <strong>{activeName}</strong>
            {(lang === "en" ? ["File", "Edit", "View", "Window", "Help"] : ["Dosya", "Düzen", "Görünüm", "Pencere", "Yardım"]).map((m) => (
              <span key={m} className="s-mb-item">
                {m}
              </span>
            ))}
            <div className="s-mb-right">
              <span className="s-mb-item">☕ %12</span>
              <button className="s-mb-icon" onClick={() => setSpot(true)} aria-label={tx("Ara (Ctrl+K)", "Search (Ctrl+K)")}>
                <GSearch size={15} />
              </button>
              <span className="s-mb-item">
                {now.toLocaleDateString(locale(), { weekday: "short", day: "numeric", month: "short" })}{" "}
                {now.toLocaleTimeString(locale(), { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            {menu && (
              <div className="s-menu">
                <button onClick={() => openApp("system")}>{tx("Bu Bilgisayar Hakkında", "About This Computer")}</button>
                <hr />
                <button onClick={() => openApp("settings")}>{tx("Sistem Ayarları…", "System Settings…")}</button>
                <button
                  onClick={() => {
                    setMenu(false);
                    setLang(lang === "en" ? "tr" : "en");
                  }}
                >
                  {lang === "en" ? "Türkçe" : "English"}
                </button>
                <button
                  onClick={() => {
                    setMenu(false);
                    setSpot(true);
                  }}
                >
                  {tx("Ara…", "Search…")} <kbd>Ctrl K</kbd>
                </button>
                <hr />
                <button
                  onClick={() => {
                    setMenu(false);
                    window.dispatchEvent(new CustomEvent("os:exit"));
                  }}
                >
                  {tx("Masadan kalk…", "Leave the desk…")}
                </button>
              </div>
            )}
          </div>

          {/* masaüstü widget'ı */}
          <div className="s-widget">
            <div className="s-w-label">{tx("Bugün", "Today")}</div>
            <div className="s-w-big">{now.toLocaleTimeString(locale(), { hour: "2-digit", minute: "2-digit" })}</div>
            <div className="s-w-row">
              <span>{tx("Kahve", "Coffee")}</span>
              <span className="s-bar">
                <i style={{ width: "12%" }} />
              </span>
            </div>
            <div className="s-w-row">
              <span>{tx("Odak", "Focus")}</span>
              <span className="s-bar">
                <i style={{ width: "86%" }} />
              </span>
            </div>
          </div>

          {wins.map((w) => {
            const a = app(w.id);
            const ctx: Ctx = { open: openApp, close: () => close(w.id), wallpaper, setWallpaper, dark, setDark, catRain };
            const style = w.max
              ? { left: 8, top: MENU_H + 8, width: W - 16, height: H - MENU_H - 100, zIndex: w.z }
              : { left: w.x, top: w.y, width: a.w, height: a.h, zIndex: w.z };
            const isAlert = w.id === "secret";
            return (
              <div
                key={w.id}
                className={"s-win " + (w.min ? "min " : "") + (top?.id === w.id ? "focused " : "") + (isAlert ? "alert" : "")}
                style={style}
                role="dialog"
                aria-label={a.name}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  if (top?.id !== w.id) focus(w.id);
                }}
              >
                <div className="s-titlebar" onPointerDown={(e) => drag(e, w)} onDoubleClick={() => !isAlert && patch(w.id, { max: !w.max })}>
                  <div className="s-lights" onPointerDown={(e) => e.stopPropagation()}>
                    <button className="l-close" aria-label={tx("Kapat", "Close")} onClick={() => close(w.id)} />
                    <button className="l-min" aria-label={tx("Küçült", "Minimize")} onClick={() => patch(w.id, { min: true })} />
                    <button className="l-max" aria-label={tx("Büyüt", "Zoom")} onClick={() => !isAlert && patch(w.id, { max: !w.max })} />
                  </div>
                  {!isAlert && <span className="s-title">{a.name}</span>}
                </div>
                <div className="s-win-body">{a.render(ctx)}</div>
              </div>
            );
          })}

          <Dock
            running={wins.map((w) => w.id)}
            onOpen={(id) => {
              const w = wins.find((x) => x.id === id);
              if (w && top?.id === id) patch(id, { min: true });
              else openApp(id);
            }}
          />

          {toast && (
            <div className="s-toast" key={toast.body}>
              <span className="s-icon sm" style={{ background: "linear-gradient(180deg,#ffb35c,#ff7a00)" }}>
                <GCat size={16} />
              </span>
              <div>
                <div className="s-toast-head">
                  <strong>{toast.title}</strong>
                  <span className="s-sub">{tx("şimdi", "now")}</span>
                </div>
                <div>{toast.body}</div>
              </div>
            </div>
          )}

          {spot && (
            <Spotlight
              onClose={() => setSpot(false)}
              onPick={(id) => {
                setSpot(false);
                openApp(id);
              }}
            />
          )}
          {rain && <CatRain />}
        </div>
      )}
    </div>
  );
}
