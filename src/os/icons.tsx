// Basit piksel tarzı SVG ikonlar (32x32 ızgara).
type P = { size?: number };
const svg = (size: number, children: React.ReactNode) => (
  <svg width={size} height={size} viewBox="0 0 32 32" shapeRendering="crispEdges" aria-hidden="true">
    {children}
  </svg>
);

export const IconUser = ({ size = 32 }: P) =>
  svg(size, <>
    <rect x="4" y="4" width="24" height="24" fill="#fff" stroke="#000" strokeWidth="2" />
    <rect x="12" y="8" width="8" height="8" fill="#f2b880" stroke="#000" strokeWidth="1.5" />
    <rect x="8" y="18" width="16" height="9" fill="#3a6ea5" stroke="#000" strokeWidth="1.5" />
  </>);

export const IconFolder = ({ size = 32 }: P) =>
  svg(size, <>
    <path d="M3 9h10l2 3h14v15H3z" fill="#f6d365" stroke="#000" strokeWidth="2" />
    <rect x="3" y="14" width="26" height="13" fill="#ffe08a" stroke="#000" strokeWidth="2" />
  </>);

export const IconDoc = ({ size = 32 }: P) =>
  svg(size, <>
    <path d="M7 3h13l6 6v20H7z" fill="#fff" stroke="#000" strokeWidth="2" />
    <path d="M20 3v6h6" fill="#ddd" stroke="#000" strokeWidth="2" />
    {[13, 17, 21, 25].map((y) => <rect key={y} x="10" y={y} width={y === 25 ? 8 : 13} height="2" fill="#3a6ea5" />)}
  </>);

export const IconMail = ({ size = 32 }: P) =>
  svg(size, <>
    <rect x="3" y="8" width="26" height="17" fill="#fff" stroke="#000" strokeWidth="2" />
    <path d="M3 8l13 10 13-10" fill="none" stroke="#c0392b" strokeWidth="2" />
  </>);

export const IconNote = ({ size = 32 }: P) =>
  svg(size, <>
    <rect x="6" y="4" width="20" height="25" fill="#fffbe0" stroke="#000" strokeWidth="2" />
    <rect x="6" y="4" width="20" height="5" fill="#5aa9e6" stroke="#000" strokeWidth="2" />
    {[13, 17, 21].map((y) => <rect key={y} x="9" y={y} width="14" height="1.5" fill="#888" />)}
  </>);

export const IconTrash = ({ size = 32 }: P) =>
  svg(size, <>
    <rect x="8" y="9" width="16" height="20" fill="#cfd8dc" stroke="#000" strokeWidth="2" />
    <rect x="6" y="6" width="20" height="4" fill="#90a4ae" stroke="#000" strokeWidth="2" />
    {[12, 16, 20].map((x) => <rect key={x} x={x} y="12" width="2" height="14" fill="#607d8b" />)}
    <rect x="17" y="2" width="9" height="7" fill="#fff" stroke="#000" strokeWidth="1.5" transform="rotate(15 21 5)" />
  </>);

export const IconWarn = ({ size = 32 }: P) =>
  svg(size, <>
    <path d="M16 3l14 26H2z" fill="#ffd60a" stroke="#000" strokeWidth="2" />
    <rect x="15" y="11" width="3" height="10" fill="#000" />
    <rect x="15" y="23" width="3" height="3" fill="#000" />
  </>);

export const IconPaint = ({ size = 32 }: P) =>
  svg(size, <>
    <rect x="3" y="5" width="26" height="20" fill="#fff" stroke="#000" strokeWidth="2" />
    <rect x="5" y="7" width="7" height="7" fill="#ef476f" />
    <rect x="12" y="7" width="7" height="7" fill="#ffd166" />
    <rect x="19" y="7" width="8" height="7" fill="#06d6a0" />
    <rect x="5" y="14" width="22" height="9" fill="#118ab2" />
    <rect x="12" y="25" width="8" height="4" fill="#888" stroke="#000" strokeWidth="1.5" />
  </>);

export const IconHeart = ({ size = 32 }: P) =>
  svg(size, <>
    <path d="M16 28 4 16c-4-4-1-11 5-11 3 0 5 2 7 4 2-2 4-4 7-4 6 0 9 7 5 11z" fill="#ef476f" stroke="#000" strokeWidth="2" />
    <rect x="8" y="9" width="4" height="3" fill="#fff" opacity=".7" />
  </>);

export const IconComputer =({ size = 32 }: P) =>
  svg(size, <>
    <rect x="4" y="4" width="24" height="18" fill="#d9d0b8" stroke="#000" strokeWidth="2" />
    <rect x="7" y="7" width="18" height="12" fill="#1f6f8b" />
    <rect x="10" y="22" width="12" height="3" fill="#c2b89c" stroke="#000" strokeWidth="1.5" />
    <rect x="6" y="25" width="20" height="4" fill="#d9d0b8" stroke="#000" strokeWidth="1.5" />
  </>);
