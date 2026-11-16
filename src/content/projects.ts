import type { Lang } from "./site";

type L = Record<Lang, string>;

export type Project = {
  slug: string;
  name: string;
  /** GitHub repo name; omitted for projects without a public repo. */
  repo?: string;
  year: string;
  stack: string[];
  /** Short accent used for cards without a screenshot. */
  mark: string;
  hue: number;
  /** Full-width card on the home page. */
  wide?: boolean;
  /** Half-width card (pairs in the last row). */
  half?: boolean;
  image?: { src: string; alt: L };
  gallery?: { src: string; alt: L }[];
  demo?: string;
  credit?: L;
  /** Measured numbers shown on the card and the detail page. */
  results?: { value: string; label: L }[];
  status: L;
  tagline: L;
  summary: L;
  highlights: Record<Lang, string[]>;
};

export const projects: Project[] = [
  {
    slug: "kul-ai-netcad",
    name: "Kul AI · NETCAD",
    repo: "netcad-claude-bridge",
    year: "2026",
    stack: ["C# / .NET", "OOP", "LLM Agents", "MCP", "PowerShell", "Gemini", "Ollama", "Claude"],
    mark: "KUL",
    hue: 210,
    wide: true,
    image: {
      src: "/projects/netcad/kurulum.png",
      alt: { tr: "Kul AI NETCAD kurulum klasörü: Kur.bat ve Claude-Bagla.bat", en: "Kul AI NETCAD install folder: Kur.bat and Claude-Bagla.bat" },
    },
    results: [
      { value: "21", label: { tr: "araç", en: "tools" } },
      { value: "3", label: { tr: "model sağlayıcı", en: "model providers" } },
    ],
    status: { tr: "Beta", en: "Beta" },
    tagline: { tr: "NETCAD 8.5 için Türkçe yapay zekâ asistanı ve MCP köprüsü", en: "A Turkish AI assistant and MCP bridge for NETCAD 8.5" },
    summary: {
      tr: "NETCAD 8.5'in içinde, nesne yönelimli C# ile yazılmış bir asistan paneli. Türkçe istekleri 21 araç üzerinden çizim, parsel ifrazı ve koordinat dönüşümü işlemlerine çeviriyor. Gemini, Ollama ve Claude ile çalışıyor; Claude Code için API anahtarı gerektirmeyen bir MCP köprüsü var.",
      en: "An assistant panel inside NETCAD 8.5, written in object-oriented C#, that turns Turkish requests into drawing, parcel subdivision and coordinate transformation operations through 21 tools, with Gemini, Ollama and Claude as model providers, plus an MCP bridge for Claude Code that needs no API key.",
    },
    highlights: {
      tr: [
        "Araçları Claude Code'a açan MCP köprüsü; API anahtarı gerekmez",
        "İfraz: parseli eşit parçalara ya da verilen alanlara bölme; geometrisi birim testli",
        "EPSG arama ve koordinat dönüşümü (ör. ED50/TM30 → TUREF/TM30)",
        "Excel/CSV/TXT ve .ncn'den nokta aktarma; ondalık virgül ve Y/X karışıklığı uyarısı",
        "Silme ve toplu değişikliklerde kullanıcı onayı; kurulum paketleri GitHub Releases'te",
      ],
      en: [
        "MCP bridge that exposes the tools to Claude Code without an API key",
        "Parcel subdivision into equal parts or given areas, with unit-tested geometry",
        "EPSG lookup and coordinate transforms (e.g. ED50/TM30 → TUREF/TM30)",
        "Point import from Excel/CSV/TXT and .ncn, with decimal-comma and Y/X swap warnings",
        "User confirmation before deletes and bulk changes; installers published via GitHub Releases",
      ],
    },
  },
  {
    slug: "kavunos",
    name: "kavunOS",
    repo: "kavunOS",
    year: "2026",
    stack: ["Java", "Android TV", "JUnit", "Claude Code"],
    mark: "TV",
    hue: 120,
    wide: true,
    image: {
      src: "/projects/kavunos/home.jpg",
      alt: { tr: "kavunOS ana ekranı: gün batımı duvar kâğıdı ve uygulama sırası", en: "kavunOS home screen: sunset wallpaper and a row of apps" },
    },
    gallery: [
      {
        src: "/projects/kavunos/card.jpg",
        alt: { tr: "Önizleme kartı: Spotify'da çalan şarkı", en: "Preview card: a song playing on Spotify" },
      },
    ],
    credit: {
      tr: "Gathin'in MIT lisanslı cleanyourtv projesi üzerine kuruldu.",
      en: "Built on Gathin's MIT-licensed cleanyourtv project.",
    },
    results: [
      { value: "669 → 320 ms", label: { tr: "Ana ekrana dönüş", en: "Return to home" } },
      { value: "1244 → 450 ms", label: { tr: "Yeniden açılış", en: "Reopen" } },
      { value: "126 → 63–100 MB", label: { tr: "Bellek", en: "Memory" } },
    ],
    status: { tr: "Açık kaynak", en: "Open source" },
    tagline: { tr: "2 GB RAM'li TV çubukları için hızlı Android TV başlatıcısı", en: "A fast Android TV launcher for 2 GB RAM sticks" },
    summary: {
      tr: "2 GB RAM'li bir Android TV çubuğunun başlatıcısını, mevcut açık kaynak cleanyourtv kod tabanı üzerinde Claude ile yapay zekâ destekli geliştirmeyle yeniden yazdım. Önce hız, sonra estetik: cam görünümlü, yumuşak geçişli, tam ekran duvar kâğıdı üzerinde alçak bir uygulama sırası.",
      en: "I rebuilt the launcher of a 2 GB RAM Android TV stick through AI-driven development with Claude, on the existing open-source cleanyourtv codebase. Speed first, then looks: glassy, softly animated, with a low row of apps over a full-screen wallpaper.",
    },
    highlights: {
      tr: [
        "Ana ekrana dönüş 669 ms'den ~320 ms'ye, yeniden açılış 1244 ms'den ~450 ms'ye indi",
        "Bellek 126 MB'tan 63–100 MB'a, uygulama boyutu 532 KB'tan 430 KB'a düştü",
        "Kontrol merkezi, şu an çalıyor kartları, QR ile duvar kâğıdı yükleme",
        "23 dil desteği",
      ],
      en: [
        "Return-to-home from 669 ms to about 320 ms, reopen from 1244 ms to about 450 ms",
        "Memory from 126 MB to 63–100 MB, app size from 532 KB to 430 KB",
        "Control center, now-playing cards, QR wallpaper upload",
        "23 languages",
      ],
    },
  },
  {
    slug: "mario",
    name: "Mario",
    repo: "mario-agent",
    year: "2026",
    stack: ["Python", "Google ADK", "RAG", "FastAPI", "Gemini Live", "pytest"],
    mark: "MAR",
    hue: 0,
    wide: true,
    results: [
      { value: "0.972", label: { tr: "Yanıt doğruluğu", en: "Answer accuracy" } },
      { value: "1.0", label: { tr: "hit@3", en: "hit@3" } },
      { value: "185", label: { tr: "pytest testi", en: "pytest tests" } },
    ],
    status: { tr: "Günlük kullanımda", en: "In daily use" },
    tagline: { tr: "RAG hafızalı sesli yapay zekâ ajanı", en: "A voice AI agent with RAG memory" },
    summary: {
      tr: "Hub-and-spoke yapıda bir sesli ajan: Gemini Live talebi function calling ile Windows, bilgisayar ayarları, Gmail ve Claude Code araçlarına yönlendiriyor; araçları async, tip ipuçlu bir FastAPI sunucusu çalıştırıyor. Notları ve belgeleri hatırlayan bir RAG hafızası var.",
      en: "A hub-and-spoke voice agent: Gemini Live routes each request through function calling to tools for Windows, PC settings, Gmail and Claude Code, run by an async, type-hinted FastAPI server. It has RAG memory over notes and documents.",
    },
    highlights: {
      tr: [
        "Notlar ve belgeler parçalanıp gemini-embedding-001 ile SQLite vektör deposuna gömülüyor",
        "Google ADK araştırmacı ajanı, getirilen parçalarda olmayan kaynak gösterimlerini atıyor",
        "40 soruluk LLM-as-judge değerlendirmesi: hit@3 1.0, yanıt doğruluğu 0.972; 185 pytest testiyle birlikte regresyon kontrolü",
        "Yıkıcı işlemlerden önce sesli onay; her araç çağrısı denetim kaydına yazılıyor",
        "Hatırlatmalar, Google Takvim ve görevleri arka planda Claude Code'a devretme",
      ],
      en: [
        "Notes and documents are chunked and embedded with gemini-embedding-001 into a SQLite vector store",
        "A Google ADK researcher agent drops any citation missing from the retrieved chunks",
        "40-question LLM-as-judge eval: hit@3 1.0, answer accuracy 0.972, run as a regression check alongside 185 pytest tests",
        "Spoken confirmation before destructive actions; every tool call written to an audit log",
        "Reminders, Google Calendar, and background hand-off of tasks to Claude Code",
      ],
    },
  },
  {
    slug: "lucia",
    name: "Lucia",
    repo: "lucia",
    year: "2026",
    stack: ["JavaScript", "HTML / CSS", "FastAPI", "REST API", "WebSocket", "Gemini Live", "PWA", "GitHub Actions"],
    mark: "LUC",
    hue: 280,
    results: [{ value: "32", label: { tr: "CI'da pytest testi", en: "pytest tests in CI" } }],
    status: { tr: "Çalışıyor", en: "Working" },
    tagline: { tr: "Gerçek zamanlı İngilizce konuşma koçu", en: "A real-time English speaking coach" },
    summary: {
      tr: "Gemini Live sesini WebSocket üzerinden akıtan, sözünü kesebildiğin bir İngilizce konuşma koçu (PWA). RESTful API'sini tasarladığım FastAPI sunucusu tek kullanımlık token veriyor; API anahtarı sunucudan hiç çıkmıyor.",
      en: "A real-time English speaking coach (PWA) that streams Gemini Live voice over WebSocket with barge-in. I designed its RESTful API on a FastAPI server that issues single-use tokens, so the API key never leaves the server.",
    },
    highlights: {
      tr: [
        "Dilbilgisi raporu Pydantic şemasıyla üretiliyor; transkriptte olmayan her alıntı atılıyor",
        "Her konuşma için gecikme, token kullanımı ve maliyet kaydı",
        "Her push ve PR'da 32 pytest testi, ruff kontrolü ve frontend testleri (GitHub Actions)",
        "Geçmiş ve skor grafiği cihazda (IndexedDB); kendi anahtarınla sunucusuz mod",
      ],
      en: [
        "Grammar reports generated through a Pydantic schema; any quote not in the transcript is dropped",
        "Latency, token usage and cost recorded for every conversation",
        "GitHub Actions runs 32 pytest tests, ruff checks and frontend tests on every push and PR",
        "History and score chart on the device (IndexedDB); bring-your-own-key mode with no server",
      ],
    },
  },
  {
    slug: "kul-ai-cad",
    name: "Kul AI CAD",
    repo: "KulAICad",
    year: "2026",
    stack: ["C# / .NET", "AutoCAD API", "LLM Agents"],
    mark: "CAD",
    hue: 25,
    results: [{ value: "43", label: { tr: "araç", en: "tools" } }],
    status: { tr: "Geliştiriliyor", en: "In development" },
    tagline: { tr: "AutoCAD'deki ırgatlığı yapan yapay zekâ asistanı", en: "An AI assistant that does the AutoCAD grunt work" },
    summary: {
      tr: "AutoCAD 2022–2026 için 43 araçlı bir sohbet asistanı. Toplu PDF çıktısı, metraj, koordinat çizelgesi ve çizim temizliğini otomatikleştiriyor; çok sayıda DWG üzerinde toplu çalışabiliyor.",
      en: "A chat assistant for AutoCAD 2022–2026 with 43 tools that automates batch PDF plotting, quantity takeoff, coordinate tables and drawing cleanup, including batch runs across many DWG files.",
    },
    highlights: {
      tr: [
        "Her araç kendi transaction'ında ve belge kilidi altında çalışıyor; hata olursa çizim değişmeden kalıyor",
        "Toplu PDF / pafta çıktısı, çerçevelerden otomatik layout",
        "Metraj (uzunluk, alan, adet) CSV ve tablo olarak",
        "Alan ve kenar ölçüsü yazdırma, köşe koordinat çizelgesi",
        "Bozuk Türkçe karakter düzeltme (ý→ı, þ→ş, ð→ğ)",
      ],
      en: [
        "Each tool runs in its own transaction under a document lock, so a failed step leaves the drawing unchanged",
        "Batch PDF plotting, layouts generated from frames",
        "Quantity takeoff (length, area, count) to CSV and tables",
        "Area and segment length labels, vertex coordinate tables",
        "Fixes garbled Turkish characters (ý→ı, þ→ş, ð→ğ)",
      ],
    },
  },
  {
    slug: "harita-maliyet",
    name: "Harita Maliyet Hesaplayıcı",
    repo: "harita-maliyet-hesaplayici",
    year: "2026",
    stack: ["HTML / CSS / JS", "PWA", "Service Worker"],
    mark: "₺",
    hue: 150,
    demo: "https://batuhankul61-hub.github.io/harita-maliyet-hesaplayici/",
    status: { tr: "Yayında", en: "Live" },
    tagline: { tr: "Harita işleri için çevrimdışı maliyet ve teklif hesaplayıcı", en: "An offline cost and quote calculator for survey jobs" },
    summary: {
      tr: "Harita ve ölçüm işleri için saha maliyetini ve teklif fiyatını hesaplayan bir PWA. Telefona uygulama gibi kuruluyor, sahada internet olmadan çalışıyor; girilen değerler cihazda kalıyor.",
      en: "A PWA that models field costs and quote prices for surveying jobs. It installs like an app, works offline in the field, and keeps your rates on the device.",
    },
    highlights: {
      tr: [
        "Ekipman amortismanı (GPS, total station), yakıt, yemek, yevmiyeler",
        "HKMO ve tapu gibi resmi ücretler",
        "Arazi zorluk katsayısı, gelir vergisi, kâr marjı ve KDV",
        "Tamamen istemci tarafında; sunucu ya da derleme yok",
      ],
      en: [
        "Equipment depreciation (GPS, total station), fuel, meals, day rates",
        "Official fees such as HKMO and land registry",
        "Terrain difficulty factor, income tax, margin and VAT",
        "Fully client-side: no server, no build step",
      ],
    },
  },
  {
    slug: "batumtis",
    name: "batumtis",
    repo: "batumtis",
    year: "2026",
    stack: ["Python", "Playwright", "Claude Code", "SQLite"],
    mark: "JOB",
    hue: 45,
    half: true,
    results: [{ value: "8", label: { tr: "ilan kaynağı", en: "job sources" } }],
    status: { tr: "Kişisel kullanımda", en: "In personal use" },
    tagline: { tr: "Uzaktan iş başvuru botu", en: "A remote job application bot" },
    summary: {
      tr: "8 kaynaktan uzaktan iş ilanlarını toplayan, profile göre puanlayan ve uygun olanlara e-postayla başvuran ya da LinkedIn, Indeed ve Kariyer.net'te formu dolduran bir Python botu.",
      en: "A Python bot that collects remote job postings from 8 sources, scores them against a profile, and sends tailored email applications or fills application forms on LinkedIn, Indeed and Kariyer.net.",
    },
    highlights: {
      tr: [
        "Günlük çalışmada Claude Code her ilana 0–10 uygunluk puanı veriyor",
        "Eşiği geçen ilanlar için tek sayfalık özel CV ve ön yazı üretiliyor",
        "Her ilan SQLite'ta durum sözlüğüyle izleniyor (yeni, onaylı, başvuruldu, manuel, hatalı)",
        "Her gün başvuruları, manuel işleri ve hataları listeleyen e-posta raporu",
      ],
      en: [
        "A daily run where Claude Code scores each posting's fit from 0 to 10",
        "A one-page tailored CV and cover letter for postings above the threshold",
        "Every posting tracked in SQLite against a status dictionary (new, approved, applied, manual, failed)",
        "A daily email report of applications, manual tasks and failures",
      ],
    },
  },
  {
    slug: "cast-and-chill",
    name: "Cast & Chill",
    year: "2026",
    stack: ["JavaScript", "Electron"],
    mark: "C&C",
    hue: 195,
    half: true,
    status: { tr: "Yan proje", en: "Side project" },
    tagline: { tr: "Windows görev çubuğu için idle balıkçılık oyunu", en: "An idle fishing game for the Windows taskbar" },
    summary: {
      tr: "Windows görev çubuğunda yaşayan bir idle balıkçılık oyunu. Ağırlıklı av tabloları, XP seviyeleri, yükseltmeler, boss savaşları ve rastgele olaylar var; electron-builder ile kurulum paketi olarak dağıtılıyor.",
      en: "An idle fishing game that lives on the Windows taskbar, with weighted catch tables, XP levels, upgrades, boss fights and random events, packaged as an installer with electron-builder.",
    },
    highlights: {
      tr: ["Ağırlıklı av tabloları ve XP seviyeleri", "Yükseltmeler, boss savaşları, rastgele olaylar", "electron-builder ile Windows kurulum paketi"],
      en: ["Weighted catch tables and XP levels", "Upgrades, boss fights and random events", "Windows installer built with electron-builder"],
    },
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
