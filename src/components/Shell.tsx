import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
import type { Lang } from "@/content/site";
import "@/app/globals.css";

const sans = Geist({ subsets: ["latin", "latin-ext"], variable: "--font-sans" });
const mono = Geist_Mono({ subsets: ["latin", "latin-ext"], variable: "--font-mono" });

// Runs before paint so the stored theme never flashes.
const themeScript = `try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

export function Shell({ lang, children }: { lang: Lang; children: ReactNode }) {
  return (
    <html lang={lang} className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <div className="bg" aria-hidden="true">
          <div className="bg-grid" />
          <div className="bg-glow" />
        </div>
        {children}
      </body>
    </html>
  );
}
