import type { Lang } from "./site";

type L = Record<Lang, string>;

/** Spotify profile or playlist link. Leave empty to hide the button. */
export const spotifyUrl = "";

export type SpotId = "pc" | "music" | "collection" | "games" | "football" | "gym";

export type Spot = {
  id: SpotId;
  label: L;
  title: L;
  body: L;
  items?: { name: string; note: L }[];
};

/**
 * Texts for the clickable spots on the desk scene.
 * Drafted from the room photos; edit freely.
 */
export const spots: Record<Exclude<SpotId, "pc">, Spot> = {
  music: {
    id: "music",
    label: { tr: "Müzik", en: "Music" },
    title: { tr: "Duvardaki albümler", en: "The albums on the wall" },
    body: {
      tr: "Duvardaki her çerçeve tekrar tekrar dinlediğim bir albüm. Çalışırken kulaklık hep kafamda.",
      en: "Every frame on the wall is an album I keep coming back to. The headphones are on whenever I work.",
    },
    items: [
      { name: "Daft Punk · Random Access Memories", note: { tr: "Gece kodlama albümü", en: "Late-night coding record" } },
      { name: "Tame Impala · Currents", note: { tr: "Baştan sona", en: "Start to finish" } },
      { name: "Tame Impala · The Slow Rush", note: { tr: "Pazar sabahı", en: "Sunday mornings" } },
      { name: "Travis Scott · Astroworld", note: { tr: "Enerji lazımsa", en: "When I need energy" } },
      { name: "Arctic Monkeys · AM", note: { tr: "Klasik", en: "A classic" } },
    ],
  },
  collection: {
    id: "collection",
    label: { tr: "Koleksiyon", en: "Collection" },
    title: { tr: "Raflar ve figürler", en: "Shelves and figures" },
    body: {
      tr: "Raflardaki her figürün bir hikâyesi var. Örümcek Adam en kalabalık rafı tutuyor; yanında Star Wars ve çerçevelerde 1:64 ölçek arabalar.",
      en: "Every figure on these shelves has a story. Spider-Man holds the busiest shelf, next to Star Wars and framed 1:64 scale cars.",
    },
    items: [
      { name: "Spider-Man", note: { tr: "Figür, maske, çizgi roman", en: "Figures, mask, comics" } },
      { name: "Star Wars", note: { tr: "Grogu ve Stormtrooper", en: "Grogu and a Stormtrooper" } },
      { name: "Diecast", note: { tr: "Çerçeveli ve kutulu model arabalar", en: "Framed and boxed model cars" } },
      { name: "Sneaker", note: { tr: "En üst rafta duranlar", en: "The pair on the top shelf" } },
    ],
  },
  games: {
    id: "games",
    label: { tr: "Oyun", en: "Games" },
    title: { tr: "Oyun köşesi", en: "The gaming corner" },
    body: {
      tr: "İki kumanda, kendi topladığım bir PC ve masanın altında yedek klavyeler. Mesai bitince burası oyun istasyonu.",
      en: "Two controllers, a PC I built myself and spare keyboards under the desk. After hours this is a gaming station.",
    },
  },
  football: {
    id: "football",
    label: { tr: "Futbol", en: "Football" },
    title: { tr: "Duvardaki krampon", en: "The boots on the wall" },
    body: {
      tr: "Sahaya çıkamadığım günlerde duvarda dururlar. Halı saha kadrosu her zaman bir kişi eksik.",
      en: "They hang on the wall on days I can't get to the pitch. The five-a-side squad is always one player short.",
    },
  },
  gym: {
    id: "gym",
    label: { tr: "Spor", en: "Gym" },
    title: { tr: "Masanın köşesindeki kutu", en: "The tub on the corner" },
    body: {
      tr: "Ekran başında geçen günleri dengelemek için düzenli spor yapıyorum.",
      en: "I train regularly to balance out the days spent at a screen.",
    },
  },
};

export const deskText = {
  tr: {
    welcome: "Masama hoş geldin",
    intro: "Burası çalıştığım köşe. Bilgisayara tıkla, projelerimi aç. Raflara, duvara ve kumandalara bakmayı unutma.",
    enter: "İçeri gel",
    classic: "Klasik siteye geç",
    back: "Geri",
    hint: "Parlayan nesnelere tıkla",
    loading: "Oda hazırlanıyor",
    pc: "Bilgisayar",
    open: "Aç",
    openProject: "Proje sayfası",
    spotify: "Spotify'da dinle",
    desktopTitle: "Batuhan'ın masaüstü",
    about: "Hakkımda.txt",
    contact: "İletişim",
    projectsFolder: "Projeler",
    shutdown: "Masaya dön",
    credits: "3D model teşekkürleri",
    noWebgl: "Bu tarayıcı 3D odayı açamadı. Aynı içerik klasik sitede de var.",
  },
  en: {
    welcome: "Welcome to my desk",
    intro: "This is the corner I work from. Click the computer to open my projects, and look around the shelves, the wall and the controllers.",
    enter: "Come in",
    classic: "Switch to classic site",
    back: "Back",
    hint: "Click the glowing objects",
    loading: "Setting up the room",
    pc: "Computer",
    open: "Open",
    openProject: "Project page",
    spotify: "Listen on Spotify",
    desktopTitle: "Batuhan's desktop",
    about: "About.txt",
    contact: "Contact",
    projectsFolder: "Projects",
    shutdown: "Back to desk",
    credits: "3D model credits",
    noWebgl: "This browser couldn't open the 3D room. Everything here is on the classic site too.",
  },
} as const;

export const deskPaths = { tr: "/masa/", en: "/en/desk/" } as const;

type ModelCredit = { title: string; author?: string; authorUrl?: string; sourceUrl?: string; license?: string; licenseUrl?: string };

/** Imported models that need attribution (written by `npm run model`). */
export function modelCredits(all: Record<string, ModelCredit>) {
  return Object.values(all).filter((m): m is Required<ModelCredit> => Boolean(m.author && m.sourceUrl));
}
