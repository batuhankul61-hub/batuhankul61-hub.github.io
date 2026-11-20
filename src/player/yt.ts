import { useSyncExternalStore } from "react";
import { isMuted, onMuteChange } from "../sfx";

/* =========================================================
   Müzik çalar: YouTube'un resmi gömülü çaları (IFrame API).
   İki çalma listesi var: Retro (NFS klasikleri) ve Stüdyo.
   Her video, sitede gömülü çalarda tek tek denenip oynatılabildiği
   doğrulandı. YouTube yalnızca çalar ilk açıldığında yüklenir ve
   çerezsiz alan adı (youtube-nocookie.com) kullanılır.
   YouTube'un kendi kontrolleri gizli; ses, ilerleme ve şarkı
   seçimi bizim arayüzümüzden yapılıyor.
   ========================================================= */

export type YtTrack = { id: string; title: string; artist: string };
export type Playlist = { key: "retro" | "studio"; tracks: YtTrack[] };

export const STUDIO_LIST: Playlist = {
  key: "studio",
  tracks: [
    { id: "3l6T5kDb29Y", title: "Blue Panamera", artist: "bicycle ride" },
    // tLXkp9607BY başka sitelerde oynatmaya kapalı; bu yükleme açık
    { id: "HxthaCYPdCQ", title: "Eatin' Good", artist: "Woodcamp" },
    { id: "XzuMe6VlCgU", title: "Where The Party At", artist: "Yere" },
    { id: "em0MknB6wFo", title: "Something About Us", artist: "Daft Punk" },
    { id: "GHe8kKO8uds", title: "Eventually", artist: "Tame Impala" },
    // "Eventually" mix'inden rastgele seçilenler
    { id: "odeHP8N4LKc", title: "Let It Happen", artist: "Tame Impala" },
    { id: "_9bw_VtMUGA", title: "New Person, Same Old Mistakes", artist: "Tame Impala" },
    { id: "nyuo9-OjNNg", title: "I Wanna Be Yours", artist: "Arctic Monkeys" },
    { id: "PvM79DJ2PmM", title: "The Less I Know The Better", artist: "Tame Impala" },
    // Travis Scott
    { id: "_VRyoaNF9sk", title: "FRANCHISE", artist: "Travis Scott ft. Young Thug & M.I.A." },
    { id: "_EyZUTDAH0U", title: "BUTTERFLY EFFECT", artist: "Travis Scott" },
    { id: "OWl9p3oFKgg", title: "HIGHEST IN THE ROOM", artist: "Travis Scott" },
    { id: "U-l4ya3ejko", title: "FE!N", artist: "Travis Scott ft. Playboi Carti" },
  ],
};

export const RETRO_LIST: Playlist = {
  key: "retro",
  tracks: [
    // istenenler önce
    { id: "M_s95No5E-s", title: "Nine Thou (Superstars Remix)", artist: "Styles of Beyond" },
    { id: "-6hxH80TCp8", title: "Riders On The Storm (Fredwreck Remix)", artist: "Snoop Dogg & The Doors" },
    { id: "IxdzBlBtONA", title: "Do Ya Thang", artist: "P$C ft. Young Dro" },
    { id: "7sLHlg_VW2A", title: "Fired Up", artist: "Hush" },
    { id: "ajmI1P3r1w4", title: "Lean Back", artist: "Terror Squad ft. Fat Joe & Remy Ma" },
    { id: "ZN43UoyAbwg", title: "Get Low", artist: "Lil Jon & The East Side Boyz ft. Ying Yang Twins" },
    // NFS Most Wanted 2005
    { id: "IHS3qJdxefY", title: "Bat Country", artist: "Avenged Sevenfold" },
    { id: "wj43--_NPhY", title: "Hand of Blood", artist: "Bullet for My Valentine" },
    { id: "-daTpfB-7K4", title: "Decadence", artist: "Disturbed" },
    { id: "wFAA0_Acvqw", title: "You'll Be Under My Wheels", artist: "The Prodigy" },
    { id: "Sp5SL-swuUg", title: "Skinnyman", artist: "Static-X" },
    { id: "L5JNM8wHTt0", title: "Tilted", artist: "Lupe Fiasco" },
    { id: "IswCPP69vcI", title: "Sets Go Up", artist: "Juvenile ft. Wacko" },
    { id: "labytsb3gfI", title: "Blood and Thunder", artist: "Mastodon" },
    { id: "e5A_BXELVvc", title: "Breakdown", artist: "Breaking Benjamin" },
  ],
};

/** YouTube küçük resmi (16:9). Topic yüklemelerinde ortadaki kare albüm kapağıdır. */
export const thumb = (id: string) => `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;

type State = {
  list: Playlist;
  index: number;
  playing: boolean;
  loaded: boolean;
  error: boolean;
  volume: number;
  time: number;
  duration: number;
};
let state: State = { list: STUDIO_LIST, index: 0, playing: false, loaded: false, error: false, volume: 70, time: 0, duration: 0 };
const subs = new Set<() => void>();
const set = (p: Partial<State>) => {
  state = { ...state, ...p };
  subs.forEach((f) => f());
};

/* ---------- YouTube IFrame API ---------- */
type YTPlayer = {
  playVideo(): void;
  pauseVideo(): void;
  loadVideoById(id: string): void;
  seekTo(s: number, allow: boolean): void;
  setVolume(v: number): void;
  getCurrentTime(): number;
  getDuration(): number;
  mute(): void;
  unMute(): void;
  destroy(): void;
};
declare global {
  interface Window {
    YT?: { Player: new (el: HTMLElement, opts: unknown) => YTPlayer };
    onYouTubeIframeAPIReady?: () => void;
  }
}

let api: Promise<void> | null = null;
function loadApi() {
  if (api) return api;
  api = new Promise<void>((resolve) => {
    if (window.YT?.Player) return resolve();
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };
    const s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    s.async = true;
    document.head.appendChild(s);
  });
  return api;
}

let player: YTPlayer | null = null;
let host: HTMLElement | null = null;
let wantPlay = false;
let clock: number | null = null;

onMuteChange((m) => (m ? player?.mute() : player?.unMute()));

const cur = () => state.list.tracks[state.index];

function startClock() {
  if (clock) return;
  clock = window.setInterval(() => {
    if (!player || !state.loaded) return;
    set({ time: player.getCurrentTime() || 0, duration: player.getDuration() || 0 });
  }, 500);
}

export const yt = {
  /** Sahne kendi listesini seçer (sahne değişince çalar zaten kaldırılır). */
  use(list: Playlist) {
    if (state.list !== list) set({ list, index: 0, playing: false, error: false, time: 0, duration: 0 });
  },
  /** Çalar penceresi ilk açılınca: API'yi yükle ve çaları kur (çalmaya başlamaz). */
  async mount(el: HTMLElement) {
    if (player && host === el) return;
    host = el;
    await loadApi();
    if (!window.YT || host !== el) return;
    const target = document.createElement("div");
    el.replaceChildren(target);
    player = new window.YT.Player(target, {
      host: "https://www.youtube-nocookie.com",
      videoId: cur().id,
      width: "100%",
      height: "100%",
      playerVars: { playsinline: 1, rel: 0, controls: 0, disablekb: 1, fs: 0, iv_load_policy: 3 },
      events: {
        onReady: () => {
          set({ loaded: true, error: false });
          player?.setVolume(state.volume);
          if (isMuted()) player?.mute();
          if (wantPlay) player?.playVideo();
          startClock();
        },
        onStateChange: (e: { data: number }) => {
          if (e.data === 1) set({ playing: true, error: false });
          else if (e.data === 2) set({ playing: false });
          else if (e.data === 0) yt.next(); // bitti: sıradaki
        },
        onError: () => set({ error: true, playing: false }),
      },
    });
  },
  play(i?: number) {
    wantPlay = true;
    if (i !== undefined && i !== state.index) {
      set({ index: i, error: false, time: 0, duration: 0 });
      if (state.loaded) player?.loadVideoById(cur().id);
      return;
    }
    if (state.loaded) player?.playVideo();
  },
  pause() {
    wantPlay = false;
    player?.pauseVideo();
  },
  toggle() {
    if (state.playing) yt.pause();
    else yt.play();
  },
  next() {
    yt.play((state.index + 1) % state.list.tracks.length);
  },
  prev() {
    yt.play((state.index - 1 + state.list.tracks.length) % state.list.tracks.length);
  },
  seek(s: number) {
    player?.seekTo(s, true);
    set({ time: s });
  },
  setVolume(v: number) {
    player?.setVolume(v);
    set({ volume: v });
  },
  /** Sahne kapanınca (sürüm değişince) çaları kaldır */
  dispose() {
    wantPlay = false;
    if (clock) window.clearInterval(clock);
    clock = null;
    player?.destroy();
    player = null;
    host = null;
    set({ playing: false, loaded: false, time: 0, duration: 0 });
  },
};

const snap = () => state;
export function useYt() {
  const s = useSyncExternalStore(
    (f) => {
      subs.add(f);
      return () => {
        subs.delete(f);
      };
    },
    snap,
    snap
  );
  return { ...s, track: s.list.tracks[s.index] };
}
