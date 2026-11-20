/* =========================================================
   İÇERİK — batuhankul61-hub.github.io portfolyosundan aktarıldı.
   Retro ve Stüdyo sürümlerinin ikisi de sadece bu dosyayı okur.
   ========================================================= */

export type Shot = { src: string; alt: string };

export type Project = {
  slug: string;
  title: string;
  year: string;
  status: string;
  tagline: string;
  description: string;
  tags: string[];
  highlights: string[];
  results?: { value: string; label: string }[];
  logo?: string;
  shots?: Shot[];
  repo?: string;
  demo?: string;
  credit?: string;
  /** Logo yoksa kullanılan kısa işaret */
  mark: string;
};

export type Job = {
  role: string;
  company: string;
  place: string;
  period: string;
  bullets: string[];
};

import { getLang } from "./i18n";
import { buildContentEn } from "./content.en";

export const GH = "https://github.com/batuhankul61-hub";

const contentTr = {
  name: "Batuhan Kul",
  title: "AI Automation & Workflow Engineer",
  osName: "Makara OS 98",
  /** Boş bırakılırsa e-posta satırları gizlenir. */
  email: "batuhankul61@gmail.com",
  location: "İstanbul · Uzaktan çalışmaya açık",
  avatar: "/avatar.jpg",
  headline: "İş gereksinimlerini çalışan yazılıma yapay zekâyla çeviriyorum.",
  socials: [
    { label: "GitHub", url: GH },
    { label: "LinkedIn", url: "https://www.linkedin.com/in/batuhan-kul-777526224" },
  ],
  about: [
    "Claude Code, Cursor ve GitHub Copilot gibi yapay zekâ kodlama ajanlarını geliştirme ortağı olarak kullanıp prototipten MVP'ye, oradan canlıya çıkıyorum.",
    "FLO Group'ta 800 mağazalık ağın servis taleplerini LLM ile yönlendiren sistemi kurdum. LLM ajanları, MCP entegrasyonları ve SQL tabanlı araçlar geliştiriyorum; NETCAD ve AutoCAD için Türkçe asistanlar da bunlara dahil.",
  ],
  contactLead: "Bir fikir, bir MVP ya da otomatikleştirilecek bir süreç varsa konuşalım. E-posta, LinkedIn ya da GitHub üzerinden ulaşabilirsin.",
  metrics: [
    { value: "3–4 sa → 30 dk", label: "FLO'da günlük talep ayıklama süresi" },
    { value: "~800", label: "LLM yönlendirmesinin hizmet verdiği mağaza" },
    { value: "0.972", label: "Mario RAG yanıt doğruluğu (LLM-as-judge)" },
    { value: "669 → 320 ms", label: "kavunOS ana ekrana dönüş süresi" },
  ],
  projects: [
    {
      slug: "kul-ai-netcad",
      title: "Kul AI · NETCAD",
      year: "2026",
      status: "Beta",
      tagline: "NETCAD 8.5 için Türkçe yapay zekâ asistanı ve MCP köprüsü",
      description:
        "NETCAD 8.5'in içinde, nesne yönelimli C# ile yazılmış bir asistan paneli. Türkçe istekleri 21 araç üzerinden çizim, parsel ifrazı ve koordinat dönüşümü işlemlerine çeviriyor. Gemini, Ollama ve Claude ile çalışıyor; Claude Code için API anahtarı gerektirmeyen bir MCP köprüsü var.",
      tags: ["C# / .NET", "OOP", "LLM Agents", "MCP", "PowerShell", "Gemini", "Ollama", "Claude"],
      highlights: [
        "Araçları Claude Code'a açan MCP köprüsü; API anahtarı gerekmez",
        "İfraz: parseli eşit parçalara ya da verilen alanlara bölme; geometrisi birim testli",
        "EPSG arama ve koordinat dönüşümü (ör. ED50/TM30 → TUREF/TM30)",
        "Excel/CSV/TXT ve .ncn'den nokta aktarma; ondalık virgül ve Y/X karışıklığı uyarısı",
        "Silme ve toplu değişikliklerde kullanıcı onayı; kurulum paketleri GitHub Releases'te",
      ],
      results: [
        { value: "21", label: "araç" },
        { value: "3", label: "model sağlayıcı" },
      ],
      logo: "/projects/logos/kul-ai-netcad.svg",
      shots: [{ src: "/projects/netcad/kurulum.png", alt: "Kul AI NETCAD kurulum klasörü: Kur.bat ve Claude-Bagla.bat" }],
      repo: `${GH}/netcad-claude-bridge`,
      mark: "KUL",
    },
    {
      slug: "kavunos",
      title: "kavunOS",
      year: "2026",
      status: "Açık kaynak",
      tagline: "2 GB RAM'li TV çubukları için hızlı Android TV başlatıcısı",
      description:
        "2 GB RAM'li bir Android TV çubuğunun başlatıcısını, mevcut açık kaynak cleanyourtv kod tabanı üzerinde Claude ile yapay zekâ destekli geliştirmeyle yeniden yazdım. Önce hız, sonra estetik: cam görünümlü, yumuşak geçişli, tam ekran duvar kâğıdı üzerinde alçak bir uygulama sırası.",
      tags: ["Java", "Android TV", "JUnit", "Claude Code"],
      highlights: [
        "Ana ekrana dönüş 669 ms'den ~320 ms'ye, yeniden açılış 1244 ms'den ~450 ms'ye indi",
        "Bellek 126 MB'tan 63–100 MB'a, uygulama boyutu 532 KB'tan 430 KB'a düştü",
        "Kontrol merkezi, şu an çalıyor kartları, QR ile duvar kâğıdı yükleme",
        "23 dil desteği",
      ],
      results: [
        { value: "669 → 320 ms", label: "Ana ekrana dönüş" },
        { value: "1244 → 450 ms", label: "Yeniden açılış" },
        { value: "126 → 63–100 MB", label: "Bellek" },
      ],
      logo: "/projects/logos/kavunos.svg",
      shots: [
        { src: "/projects/kavunos/home.jpg", alt: "kavunOS ana ekranı: gün batımı duvar kâğıdı ve uygulama sırası" },
        { src: "/projects/kavunos/card.jpg", alt: "Önizleme kartı: Spotify'da çalan şarkı" },
      ],
      repo: `${GH}/kavunOS`,
      credit: "Gathin'in MIT lisanslı cleanyourtv projesi üzerine kuruldu.",
      mark: "TV",
    },
    {
      slug: "mario",
      title: "Mario",
      year: "2026",
      status: "Günlük kullanımda",
      tagline: "RAG hafızalı sesli yapay zekâ ajanı",
      description:
        "Hub-and-spoke yapıda bir sesli ajan: Gemini Live talebi function calling ile Windows, bilgisayar ayarları, Gmail ve Claude Code araçlarına yönlendiriyor; araçları async, tip ipuçlu bir FastAPI sunucusu çalıştırıyor. Notları ve belgeleri hatırlayan bir RAG hafızası var.",
      tags: ["Python", "Google ADK", "RAG", "FastAPI", "Gemini Live", "pytest"],
      highlights: [
        "Notlar ve belgeler parçalanıp gemini-embedding-001 ile SQLite vektör deposuna gömülüyor",
        "Google ADK araştırmacı ajanı, getirilen parçalarda olmayan kaynak gösterimlerini atıyor",
        "40 soruluk LLM-as-judge değerlendirmesi: hit@3 1.0, yanıt doğruluğu 0.972; 185 pytest testiyle birlikte regresyon kontrolü",
        "Yıkıcı işlemlerden önce sesli onay; her araç çağrısı denetim kaydına yazılıyor",
        "Hatırlatmalar, Google Takvim ve görevleri arka planda Claude Code'a devretme",
      ],
      results: [
        { value: "0.972", label: "Yanıt doğruluğu" },
        { value: "1.0", label: "hit@3" },
        { value: "185", label: "pytest testi" },
      ],
      logo: "/projects/logos/mario.svg",
      shots: [
        { src: "/projects/shots/mario-1.jpg", alt: "Sesli sohbet: hava durumu ve okunmamış mailler" },
        { src: "/projects/shots/mario-2.jpg", alt: "Yıkıcı işlemden önce sesli onay" },
      ],
      repo: `${GH}/mario-agent`,
      mark: "MAR",
    },
    {
      slug: "lucia",
      title: "Lucia",
      year: "2026",
      status: "Çalışıyor",
      tagline: "Gerçek zamanlı İngilizce konuşma koçu",
      description:
        "Gemini Live sesini WebSocket üzerinden akıtan, sözünü kesebildiğin bir İngilizce konuşma koçu (PWA). RESTful API'sini tasarladığım FastAPI sunucusu tek kullanımlık token veriyor; API anahtarı sunucudan hiç çıkmıyor.",
      tags: ["JavaScript", "HTML / CSS", "FastAPI", "REST API", "WebSocket", "Gemini Live", "PWA", "GitHub Actions"],
      highlights: [
        "Dilbilgisi raporu Pydantic şemasıyla üretiliyor; transkriptte olmayan her alıntı atılıyor",
        "Her konuşma için gecikme, token kullanımı ve maliyet kaydı",
        "Her push ve PR'da 32 pytest testi, ruff kontrolü ve frontend testleri (GitHub Actions)",
        "Geçmiş ve skor grafiği cihazda (IndexedDB); kendi anahtarınla sunucusuz mod",
      ],
      results: [{ value: "32", label: "CI'da pytest testi" }],
      logo: "/projects/logos/lucia.svg",
      shots: [{ src: "/projects/shots/lucia-1.jpg", alt: "Seviye ve konuşma senaryosu seçimi" }],
      repo: `${GH}/lucia`,
      demo: "https://batuhankul61-hub.github.io/lucia/",
      mark: "LUC",
    },
    {
      slug: "kul-ai-cad",
      title: "Kul AI CAD",
      year: "2026",
      status: "Geliştiriliyor",
      tagline: "AutoCAD'deki ırgatlığı yapan yapay zekâ asistanı",
      description:
        "AutoCAD 2022–2026 için 43 araçlı bir sohbet asistanı. Toplu PDF çıktısı, metraj, koordinat çizelgesi ve çizim temizliğini otomatikleştiriyor; çok sayıda DWG üzerinde toplu çalışabiliyor.",
      tags: ["C# / .NET", "AutoCAD API", "LLM Agents"],
      highlights: [
        "Her araç kendi transaction'ında ve belge kilidi altında çalışıyor; hata olursa çizim değişmeden kalıyor",
        "Toplu PDF / pafta çıktısı, çerçevelerden otomatik layout",
        "Metraj (uzunluk, alan, adet) CSV ve tablo olarak",
        "Alan ve kenar ölçüsü yazdırma, köşe koordinat çizelgesi",
        "Bozuk Türkçe karakter düzeltme (ý→ı, þ→ş, ð→ğ)",
      ],
      results: [{ value: "43", label: "araç" }],
      logo: "/projects/logos/kul-ai-cad.svg",
      repo: `${GH}/KulAICad`,
      mark: "CAD",
    },
    {
      slug: "harita-maliyet",
      title: "Harita Maliyet Hesaplayıcı",
      year: "2026",
      status: "Yayında",
      tagline: "Harita işleri için çevrimdışı maliyet ve teklif hesaplayıcı",
      description:
        "Harita ve ölçüm işleri için saha maliyetini ve teklif fiyatını hesaplayan bir PWA. Telefona uygulama gibi kuruluyor, sahada internet olmadan çalışıyor; girilen değerler cihazda kalıyor.",
      tags: ["HTML / CSS / JS", "PWA", "Service Worker"],
      highlights: [
        "Ekipman amortismanı (GPS, total station), yakıt, yemek, yevmiyeler",
        "HKMO ve tapu gibi resmi ücretler",
        "Arazi zorluk katsayısı, gelir vergisi, kâr marjı ve KDV",
        "Tamamen istemci tarafında; sunucu ya da derleme yok",
      ],
      logo: "/projects/logos/harita-maliyet.png",
      shots: [
        { src: "/projects/shots/harita-maliyet-1.jpg", alt: "Ekipman amortismanı ve iş bilgileri formu" },
        { src: "/projects/shots/harita-maliyet-2.jpg", alt: "Hesaplanan maliyet dökümü ve teklif fiyatı" },
      ],
      repo: `${GH}/harita-maliyet-hesaplayici`,
      demo: "https://batuhankul61-hub.github.io/harita-maliyet-hesaplayici/",
      mark: "₺",
    },
    {
      slug: "servisdesk",
      title: "ServisDesk",
      year: "2026",
      status: "Canlı demo",
      tagline: "Bakım/onarım taleplerini taşeronlara yönlendiren ajan",
      description:
        "Bir perakende zincirinin servis masasına gelen mağaza arıza taleplerini okuyan, kurallar ve isteğe bağlı bir LLM ile hangi taşeron firmaya gitmesi gerektiğini gerekçesiyle öneren, insan onayından sonra portala yazan ve gecikme maillerini hazırlayan bir masaüstü ajanı. Kurgusal veriyle çalışan demosu tarayıcıda denenebiliyor.",
      tags: ["Python", "REST API", "LLM Agents", "Gemini", "Tkinter"],
      highlights: [
        "Karar motoru hiçbir talebi kendi başına reddetmiyor: ya gerekçeyle yönlendir ya da insana bırak",
        "LLM yalnızca öneri üretiyor; kuralların izin vermediği firmaya yönlendiremiyor, cevap gelmezse yerel motora düşüyor",
        "Portala yazma varsayılan olarak kapalı ve onaya bağlı; her yazma geri okunup doğrulanıyor",
        "SLA'sı geçmiş talepler için firmaya göre gruplanmış .eml mail taslakları",
      ],
      results: [{ value: "66 / 72", label: "talep otomatik önerildi" }],
      logo: "/projects/logos/servisdesk.svg",
      shots: [
        { src: "/projects/shots/servisdesk-1.jpg", alt: "Portal: 72 kurgusal talep, SLA ve atama durumu" },
        { src: "/projects/shots/servisdesk-2.jpg", alt: "Karar motorunun önerisi ve gerekçesi; onay insanda" },
        { src: "/projects/shots/servisdesk-3.jpg", alt: "SLA'sı geçmiş talepler için firmaya göre gecikme maili" },
      ],
      demo: "/demo/servisdesk/index.html",
      mark: "SVC",
    },
    {
      slug: "cast-and-chill",
      title: "Cast & Chill",
      year: "2026",
      status: "Yan proje",
      tagline: "Windows görev çubuğu için idle balıkçılık oyunu",
      description:
        "Windows görev çubuğunda yaşayan bir idle balıkçılık oyunu. Ağırlıklı av tabloları, XP seviyeleri, yükseltmeler, boss savaşları ve rastgele olaylar var; electron-builder ile kurulum paketi olarak dağıtılıyor.",
      tags: ["JavaScript", "Electron"],
      highlights: ["Ağırlıklı av tabloları ve XP seviyeleri", "Yükseltmeler, boss savaşları, rastgele olaylar", "electron-builder ile Windows kurulum paketi"],
      logo: "/projects/logos/cast-and-chill.svg",
      shots: [
        { src: "/projects/shots/cast-and-chill-1.jpg", alt: "Görev çubuğu şeridi ve yükseltmeler" },
        { src: "/projects/shots/cast-and-chill-2.jpg", alt: "Boss'lardan düşen kozmetikler" },
      ],
      demo: "/demo/cast-and-chill/index.html",
      mark: "C&C",
    },
  ] as Project[],
  experience: [
    {
      role: "Operasyon ve Süreç Otomasyonu Uzmanı (Yarı zamanlı)",
      company: "FLO Group",
      place: "İstanbul (hybrid)",
      period: "01/2025 – Devam ediyor",
      bullets: [
        "Gelen servis taleplerini mağaza ve yüklenici referans verisine göre sınıflandıran Python + LLM yönlendirme sistemini geliştirdim; elle ayıklama 3–4 saatten 30 dakikaya indi.",
        "Sistemi canlıda log ve gerçek talep verisiyle izliyor, yanlış yönlenen talepleri ayıklayıp düzeltiyorum.",
        "PL/SQL sorguları, KPI raporları ve tedarikçi performans panoları kurdum: talep hacmi, çözüm süresi, yüklenici performansı.",
        "Yaklaşık 800 mağaza, iç ekipler ve tedarikçiler arasındaki günlük operasyonu SAP tabanlı Flodesk akışlarıyla koordine ediyor; paydaşlarla iş analizi yapıp gereksinimleri süreç tasarımı iyileştirmelerine çeviriyorum.",
        "Tekrar eden operasyon işlerini Python ve Selenium ile otomatikleştiriyorum.",
      ],
    },
    {
      role: "Python Otomasyon ve Mekânsal Veri Mühendisi",
      company: "KUL-YAPI İnşaat Tic. A.Ş.",
      place: "Bodrum, Muğla",
      period: "11/2025 – 07/2026",
      bullets: [
        "Hava sensörlerinden gelen yüksek çözünürlüklü ortofoto verisinin analizini Python ve OpenCV hatlarıyla otomatikleştirdim.",
        "Mekânsal envanter, koordinat ve yapı verilerini modelledim; işlenmesini SQL ve Pandas ile otomatikleştirdim.",
        "Koordinat üretimi, hesaplar ve hacim işleri için Python ve Excel araçları yazdım.",
        "Saha ekipleri ile proje yönetimi arasındaki veri alışverişini standartlaştırdım; teknik veri kalite kontrolü yaptım.",
      ],
    },
  ] as Job[],
  education: [
    { school: "Yıldız Teknik Üniversitesi", degree: "Harita Mühendisliği, Lisans", period: "09/2020 – 06/2025", note: "Programlama · Görüntü işleme · İstatistik" },
    {
      school: "Dijital Üniversite Platformu (YÖK)",
      degree: "Yapay Zekâ Okulu, çevrimiçi",
      period: "11/2026 – Devam ediyor",
      note: "Makine öğrenmesi · LLM'ler, prompt mühendisliği, ajan geliştirme · Yapay zekâ destekli yazılım geliştirme",
    },
  ],
  languages: [
    { name: "Türkçe", level: "Ana dil" },
    { name: "İngilizce", level: "İleri" },
  ],
  certification: "Yemeksepeti Business & Data Analysis Job Simulation",
  skillGroups: [
    { group: "Yapay zekâ ile geliştirme", items: ["Claude Code", "Cursor", "GitHub Copilot", "Codex", "ChatGPT", "Prototyping", "MVP Development", "Code Review"] },
    {
      group: "LLM ve ajanlar",
      items: ["LLM Integration", "Multi-Agent", "MCP Server Development", "Function / Tool Calling", "Google ADK", "Anthropic API", "OpenAI API", "RAG", "Vector Search", "LLM-as-Judge", "Structured Outputs", "Real-Time Voice AI"],
    },
    {
      group: "Yazılım ve API",
      items: ["Python", "C# / .NET", "OOP", "Java", "TypeScript", "Node.js", "FastAPI", "REST APIs", "Microservices", "WebSocket", "asyncio", "pytest", "Docker", "GitHub Actions"],
    },
    {
      group: "Veri ve otomasyon",
      items: ["SQL", "PL/SQL", "PostgreSQL", "NoSQL", "SQLite", "Data Modeling", "Pandas", "NumPy", "OpenCV", "Power BI", "Playwright", "Selenium", "SAP", "GIS"],
    },
  ],
  hobbies: [
    {
      label: "Donanım",
      title: "Kendi topladığım PC",
      body: "Masadaki bilgisayarı parça parça kendim topladım: bileşen seçimi, uyumluluk, kurulum ve kablo düzeni. Mesai bitince aynı makine iki kumandası ve masanın altındaki yedek klavyelerle oyun istasyonuna dönüşüyor.",
      items: ["PC toplama", "Kurulum ve optimizasyon", "Oyun"],
    },
    {
      label: "Koleksiyon",
      title: "Raflar ve figürler",
      body: "Raflar bir düzen işi: her figürün yeri, ölçeği ve hikâyesi belli. Örümcek Adam en kalabalık rafı tutuyor; yanında Star Wars ve çerçevelerde 1:64 ölçek arabalar.",
      items: ["Spider-Man", "Star Wars", "Diecast", "Sneaker"],
    },
    { label: "Futbol", title: "Duvardaki krampon", body: "Halı saha bir takım oyunu: herkes rolünü bilince maç kendiliğinden akıyor. Sahaya çıkamadığım günlerde kramponlar duvarda durur; kadro yine de her zaman bir kişi eksik.", items: [] },
    { label: "Spor", title: "Masanın köşesindeki kutu", body: "Ekran başında geçen günleri düzenli antrenmanla dengeliyorum. Küçük ama tutarlı ilerleme, kodda da işe yarayan bir alışkanlık.", items: [] },
  ],
};

export type Content = typeof contentTr;
const contentEn: Content = buildContentEn(contentTr);

/** Seçili dile göre içerik. Bileşenler bunu her çizimde okur. */
export const content: Content = new Proxy({} as Content, {
  get: (_t, key) => (getLang() === "en" ? contentEn : contentTr)[key as keyof Content],
});

/** Düz yetenek listesi (kısa gösterimler için) */
export const topSkills = ["Claude Code", "LLM Agents", "MCP", "RAG", "Python", "C# / .NET", "FastAPI", "SQL", "TypeScript"];
