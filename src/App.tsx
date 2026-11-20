import { useEffect, useState } from "react";
import { RetroApp } from "./RetroApp";
import { StudioApp } from "./studio/StudioApp";
import { CvPage } from "./CvPage";
import { setLang, useLang } from "./i18n";
import { content } from "./content";

type Variant = "retro" | "studio" | "cv";
const read = (): Variant => {
  const h = window.location.hash;
  if (h === "#cv" || h === "#ozgecmis") return "cv";
  return h === "#studyo" ? "studio" : "retro";
};

export function App() {
  const [variant, setVariant] = useState<Variant>(read);
  // CV'den dönünce kullanıcının geldiği sürüme gitsin
  const [lastScene, setLastScene] = useState<"retro" | "studio">(() => (read() === "studio" ? "studio" : "retro"));
  const lang = useLang();

  useEffect(() => {
    const cv = variant === "cv" ? (lang === "en" ? "Resume" : "Özgeçmiş") : lang === "en" ? "Portfolio" : "Portfolyo";
    document.title = `${content.name} · ${cv}`;
  }, [lang, variant]);

  useEffect(() => {
    const on = () => {
      const v = read();
      setVariant(v);
      if (v !== "cv") setLastScene(v);
    };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);

  // CV açık zeminli; menü de açık (stüdyo) stiliyle görünsün
  const scene = variant === "cv" ? "studio" : variant;

  return (
    <>
      {variant === "retro" && <RetroApp key="retro" />}
      {variant === "studio" && <StudioApp key="studio" />}
      {variant === "cv" && <CvPage backHref={lastScene === "studio" ? "#studyo" : "#retro"} />}
      <nav className={"variant-switch " + scene} aria-label={lang === "en" ? "Choose version" : "Sürüm seç"}>
        <a href="#retro" aria-current={variant === "retro" ? "page" : undefined}>Retro</a>
        <a href="#studyo" aria-current={variant === "studio" ? "page" : undefined}>{lang === "en" ? "Studio" : "Stüdyo"}</a>
        <a href="#cv" aria-current={variant === "cv" ? "page" : undefined}>CV</a>
        <span className="vs-sep" aria-hidden="true" />
        <button
          className="vs-lang"
          onClick={() => setLang(lang === "en" ? "tr" : "en")}
          aria-label={lang === "en" ? "Türkçeye geç" : "Switch to English"}
        >
          {lang === "en" ? "TR" : "EN"}
        </button>
      </nav>
    </>
  );
}
