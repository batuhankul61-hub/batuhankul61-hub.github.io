import * as THREE from "three";

function canvas(w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) {
  const el = document.createElement("canvas");
  el.width = w;
  el.height = h;
  const c = el.getContext("2d")!;
  draw(c);
  const tex = new THREE.CanvasTexture(el);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

const cache = new Map<string, THREE.Texture>();
function cached(key: string, make: () => THREE.Texture) {
  let t = cache.get(key);
  if (!t) {
    t = make();
    cache.set(key, t);
  }
  return t;
}

/** Main monitor: a small desktop with file icons, hinting that it can be opened. */
export function mainScreenTexture(title: string, icons: string[]) {
  return cached(`main:${title}:${icons.join()}`, () =>
    canvas(1024, 600, (c) => {
      const g = c.createLinearGradient(0, 0, 1024, 600);
      g.addColorStop(0, "#0f2a2a");
      g.addColorStop(1, "#141026");
      c.fillStyle = g;
      c.fillRect(0, 0, 1024, 600);
      icons.forEach((name, i) => {
        const x = 40 + Math.floor(i / 5) * 130;
        const y = 36 + (i % 5) * 100;
        c.fillStyle = i === 0 ? "#f2c94c" : "#5eead4";
        c.beginPath();
        c.roundRect(x + 22, y, 56, 48, 8);
        c.fill();
        c.fillStyle = "#e8e8ea";
        c.font = "500 15px system-ui, sans-serif";
        c.textAlign = "center";
        c.fillText(name.length > 14 ? name.slice(0, 13) + "…" : name, x + 50, y + 70);
      });
      c.fillStyle = "rgba(255,255,255,0.08)";
      c.beginPath();
      c.roundRect(560, 150, 400, 240, 14);
      c.fill();
      c.fillStyle = "#ededef";
      c.textAlign = "left";
      c.font = "700 34px system-ui, sans-serif";
      c.fillText(title, 590, 215);
      c.fillStyle = "#5eead4";
      c.font = "500 22px ui-monospace, monospace";
      c.fillText("> click to open_", 590, 270);
      c.fillStyle = "#a1a1aa";
      c.font = "400 18px system-ui, sans-serif";
      c.fillText("AI Automation & Workflow Engineer", 590, 320);
      c.fillStyle = "rgba(0,0,0,0.55)";
      c.fillRect(0, 556, 1024, 44);
      c.fillStyle = "#5eead4";
      c.fillRect(16, 566, 24, 24);
    }),
  );
}

/** Side monitor wallpaper: glowing blossoms. */
export function blossomTexture() {
  return cached("blossom", () =>
    canvas(800, 480, (c) => {
      c.fillStyle = "#050507";
      c.fillRect(0, 0, 800, 480);
      const flower = (x: number, y: number, r: number) => {
        for (let p = 0; p < 5; p++) {
          const a = (p / 5) * Math.PI * 2;
          const px = x + Math.cos(a) * r * 0.6;
          const py = y + Math.sin(a) * r * 0.6;
          const g = c.createRadialGradient(px, py, 1, px, py, r * 0.6);
          g.addColorStop(0, "rgba(235,225,255,0.95)");
          g.addColorStop(1, "rgba(120,110,230,0.15)");
          c.fillStyle = g;
          c.beginPath();
          c.arc(px, py, r * 0.55, 0, Math.PI * 2);
          c.fill();
        }
        c.fillStyle = "#ffffff";
        c.beginPath();
        c.arc(x, y, r * 0.15, 0, Math.PI * 2);
        c.fill();
      };
      c.strokeStyle = "rgba(110,220,200,0.7)";
      c.lineWidth = 3;
      for (let i = 0; i < 6; i++) {
        c.beginPath();
        c.moveTo(560, 330);
        c.quadraticCurveTo(450, 260 - i * 20, 300 + i * 40, 120 + (i % 3) * 60);
        c.stroke();
      }
      [[300, 120, 44], [360, 190, 38], [420, 110, 40], [460, 210, 34], [330, 260, 36], [400, 300, 30], [500, 150, 32]].forEach(
        ([x, y, r]) => flower(x, y, r),
      );
      const leaf = c.createLinearGradient(520, 300, 700, 380);
      leaf.addColorStop(0, "#2a6cf0");
      leaf.addColorStop(1, "#7fd8ff");
      c.fillStyle = leaf;
      c.beginPath();
      c.ellipse(610, 340, 110, 34, -0.2, 0, Math.PI * 2);
      c.fill();
    }),
  );
}

export function keyboardTexture() {
  return cached("kbd", () =>
    canvas(512, 160, (c) => {
      c.fillStyle = "#e9e6ee";
      c.fillRect(0, 0, 512, 160);
      for (let r = 0; r < 5; r++)
        for (let k = 0; k < 15; k++) {
          const dark = r === 0 || k > 12 || (r === 4 && k < 3);
          c.fillStyle = dark ? "#26242c" : k % 4 === 0 ? "#f3d6e6" : "#fbfbfd";
          c.beginPath();
          c.roundRect(10 + k * 33, 8 + r * 30, 29, 26, 4);
          c.fill();
        }
      c.fillStyle = "#7ef0c0";
      c.fillRect(440, 10, 60, 4);
    }),
  );
}

export function labelTexture(text: string, bg: string, fg: string) {
  return cached(`label:${text}:${bg}`, () =>
    canvas(256, 256, (c) => {
      c.fillStyle = bg;
      c.fillRect(0, 0, 256, 256);
      c.fillStyle = fg;
      c.font = "900 64px system-ui, sans-serif";
      c.textAlign = "center";
      c.fillText(text, 128, 150);
    }),
  );
}

/** Seeded value noise drawn to a canvas: used for roughness/bump so surfaces aren't perfectly uniform. */
function noiseCanvas(size: number, seed: number, lo: number, hi: number, blobs: number) {
  return canvas(size, size, (c) => {
    let s = seed;
    const rnd = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
    const img = c.createImageData(size, size);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.round((lo + (hi - lo) * rnd()) * 255);
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    c.putImageData(img, 0, 0);
    // Soft larger blotches over the fine grain, like smudges and wear.
    for (let i = 0; i < blobs; i++) {
      const x = rnd() * size;
      const y = rnd() * size;
      const r = 8 + rnd() * size * 0.12;
      const g = c.createRadialGradient(x, y, 0, x, y, r);
      const a = 0.05 + rnd() * 0.08;
      g.addColorStop(0, rnd() > 0.5 ? `rgba(255,255,255,${a})` : `rgba(0,0,0,${a})`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      c.fillStyle = g;
      c.fillRect(x - r, y - r, r * 2, r * 2);
    }
  });
}

/** Subtle roughness variation for every prop. */
export function grainTexture() {
  return cached("grain", () => {
    const t = noiseCanvas(256, 7, 0.82, 1, 60);
    t.colorSpace = THREE.NoColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  });
}

/** Plaster wall bump. */
export function plasterTexture() {
  return cached("plaster", () => {
    const t = noiseCanvas(512, 31, 0.35, 0.65, 160);
    t.colorSpace = THREE.NoColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(4, 2);
    return t;
  });
}

/** Grout lines darker than the tile face so the floor reads as tiles under bump + roughness. */
export function tileRoughTexture() {
  return cached("tilesRough", () => {
    const t = canvas(512, 512, (c) => {
      c.fillStyle = "#4a4a4a";
      c.fillRect(0, 0, 512, 512);
      c.fillStyle = "#c8c8c8";
      for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) c.fillRect(i * 256 + 3, j * 256 + 3, 250, 250);
    });
    t.colorSpace = THREE.NoColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(6, 10);
    return t;
  });
}

export function tileTexture() {
  return cached("tiles", () => {
    const t = canvas(512, 512, (c) => {
      c.fillStyle = "#d9d8d4";
      c.fillRect(0, 0, 512, 512);
      c.fillStyle = "#e9e8e4";
      for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) c.fillRect(i * 256 + 3, j * 256 + 3, 250, 250);
    });
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(6, 10);
    return t;
  });
}
