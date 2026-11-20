// Dock ikonları: renkli yuvarlatılmış kare + beyaz çizgi ikon.
type G = { size?: number };

const wrap = (size: number, children: React.ReactNode) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

export const GPerson = ({ size = 24 }: G) => wrap(size, <><circle cx="12" cy="8.5" r="3.5" /><path d="M5 20c1.2-3.6 4-5.2 7-5.2s5.8 1.6 7 5.2" /></>);
export const GFolder = ({ size = 24 }: G) => wrap(size, <><path d="M3 7.5A1.5 1.5 0 0 1 4.5 6H9l2 2h8.5A1.5 1.5 0 0 1 21 9.5v8A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5z" /></>);
export const GDoc = ({ size = 24 }: G) => wrap(size, <><path d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" /><path d="M14 3v4h4M9 12h6M9 15.5h6M9 9h2" /></>);
export const GSend = ({ size = 24 }: G) => wrap(size, <><path d="M21 3 10 14" /><path d="M21 3 14.5 21l-4.5-7-7-4.5z" /></>);
export const GNote = ({ size = 24 }: G) => wrap(size, <><rect x="5" y="3.5" width="14" height="17" rx="2" /><path d="M8.5 8.5h7M8.5 12h7M8.5 15.5h4" /></>);
export const GGear = ({ size = 24 }: G) =>
  wrap(size, <>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7" />
  </>);
export const GSparkle = ({ size = 24 }: G) => wrap(size, <><path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6z" /><path d="M19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" /></>);
export const GSearch = ({ size = 24 }: G) => wrap(size, <><circle cx="11" cy="11" r="6" /><path d="m20 20-4.5-4.5" /></>);
export const GBack = ({ size = 24 }: G) => wrap(size, <path d="M15 5l-7 7 7 7" />);
export const GCat = ({ size = 24 }: G) =>
  wrap(size, <>
    <path d="M5 9V4l4 3h6l4-3v5c0 5-3 9-7 9s-7-4-7-9z" />
    <path d="M9.5 12h.01M14.5 12h.01M11 15h2" />
  </>);

// Kendi logomuz: iki yarım daire ("makara")
export const Mark = ({ size = 16 }: G) => (
  <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
    <path d="M8 1.5a6.5 6.5 0 0 0 0 13z" fill="currentColor" />
    <path d="M8 4.5a3.5 3.5 0 0 1 0 7z" fill="currentColor" />
  </svg>
);
export const GHeart = ({ size = 24 }: G) => wrap(size, <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />);
