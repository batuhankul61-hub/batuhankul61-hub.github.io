import Link from "next/link";
import { type Lang, paths, site, t } from "@/content/site";
import { ThemeToggle } from "./ThemeToggle";

export function Header({ lang, altHref }: { lang: Lang; altHref: string }) {
  const s = t[lang];
  const home = paths[lang].home;
  return (
    <header className="header">
      <nav className="nav container">
        <Link href={home} className="brand">
          <img src="/avatar.jpg" alt="" width={28} height={28} />
          <span>{site.name}</span>
        </Link>
        <div className="nav-links">
          <Link href={`${home}#work`}>{s.nav.work}</Link>
          <Link href={`${home}#experience`}>{s.nav.experience}</Link>
          <Link href={`${home}#stack`}>{s.nav.stack}</Link>
          <Link href={`${home}#contact`}>{s.nav.contact}</Link>
        </div>
        <div className="nav-actions">
          <Link href={altHref} className="icon-btn lang" aria-label={s.switchLangLabel} hrefLang={lang === "tr" ? "en" : "tr"}>
            {s.switchLang}
          </Link>
          <ThemeToggle label={s.themeLabel} />
        </div>
      </nav>
    </header>
  );
}

export function Footer({ lang }: { lang: Lang }) {
  return (
    <footer className="footer container">
      <span>
        © {new Date().getFullYear()} {site.name}
      </span>
      <span className="muted">{t[lang].footer}</span>
    </footer>
  );
}
