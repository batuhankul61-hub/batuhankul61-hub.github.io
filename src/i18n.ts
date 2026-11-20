import { useSyncExternalStore } from "react";

// Basit dil durumu: modül düzeyinde tutulur, değişince abone bileşenler yeniden çizilir.
export type Lang = "tr" | "en";

const KEY = "portfolio-lang";

function initial(): Lang {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === "tr" || saved === "en") return saved;
  } catch {
    /* depolama yoksa tarayıcı diline bak */
  }
  return navigator.language?.toLowerCase().startsWith("tr") ? "tr" : "en";
}

let current: Lang = initial();
const subs = new Set<() => void>();
if (typeof document !== "undefined") document.documentElement.lang = current;

export const getLang = () => current;

export function setLang(l: Lang) {
  if (l === current) return;
  current = l;
  try {
    localStorage.setItem(KEY, l);
  } catch {
    /* yok say */
  }
  document.documentElement.lang = l;
  subs.forEach((f) => f());
}

function subscribe(f: () => void) {
  subs.add(f);
  return () => {
    subs.delete(f);
  };
}

/** Dili okuyan bileşen dil değişince yeniden çizilir. */
export function useLang() {
  return useSyncExternalStore(subscribe, getLang, getLang);
}

/** Satır içi çeviri: tx("Merhaba", "Hello") */
export const tx = (tr: string, en: string) => (current === "en" ? en : tr);

/** Tarih/saat biçimleri için yerel ayar */
export const locale = () => (current === "en" ? "en-US" : "tr-TR");
