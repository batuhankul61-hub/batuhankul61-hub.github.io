export type Lang = "tr" | "en";

type L = Record<Lang, string>;

export const site = {
  name: "Batuhan Kul",
  handle: "batuhankul61-hub",
  url: "https://batuhankul61-hub.github.io",
  github: "https://github.com/batuhankul61-hub",
  linkedin: "https://www.linkedin.com/in/batuhan-kul-777526224",
  location: { tr: "İstanbul · Uzaktan çalışmaya açık", en: "İstanbul · Open to remote worldwide" },
};

/** The other language of the two the site ships in. */
export const otherLang = (lang: Lang): Lang => (lang === "tr" ? "en" : "tr");

export const paths = {
  tr: { home: "/", project: (slug: string) => `/projeler/${slug}/` },
  en: { home: "/en/", project: (slug: string) => `/en/projects/${slug}/` },
} as const;

export const t = {
  tr: {
    metaTitle: "Batuhan Kul · AI Automation & Workflow Engineer",
    metaDescription:
      "İş gereksinimlerini çalışan yazılıma çeviren, yapay zekâ ile geliştiren bir yazılımcı: LLM ajanları, MCP entegrasyonları, FastAPI ve SQL tabanlı araçlar.",
    nav: { work: "İşler", experience: "Deneyim", stack: "Yetenekler", contact: "İletişim" },
    switchLang: "EN",
    switchLangLabel: "Switch to English",
    themeLabel: "Temayı değiştir",
    role: "AI Automation & Workflow Engineer",
    heroTitle: ["İş gereksinimlerini", "çalışan yazılıma", "yapay zekâyla çeviriyorum."],
    heroLead:
      "Claude Code, Cursor ve GitHub Copilot gibi yapay zekâ kodlama ajanlarını geliştirme ortağı olarak kullanıp prototipten MVP'ye, oradan canlıya çıkıyorum. FLO Group'ta 800 mağazalık ağın servis taleplerini LLM ile yönlendiren sistemi kurdum. LLM ajanları, MCP entegrasyonları ve SQL tabanlı araçlar geliştiriyorum; NETCAD ve AutoCAD için Türkçe asistanlar da bunlara dahil.",
    ctaWork: "İşlere bak",
    ctaGithub: "GitHub",
    ctaLinkedin: "LinkedIn",
    metricsLabel: "Ölçülmüş sonuçlar",
    workTitle: "Projeler",
    workLead: "Kendi repolarımdan. Rakamlar ölçüldüğü şekliyle.",
    experienceTitle: "Deneyim",
    educationTitle: "Eğitim",
    stackTitle: "Yetenekler",
    hobbiesTitle: "Hobiler",
    hobbiesLead: "Masanın dışında yaptıklarım.",
    languagesTitle: "Diller",
    certTitle: "Sertifika",
    contactTitle: "Birlikte bir şey mi yapalım?",
    contactLead: "Bir fikir, bir MVP ya da otomatikleştirilecek bir süreç varsa konuşalım. LinkedIn ya da GitHub üzerinden ulaşabilirsin.",
    present: "Devam ediyor",
    project: {
      back: "Tüm projeler",
      year: "Yıl",
      stack: "Teknoloji",
      status: "Durum",
      highlights: "Öne çıkanlar",
      source: "Kaynak kod",
      demo: "Canlı demo",
      next: "Sonraki proje",
      results: "Sonuçlar",
    },
    footer: "Next.js ile yapıldı, GitHub Pages'te yayında.",
  },
  en: {
    metaTitle: "Batuhan Kul · AI Automation & Workflow Engineer",
    metaDescription:
      "AI-native software developer who turns business requirements into working software: LLM agents, MCP integrations, FastAPI and SQL-backed tools.",
    nav: { work: "Work", experience: "Experience", stack: "Skills", contact: "Contact" },
    switchLang: "TR",
    switchLangLabel: "Türkçeye geç",
    themeLabel: "Toggle theme",
    role: "AI Automation & Workflow Engineer",
    heroTitle: ["I turn business", "requirements into", "working software with AI."],
    heroLead:
      "I use AI coding agents such as Claude Code, Cursor and GitHub Copilot as development partners to go from prototype to MVP to production. At FLO Group I built the LLM system that routes service requests for a network of about 800 stores. I build AI agents, MCP integrations and SQL-backed tools, including Turkish-speaking assistants for NETCAD and AutoCAD.",
    ctaWork: "See the work",
    ctaGithub: "GitHub",
    ctaLinkedin: "LinkedIn",
    metricsLabel: "Measured results",
    workTitle: "Projects",
    workLead: "From my own repositories. Numbers as measured.",
    experienceTitle: "Experience",
    educationTitle: "Education",
    stackTitle: "Skills",
    hobbiesTitle: "Hobbies",
    hobbiesLead: "What I do away from the desk.",
    languagesTitle: "Languages",
    certTitle: "Certification",
    contactTitle: "Want to build something?",
    contactLead: "An idea, an MVP or a process to automate, let's talk. Reach me on LinkedIn or GitHub.",
    present: "Present",
    project: {
      back: "All projects",
      year: "Year",
      stack: "Stack",
      status: "Status",
      highlights: "Highlights",
      source: "Source code",
      demo: "Live demo",
      next: "Next project",
      results: "Results",
    },
    footer: "Built with Next.js, hosted on GitHub Pages.",
  },
} as const;

export const metrics: { value: string; label: L }[] = [
  { value: "3–4 sa → 30 dk", label: { tr: "FLO'da günlük talep ayıklama süresi", en: "Daily ticket triage at FLO Group" } },
  { value: "~800", label: { tr: "LLM yönlendirmesinin hizmet verdiği mağaza", en: "Stores served by the LLM routing" } },
  { value: "0.972", label: { tr: "Mario RAG yanıt doğruluğu (LLM-as-judge)", en: "Mario RAG answer accuracy (LLM-as-judge)" } },
  { value: "669 → 320 ms", label: { tr: "kavunOS ana ekrana dönüş süresi", en: "kavunOS return-to-home time" } },
];

export type Job = {
  role: L;
  company: string;
  place: string;
  start: string;
  end?: string;
  bullets: Record<Lang, string[]>;
};

export const experience: Job[] = [
  {
    role: { tr: "Operasyon ve Süreç Otomasyonu Uzmanı (Yarı zamanlı)", en: "Operations & Process Automation Specialist (Part-time)" },
    company: "FLO Group",
    place: "İstanbul (hybrid)",
    start: "01/2025",
    bullets: {
      tr: [
        "Gelen servis taleplerini mağaza ve yüklenici referans verisine göre sınıflandıran Python + LLM yönlendirme sistemini geliştirdim; elle ayıklama 3–4 saatten 30 dakikaya indi.",
        "Sistemi canlıda log ve gerçek talep verisiyle izliyor, yanlış yönlenen talepleri ayıklayıp düzeltiyorum.",
        "PL/SQL sorguları, KPI raporları ve tedarikçi performans panoları kurdum: talep hacmi, çözüm süresi, yüklenici performansı.",
        "Yaklaşık 800 mağaza, iç ekipler ve tedarikçiler arasındaki günlük operasyonu SAP tabanlı Flodesk akışlarıyla koordine ediyor; paydaşlarla iş analizi yapıp gereksinimleri süreç tasarımı iyileştirmelerine çeviriyorum.",
        "Tekrar eden operasyon işlerini Python ve Selenium ile otomatikleştiriyorum.",
      ],
      en: [
        "Built a Python and LLM routing system that classifies incoming service requests against store and contractor reference data, cutting 3–4 hours of manual triage to 30 minutes.",
        "Keep it accurate in production by monitoring logs and live ticket data and correcting misrouted requests.",
        "Built PL/SQL queries, KPI reports and vendor performance dashboards covering ticket volume, resolution times and contractor performance.",
        "Coordinate daily operations between about 800 stores, internal teams and suppliers through SAP-based Flodesk workflows, running business analysis with stakeholders and turning requirements into process design improvements.",
        "Automate recurring operational work with Python and Selenium.",
      ],
    },
  },
  {
    role: { tr: "Python Otomasyon ve Mekânsal Veri Mühendisi", en: "Python Automation & Spatial Data Engineer" },
    company: "KUL-YAPI İnşaat Tic. A.Ş.",
    place: "Bodrum, Muğla",
    start: "11/2025",
    end: "07/2026",
    bullets: {
      tr: [
        "Hava sensörlerinden gelen yüksek çözünürlüklü ortofoto verisinin analizini Python ve OpenCV hatlarıyla otomatikleştirdim.",
        "Mekânsal envanter, koordinat ve yapı verilerini modelledim; işlenmesini SQL ve Pandas ile otomatikleştirdim.",
        "Koordinat üretimi, hesaplar ve hacim işleri için Python ve Excel araçları yazdım.",
        "Saha ekipleri ile proje yönetimi arasındaki veri alışverişini standartlaştırdım; teknik veri kalite kontrolü yaptım.",
      ],
      en: [
        "Automated analysis of high-resolution aerial orthophoto data with Python and OpenCV pipelines.",
        "Modeled geospatial inventory, coordinate and structural datasets and automated their processing with SQL and Pandas.",
        "Wrote Python and Excel tools for coordinate generation, calculations and volume workflows.",
        "Standardized data exchange between field teams and project management and ran technical data quality control.",
      ],
    },
  },
];

export const education: { school: L; degree: L; start: string; end?: string; note: L }[] = [
  {
    school: { tr: "Yıldız Teknik Üniversitesi", en: "Yıldız Technical University" },
    degree: { tr: "Harita Mühendisliği, Lisans", en: "B.Sc. Geomatics Engineering" },
    start: "09/2020",
    end: "06/2025",
    note: {
      tr: "Programlama · Görüntü işleme · İstatistik",
      en: "Programming · Image processing · Statistics",
    },
  },
  {
    school: { tr: "Dijital Üniversite Platformu (YÖK)", en: "Digital University Platform (YÖK)" },
    degree: { tr: "Yapay Zekâ Okulu, çevrimiçi", en: "AI School, online" },
    start: "11/2026",
    note: {
      tr: "Makine öğrenmesi · LLM'ler, prompt mühendisliği, ajan geliştirme · Yapay zekâ destekli yazılım geliştirme",
      en: "Machine learning · LLMs, prompt engineering, agent development · AI-assisted software development",
    },
  },
];

export const languages: { name: L; level: L }[] = [
  { name: { tr: "Türkçe", en: "Turkish" }, level: { tr: "Ana dil", en: "Native" } },
  { name: { tr: "İngilizce", en: "English" }, level: { tr: "İleri", en: "Fluent" } },
];

export const certification: L = {
  tr: "Yemeksepeti Business & Data Analysis Job Simulation",
  en: "Yemeksepeti Business & Data Analysis Job Simulation",
};

export const stack: { group: L; items: string[] }[] = [
  {
    group: { tr: "Yapay zekâ ile geliştirme", en: "AI-native development" },
    items: ["Claude Code", "Cursor", "GitHub Copilot", "Codex", "ChatGPT", "Prototyping", "MVP Development", "Code Review"],
  },
  {
    group: { tr: "LLM ve ajanlar", en: "LLMs & agents" },
    items: ["LLM Integration", "Multi-Agent", "MCP Server Development", "Function / Tool Calling", "Google ADK", "Anthropic API", "OpenAI API", "RAG", "Vector Search", "LLM-as-Judge", "Structured Outputs", "Real-Time Voice AI"],
  },
  {
    group: { tr: "Yazılım ve API", en: "Software & APIs" },
    items: ["Python", "C# / .NET", "OOP", "Java", "TypeScript", "Node.js", "FastAPI", "REST APIs", "Microservices", "WebSocket", "asyncio", "pytest", "Docker", "GitHub Actions"],
  },
  {
    group: { tr: "Veri ve otomasyon", en: "Data & automation" },
    items: ["SQL", "PL/SQL", "PostgreSQL", "NoSQL", "SQLite", "Data Modeling", "Pandas", "NumPy", "OpenCV", "Power BI", "Playwright", "Selenium", "SAP", "GIS"],
  },
];
