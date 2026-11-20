import * as THREE from "three";

// Tüm dokular kodla <canvas> üzerine çiziliyor; harici görsel yok.
export function make(w: number, h: number, draw: (c: CanvasRenderingContext2D, w: number, h: number) => void) {
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  const c = cv.getContext("2d")!;
  draw(c, w, h);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

export function rand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function floorTex() {
  const r = rand(7);
  const t = make(1024, 1024, (c, w, h) => {
    const rows = 10;
    const rh = h / rows;
    for (let i = 0; i < rows; i++) {
      let x = -r() * 300;
      while (x < w) {
        const len = 250 + r() * 300;
        const l = 26 + r() * 8;
        c.fillStyle = `hsl(${24 + r() * 6}, ${38 + r() * 10}%, ${l}%)`;
        c.fillRect(x, i * rh, len, rh);
        c.strokeStyle = "rgba(0,0,0,.08)";
        for (let k = 0; k < 6; k++) {
          c.beginPath();
          const yy = i * rh + r() * rh;
          c.moveTo(x, yy);
          c.bezierCurveTo(x + len * 0.3, yy + 4, x + len * 0.6, yy - 4, x + len, yy);
          c.stroke();
        }
        c.fillStyle = "rgba(0,0,0,.45)";
        c.fillRect(x, i * rh, 3, rh);
        x += len;
      }
      c.fillStyle = "rgba(0,0,0,.5)";
      c.fillRect(0, i * rh, w, 3);
    }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(3, 3);
  return t;
}

export function wallpaperTex() {
  const t = make(512, 512, (c, w, h) => {
    c.fillStyle = "#2c5a5c";
    c.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 64) {
      c.fillStyle = "#336769";
      c.fillRect(x, 0, 32, h);
      c.fillStyle = "rgba(240,200,120,.18)";
      c.fillRect(x + 30, 0, 4, h);
    }
    c.fillStyle = "rgba(240,200,120,.22)";
    for (let y = 16; y < h; y += 48) {
      for (let x = 16; x < w; x += 64) {
        c.beginPath();
        c.arc(x, y + ((x / 64) % 2) * 24, 3, 0, Math.PI * 2);
        c.fill();
      }
    }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(4, 2);
  return t;
}

export function posterTex(lines: string[], bg: string, fg: string, accent: string) {
  return make(512, 720, (c, w, h) => {
    c.fillStyle = bg;
    c.fillRect(0, 0, w, h);
    // güneş batımı şeritleri
    for (let i = 0; i < 6; i++) {
      c.fillStyle = accent;
      c.globalAlpha = 0.9 - i * 0.12;
      c.fillRect(0, h * 0.52 + i * 26, w, 14 - i * 2);
    }
    c.globalAlpha = 1;
    c.beginPath();
    c.arc(w / 2, h * 0.52, 150, Math.PI, 0);
    c.fillStyle = accent;
    c.fill();
    c.fillStyle = fg;
    c.textAlign = "center";
    c.font = "bold 74px 'Courier New', monospace";
    lines.forEach((l, i) => c.fillText(l, w / 2, 110 + i * 82));
    c.font = "bold 30px 'Courier New', monospace";
    c.fillText("· 1998 ·", w / 2, h - 50);
    c.strokeStyle = fg;
    c.lineWidth = 10;
    c.strokeRect(14, 14, w - 28, h - 28);
  });
}

export function windowTex() {
  const r = rand(42);
  return make(512, 640, (c, w, h) => {
    const g = c.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#070b24");
    g.addColorStop(0.7, "#1b2357");
    g.addColorStop(1, "#4a2f62");
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);
    for (let i = 0; i < 140; i++) {
      c.fillStyle = `rgba(255,255,255,${0.3 + r() * 0.7})`;
      const s = r() < 0.9 ? 1.5 : 3;
      c.fillRect(r() * w, r() * h * 0.7, s, s);
    }
    // ay
    c.fillStyle = "#fff5d6";
    c.shadowColor = "#fff5d6";
    c.shadowBlur = 40;
    c.beginPath();
    c.arc(w * 0.72, h * 0.2, 42, 0, Math.PI * 2);
    c.fill();
    c.shadowBlur = 0;
    c.fillStyle = "#1b2357";
    c.beginPath();
    c.arc(w * 0.72 + 18, h * 0.2 - 10, 38, 0, Math.PI * 2);
    c.fill();
    // şehir silueti
    let x = 0;
    while (x < w) {
      const bw = 30 + r() * 50;
      const bh = 80 + r() * 200;
      c.fillStyle = "#0a0c1c";
      c.fillRect(x, h - bh, bw, bh);
      for (let yy = h - bh + 10; yy < h - 10; yy += 18) {
        for (let xx = x + 6; xx < x + bw - 8; xx += 12) {
          if (r() < 0.3) {
            c.fillStyle = r() < 0.8 ? "#ffd27a" : "#7af0ff";
            c.fillRect(xx, yy, 5, 8);
          }
        }
      }
      x += bw + 2;
    }
  });
}

export function keyboardTex() {
  return make(1024, 360, (c, w, h) => {
    c.fillStyle = "#cfc6ae";
    c.fillRect(0, 0, w, h);
    const rows = [14, 14, 13, 12, 9];
    const kh = 56;
    rows.forEach((n, ri) => {
      const y = 22 + ri * (kh + 10);
      let kw = (w * 0.78 - 20) / n;
      for (let i = 0; i < n; i++) {
        let ww = kw - 8;
        let x = 20 + i * kw + ri * 8;
        if (ri === 4 && i === 3) {
          ww = kw * 4;
        }
        if (ri === 4 && i > 3) x += kw * 3;
        if (ri === 4 && i > 6) continue;
        c.fillStyle = "#b8ae94";
        c.fillRect(x, y + 4, ww, kh);
        c.fillStyle = "#e8e0c8";
        c.fillRect(x + 4, y, ww - 8, kh - 8);
      }
    });
    // numpad
    for (let r = 0; r < 5; r++)
      for (let k = 0; k < 4; k++) {
        const x = w * 0.81 + k * 46;
        const y = 22 + r * 66;
        c.fillStyle = "#b8ae94";
        c.fillRect(x, y + 4, 40, kh);
        c.fillStyle = "#e8e0c8";
        c.fillRect(x + 4, y, 32, kh - 8);
      }
  });
}

export function stickyTex(lines: string[]) {
  return make(256, 256, (c, w, h) => {
    c.fillStyle = "#ffe866";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "rgba(0,0,0,.06)";
    c.fillRect(0, 0, w, 30);
    c.fillStyle = "#2a2a8a";
    c.font = "bold 34px 'Comic Sans MS', 'Segoe Print', cursive";
    c.textAlign = "center";
    lines.forEach((l, i) => c.fillText(l, w / 2, 90 + i * 50));
  });
}

export function labelTex(text: string, bg = "#d8cfb6", fg = "#5b5442") {
  return make(256, 64, (c, w, h) => {
    c.fillStyle = bg;
    c.fillRect(0, 0, w, h);
    c.fillStyle = fg;
    c.font = "italic bold 38px Georgia, serif";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText(text, w / 2, h / 2 + 2);
  });
}

export function floppyTex(color: string, label: string) {
  return make(256, 256, (c, w, h) => {
    c.fillStyle = color;
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#9aa0a8";
    c.fillRect(70, 0, 120, 80);
    c.fillStyle = color;
    c.fillRect(150, 10, 26, 60);
    c.fillStyle = "#f4f1e6";
    c.fillRect(30, 120, 196, 120);
    c.fillStyle = "#222";
    c.font = "bold 28px 'Comic Sans MS', cursive";
    c.textAlign = "center";
    c.fillText(label, w / 2, 190);
  });
}
