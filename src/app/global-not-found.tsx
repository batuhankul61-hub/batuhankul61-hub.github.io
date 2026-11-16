import type { Metadata } from "next";
import { Shell } from "@/components/Shell";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: `404 · ${site.name}`,
  description: "Sayfa bulunamadı · Page not found",
  robots: { index: false },
  icons: { icon: "/icon.svg", apple: "/apple-touch-icon.png" },
};

// GitHub Pages serves one 404.html for every language, so it speaks both.
export default function GlobalNotFound() {
  return (
    <Shell lang="tr">
      <main className="container notfound">
        <p className="mono-label">404</p>
        <h1>
          Bu sayfa burada değil.
          <span className="dim" lang="en">
            This page isn&apos;t here.
          </span>
        </h1>
        <p className="muted">
          Link eskimiş ya da adres yanlış yazılmış olabilir.{" "}
          <span lang="en">The link may be out of date or the address mistyped.</span>
        </p>
        <div className="actions">
          <a href="/" className="btn btn-primary">
            Ana sayfa
          </a>
          <a href="/en/" className="btn" lang="en">
            Home (English)
          </a>
        </div>
      </main>
    </Shell>
  );
}
