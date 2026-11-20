import { useState } from "react";
import { content, Project } from "../content";
import { IconComputer, IconDoc, IconFolder, IconHeart, IconMail, IconNote, IconPaint, IconTrash, IconUser, IconWarn } from "./icons";
import { sfx } from "../sfx";
import { getLang, tx } from "../i18n";

export type AppId = "about" | "projects" | "resume" | "contact" | "readme" | "trash" | "danger" | "display" | "mycomputer" | "hobbies";

export type AppCtx = {
  open: (id: AppId) => void;
  setWallpaper: (w: string) => void;
  wallpaper: string;
  crash: () => void;
  close: () => void;
};

export type AppDef = {
  id: AppId;
  title: string;
  label: string;
  icon: (p: { size?: number }) => JSX.Element;
  w: number;
  h: number;
  desktop?: boolean;
  render: (ctx: AppCtx) => JSX.Element;
};

function About() {
  return (
    <div className="app-pad about">
      <div className="about-head">
        <div className="avatar">
          <img src={content.avatar} alt={content.name} width={84} height={84} />
        </div>
        <div>
          <h1>{content.name}</h1>
          <p className="muted">{content.title}</p>
          <p className="muted">{content.location}</p>
        </div>
      </div>
      <hr className="groove" />
      <p>
        <b>{content.headline}</b>
      </p>
      {content.about.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
      <fieldset className="group">
        <legend>{tx("Ölçülmüş sonuçlar", "Measured results")}</legend>
        <div className="metrics">
          {content.metrics.map((m) => (
            <div key={m.label} className="metric sunken">
              <b>{m.value}</b>
              <span>{m.label}</span>
            </div>
          ))}
        </div>
      </fieldset>
      <div className="links" style={{ marginTop: 14 }}>
        {content.socials.map((s) => (
          <a key={s.label} className="btn" href={s.url} target="_blank" rel="noreferrer">
            {s.label}
          </a>
        ))}
      </div>
    </div>
  );
}

function ProjectLogo({ p, size }: { p: Project; size: number }) {
  return p.logo ? (
    <img className="plogo" src={p.logo} alt="" width={size} height={size} />
  ) : (
    <span className="plogo mark" style={{ width: size, height: size }}>
      {p.mark}
    </span>
  );
}

function Projects() {
  const [sel, setSel] = useState(0);
  const [shot, setShot] = useState(0);
  const p = content.projects[sel];
  return (
    <div className="explorer">
      <div className="toolbar">
        <span>{tx("Adres:", "Address:")}</span>
        <div className="sunken addr">{tx("C:\\Projeler\\", "C:\\Projects\\")}{p?.slug ?? ""}</div>
      </div>
      <div className="explorer-body">
        <ul className="sunken file-list" role="listbox" aria-label={tx("Projeler", "Projects")}>
          {content.projects.map((pr, i) => (
            <li key={pr.slug}>
              <button
                className={i === sel ? "file sel" : "file"}
                onClick={() => {
                  sfx.click();
                  setSel(i);
                  setShot(0);
                }}
              >
                <ProjectLogo p={pr} size={20} />
                <span>{pr.title}</span>
              </button>
            </li>
          ))}
        </ul>
        {p && (
          <div className="project-detail">
            <div className="pd-head">
              <ProjectLogo p={p} size={48} />
              <div>
                <h2>{p.title}</h2>
                <p className="muted">
                  {p.year} · {p.status}
                </p>
              </div>
            </div>
            <p>
              <i>{p.tagline}</i>
            </p>
            {p.shots && p.shots.length > 0 && (
              <figure className="shot sunken">
                <img src={p.shots[shot % p.shots.length].src} alt={p.shots[shot % p.shots.length].alt} />
                {p.shots.length > 1 && (
                  <figcaption>
                    <button className="btn small" onClick={() => setShot((s) => (s + p.shots!.length - 1) % p.shots!.length)}>
                      ◀
                    </button>
                    <span>
                      {(shot % p.shots.length) + 1} / {p.shots.length}
                    </span>
                    <button className="btn small" onClick={() => setShot((s) => (s + 1) % p.shots!.length)}>
                      ▶
                    </button>
                  </figcaption>
                )}
              </figure>
            )}
            <p>{p.description}</p>
            {p.results && (
              <div className="metrics">
                {p.results.map((r) => (
                  <div key={r.label} className="metric sunken">
                    <b>{r.value}</b>
                    <span>{r.label}</span>
                  </div>
                ))}
              </div>
            )}
            <h3 className="pd-sub">{tx("Öne çıkanlar", "Highlights")}</h3>
            <ul className="bullets">
              {p.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
            <div className="chips">
              {p.tags.map((t) => (
                <span className="chip" key={t}>
                  {t}
                </span>
              ))}
            </div>
            {p.credit && <p className="muted">{p.credit}</p>}
            <div className="links">
              {p.repo && (
                <a className="btn" href={p.repo} target="_blank" rel="noreferrer">
                  {tx("Kaynak kod", "Source code")} ↗
                </a>
              )}
              {p.demo && (
                <a className="btn" href={p.demo} target="_blank" rel="noreferrer">
                  {tx("Canlı demo", "Live demo")} ↗
                </a>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="statusbar">
        <div className="sunken">{content.projects.length} {tx("nesne", "objects")}</div>
        <div className="sunken grow">{tx("Seçili", "Selected")}: {p?.title}</div>
      </div>
    </div>
  );
}

function Resume() {
  return (
    <div className="app-pad doc">
      <h1>{content.name}</h1>
      <p className="muted">
        {content.title} · {content.location}
      </p>
      <h3>{tx("Deneyim", "Experience")}</h3>
      {content.experience.map((j) => (
        <div key={j.role + j.company} className="job">
          <div className="job-row">
            <b>{j.role}</b>
            <span className="muted">{j.period}</span>
          </div>
          <div className="muted">
            {j.company} · {j.place}
          </div>
          <ul className="bullets">
            {j.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
      ))}
      <h3>{tx("Eğitim", "Education")}</h3>
      {content.education.map((e) => (
        <div key={e.school} className="job">
          <div className="job-row">
            <b>{e.school}</b>
            <span className="muted">{e.period}</span>
          </div>
          <div>{e.degree}</div>
          <div className="muted">{e.note}</div>
        </div>
      ))}
      <h3>{tx("Diller", "Languages")}</h3>
      <p>{content.languages.map((l) => `${l.name} · ${l.level}`).join("   ·   ")}</p>
      <h3>{tx("Sertifika", "Certification")}</h3>
      <p>{content.certification}</p>
      <h3>{tx("Yetenekler", "Skills")}</h3>
      {content.skillGroups.map((g) => (
        <p key={g.group}>
          <b>{g.group}:</b> {g.items.join(", ")}
        </p>
      ))}
    </div>
  );
}

function Contact() {
  const [sent, setSent] = useState(false);
  return (
    <form
      className="app-pad contact"
      onSubmit={(e) => {
        e.preventDefault();
        // TODO: Kendi gönderme mantığını buraya bağla.
        sfx.chime();
        setSent(true);
      }}
    >
      <p>{content.contactLead}</p>
      {content.email && (
        <p>
          {tx("E-posta", "Email")}: <a href={`mailto:${content.email}`}>{content.email}</a>
        </p>
      )}
      <div className="links">
        {content.socials.map((s) => (
          <a key={s.label} className="btn" href={s.url} target="_blank" rel="noreferrer">
            {s.label}
          </a>
        ))}
      </div>
      <label>
        {tx("Adın", "Your name")}
        <input className="sunken-input" name="name" required />
      </label>
      <label>
        {tx("E-posta", "Email")}
        <input className="sunken-input" name="email" type="email" required />
      </label>
      <label>
        {tx("Mesaj", "Message")}
        <textarea className="sunken-input" name="message" rows={4} required />
      </label>
      <div className="row-end">
        {sent && <span className="muted">{tx("Gönderildi! Güvercin yola çıktı 🕊️", "Sent! The pigeon is on its way 🕊️")}</span>}
        <button className="btn" type="submit">
          {tx("Gönder", "Send")}
        </button>
      </div>
    </form>
  );
}

function Hobbies() {
  const [sel, setSel] = useState(0);
  const h = content.hobbies[sel];
  return (
    <div className="hobbies-app">
      <div className="tabs" role="tablist">
        {content.hobbies.map((x, i) => (
          <button
            key={x.label}
            role="tab"
            aria-selected={i === sel}
            className={"tab " + (i === sel ? "on" : "")}
            onClick={() => {
              sfx.click();
              setSel(i);
            }}
          >
            {x.label}
          </button>
        ))}
      </div>
      <div className="tab-panel app-pad">
        <h2>{h.title}</h2>
        <p>{h.body}</p>
        {h.items.length > 0 && (
          <ul className="bullets">
            {h.items.map((it) => (
              <li key={it}>{it}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

const README_TR = `beni_oku.txt
==============

Hoş geldin, yolcu.

Bu bilgisayar 1998'den beri hiç kapatılmadı.
Çünkü kapatırsam bir daha açılacağından emin değilim.

İPUÇLARI:
- Pencereleri başlıklarından sürükleyebilirsin.
- Masadaki kediye tıkla. Kod incelemesi yapıyor.
- Monitörün üstündeki ördek bir hata ayıklama uzmanıdır.
- Lambayı açıp kapatabilirsin. Elektrik faturası bende.
- SAKIN_TIKLAMA.exe'ye tıklama.

Hâlâ okuyor musun? Projelere bak bence.
`;

const README_EN = `read_me.txt
==============

Welcome, traveler.

This computer hasn't been switched off since 1998.
Because I'm not sure it would ever turn back on.

TIPS:
- Drag windows by their title bars.
- Click the cat on the desk. It does code reviews.
- The duck on the monitor is a certified debugging expert.
- You can switch the lamp on and off. I pay the power bill.
- Do not click DONT_CLICK.exe.

Still reading? Go look at the projects.
`;

function Readme() {
  return <textarea key={getLang()} className="notepad" spellCheck={false} defaultValue={tx(README_TR, README_EN)} />;
}

function Trash({ crash }: { crash: () => void }) {
  const files = [
    [tx("son_final_GERCEK_son_v3.psd", "final_FINAL_really_v3.psd"), "12 MB"],
    [tx("eski_kodlarim.js", "my_old_code.js"), "∞ KB"],
    [tx("uyku_duzeni.exe", "sleep_schedule.exe"), tx("bozuk", "corrupt")],
    [tx("spagetti_kod.zip", "spaghetti_code.zip"), tx("1 tabak", "1 plate")],
    [tx("motivasyon.dll", "motivation.dll"), "0 KB"],
  ];
  return (
    <div className="explorer">
      <div className="toolbar">
        <button className="btn small" onClick={() => { sfx.error(); crash(); }}>
          {tx("Çöpü boşalt", "Empty trash")}
        </button>
        <span className="muted">{tx("(önerilmez)", "(not recommended)")}</span>
      </div>
      <table className="sunken table">
        <thead>
          <tr>
            <th>{tx("Ad", "Name")}</th>
            <th>{tx("Boyut", "Size")}</th>
          </tr>
        </thead>
        <tbody>
          {files.map(([n, s]) => (
            <tr key={n}>
              <td>
                <IconDoc size={16} /> {n}
              </td>
              <td>{s}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Danger({ crash, close }: { crash: () => void; close: () => void }) {
  const [step, setStep] = useState(0);
  const msgs = [
    tx("Bu programa tıklamaman söylenmişti.", "You were told not to click this program."),
    tx("Gerçekten emin misin? Bak geri dönüşü yok.", "Are you really sure? There's no going back."),
    tx("Son şans. Kedi de sana bakıyor.", "Last chance. The cat is watching you too."),
  ];
  return (
    <div className="dialog-body">
      <IconWarn size={40} />
      <p>{msgs[step]}</p>
      <div className="row-end">
        <button
          className="btn"
          onClick={() => {
            if (step < msgs.length - 1) {
              sfx.error();
              setStep(step + 1);
            } else {
              crash();
            }
          }}
        >
          {tx("Evet", "Yes")}
        </button>
        <button
          className="btn"
          onClick={() => {
            sfx.click();
            close();
          }}
        >
          {tx("Hayır, korktum", "No, I'm scared")}
        </button>
      </div>
    </div>
  );
}

export const WALLPAPERS: [string, string, string][] = [
  ["wp-sea", "Deniz", "Sea"],
  ["wp-night", "Gece", "Night"],
  ["wp-check", "Kareli", "Checkered"],
  ["wp-sunset", "Gün Batımı", "Sunset"],
];

function Display({ wallpaper, setWallpaper }: AppCtx) {
  return (
    <div className="app-pad display">
      <div className={"display-preview " + wallpaper}>
        <div className="mini-monitor" />
      </div>
      <fieldset className="group">
        <legend>{tx("Duvar kâğıdı", "Wallpaper")}</legend>
        <div className="wp-list">
          {WALLPAPERS.map(([cls, trName, enName]) => (
            <label key={cls}>
              <input
                type="radio"
                name="wp"
                checked={wallpaper === cls}
                onChange={() => {
                  sfx.click();
                  setWallpaper(cls);
                }}
              />
              {tx(trName, enName)}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}

function MyComputer({ open }: AppCtx) {
  const drives: [string, string, AppId][] = [
    [tx("Projeler (C:)", "Projects (C:)"), "C:", "projects"],
    [tx("Hakkımda (D:)", "About (D:)"), "D:", "about"],
    [tx("Disket (A:)", "Floppy (A:)"), "A:", "readme"],
  ];
  return (
    <div className="app-pad">
      <div className="drive-grid">
        {drives.map(([label, , id]) => (
          <button key={label} className="drive" onDoubleClick={() => open(id)} onClick={() => open(id)}>
            <IconComputer size={36} />
            <span>{label}</span>
          </button>
        ))}
      </div>
      <p className="muted">{tx("İşlemci: 233 MHz · Bellek: 64 MB · Çay: dolu", "CPU: 233 MHz · Memory: 64 MB · Tea: full")}</p>
    </div>
  );
}

export const APPS: AppDef[] = [
  { id: "mycomputer", get title() { return tx("Bilgisayarım", "My Computer"); }, get label() { return tx("Bilgisayarım", "My Computer"); }, icon: IconComputer, w: 440, h: 300, desktop: true, render: (c) => <MyComputer {...c} /> },
  { id: "about", get title() { return tx("Hakkımda", "About Me"); }, get label() { return tx("Hakkımda", "About Me"); }, icon: IconUser, w: 560, h: 560, desktop: true, render: () => <About /> },
  { id: "projects", get title() { return tx("C:\\Projeler", "C:\\Projects"); }, get label() { return tx("Projeler", "Projects"); }, icon: IconFolder, w: 820, h: 600, desktop: true, render: () => <Projects /> },
  { id: "resume", get title() { return tx("Özgeçmiş.doc - Yazar 98", "Resume.doc - Writer 98"); }, get label() { return tx("Özgeçmiş", "Resume"); }, icon: IconDoc, w: 620, h: 600, desktop: true, render: () => <Resume /> },
  { id: "contact", get title() { return tx("İletişim", "Contact"); }, get label() { return tx("İletişim", "Contact"); }, icon: IconMail, w: 480, h: 520, desktop: true, render: () => <Contact /> },
  { id: "hobbies", get title() { return tx("Hobiler", "Hobbies"); }, get label() { return tx("Hobiler", "Hobbies"); }, icon: IconHeart, w: 500, h: 380, desktop: true, render: () => <Hobbies /> },
  { id: "readme", get title() { return tx("beni_oku.txt - Not Defteri", "read_me.txt - Notepad"); }, get label() { return tx("beni_oku.txt", "read_me.txt"); }, icon: IconNote, w: 480, h: 400, desktop: true, render: () => <Readme /> },
  { id: "display", get title() { return tx("Görünüm Ayarları", "Display Settings"); }, get label() { return tx("Görünüm", "Display"); }, icon: IconPaint, w: 380, h: 380, desktop: true, render: (c) => <Display {...c} /> },
  { id: "trash", get title() { return tx("Geri Dönüşüm Kutusu", "Recycle Bin"); }, get label() { return tx("Çöp Kutusu", "Recycle Bin"); }, icon: IconTrash, w: 440, h: 300, desktop: true, render: (c) => <Trash crash={c.crash} /> },
  { id: "danger", get title() { return tx("SAKIN_TIKLAMA.exe", "DONT_CLICK.exe"); }, get label() { return tx("SAKIN_TIKLAMA.exe", "DONT_CLICK.exe"); }, icon: IconWarn, w: 360, h: 190, desktop: true, render: (c) => <Danger crash={c.crash} close={c.close} /> },
];
