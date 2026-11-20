import type { Content } from "./content";

/* İngilizce içerik — batuhankul61-hub.github.io/en/ sayfasından aktarıldı.
   Linkler, logolar ve görsel yolları Türkçe veriden paylaşılır; burada sadece metinler var. */

type ProjectText = {
  status: string;
  tagline: string;
  description: string;
  highlights: string[];
  results?: string[];
  shots?: string[];
  credit?: string;
};

const projects: Record<string, ProjectText> = {
  "kul-ai-netcad": {
    status: "Beta",
    tagline: "A Turkish AI assistant and MCP bridge for NETCAD 8.5",
    description:
      "An assistant panel inside NETCAD 8.5, written in object-oriented C#, that turns Turkish requests into drawing, parcel subdivision and coordinate transformation operations through 21 tools, with Gemini, Ollama and Claude as model providers, plus an MCP bridge for Claude Code that needs no API key.",
    highlights: [
      "MCP bridge that exposes the tools to Claude Code without an API key",
      "Parcel subdivision into equal parts or given areas, with unit-tested geometry",
      "EPSG lookup and coordinate transforms (e.g. ED50/TM30 → TUREF/TM30)",
      "Point import from Excel/CSV/TXT and .ncn, with decimal-comma and Y/X swap warnings",
      "User confirmation before deletes and bulk changes; installers published via GitHub Releases",
    ],
    results: ["tools", "model providers"],
    shots: ["Kul AI NETCAD install folder: Kur.bat and Claude-Bagla.bat"],
  },
  kavunos: {
    status: "Open source",
    tagline: "A fast Android TV launcher for 2 GB RAM sticks",
    description:
      "I rebuilt the launcher of a 2 GB RAM Android TV stick through AI-driven development with Claude, on the existing open-source cleanyourtv codebase. Speed first, then looks: glassy, softly animated, with a low row of apps over a full-screen wallpaper.",
    highlights: [
      "Return-to-home from 669 ms to about 320 ms, reopen from 1244 ms to about 450 ms",
      "Memory from 126 MB to 63–100 MB, app size from 532 KB to 430 KB",
      "Control center, now-playing cards, QR wallpaper upload",
      "23 languages",
    ],
    results: ["Return to home", "Reopen", "Memory"],
    shots: ["kavunOS home screen: sunset wallpaper and a row of apps", "Preview card: a song playing on Spotify"],
    credit: "Built on Gathin's MIT-licensed cleanyourtv project.",
  },
  mario: {
    status: "In daily use",
    tagline: "A voice AI agent with RAG memory",
    description:
      "A hub-and-spoke voice agent: Gemini Live routes each request through function calling to tools for Windows, PC settings, Gmail and Claude Code, run by an async, type-hinted FastAPI server. It has RAG memory over notes and documents.",
    highlights: [
      "Notes and documents are chunked and embedded with gemini-embedding-001 into a SQLite vector store",
      "A Google ADK researcher agent drops any citation missing from the retrieved chunks",
      "40-question LLM-as-judge eval: hit@3 1.0, answer accuracy 0.972, run as a regression check alongside 185 pytest tests",
      "Spoken confirmation before destructive actions; every tool call written to an audit log",
      "Reminders, Google Calendar, and background hand-off of tasks to Claude Code",
    ],
    results: ["Answer accuracy", "hit@3", "pytest tests"],
    shots: ["Voice chat: the weather and unread mail", "Spoken confirmation before a destructive action"],
  },
  lucia: {
    status: "Working",
    tagline: "A real-time English speaking coach",
    description:
      "A real-time English speaking coach (PWA) that streams Gemini Live voice over WebSocket with barge-in. I designed its RESTful API on a FastAPI server that issues single-use tokens, so the API key never leaves the server.",
    highlights: [
      "Grammar reports generated through a Pydantic schema; any quote not in the transcript is dropped",
      "Latency, token usage and cost recorded for every conversation",
      "GitHub Actions runs 32 pytest tests, ruff checks and frontend tests on every push and PR",
      "History and score chart on the device (IndexedDB); bring-your-own-key mode with no server",
    ],
    results: ["pytest tests in CI"],
    shots: ["Choosing a level and a speaking scenario"],
  },
  "kul-ai-cad": {
    status: "In development",
    tagline: "An AI assistant that does the AutoCAD grunt work",
    description:
      "A chat assistant for AutoCAD 2022–2026 with 43 tools that automates batch PDF plotting, quantity takeoff, coordinate tables and drawing cleanup, including batch runs across many DWG files.",
    highlights: [
      "Each tool runs in its own transaction under a document lock, so a failed step leaves the drawing unchanged",
      "Batch PDF plotting, layouts generated from frames",
      "Quantity takeoff (length, area, count) to CSV and tables",
      "Area and segment length labels, vertex coordinate tables",
      "Fixes garbled Turkish characters (ý→ı, þ→ş, ð→ğ)",
    ],
    results: ["tools"],
  },
  "harita-maliyet": {
    status: "Live",
    tagline: "An offline cost and quote calculator for survey jobs",
    description:
      "A PWA that models field costs and quote prices for surveying jobs. It installs like an app, works offline in the field, and keeps your rates on the device.",
    highlights: [
      "Equipment depreciation (GPS, total station), fuel, meals, day rates",
      "Official fees such as HKMO and land registry",
      "Terrain difficulty factor, income tax, margin and VAT",
      "Fully client-side: no server, no build step",
    ],
    shots: ["Equipment depreciation and job details form", "Calculated cost breakdown and quote price"],
  },
  servisdesk: {
    status: "Live demo",
    tagline: "An agent that routes repair requests to contractors",
    description:
      "A desktop agent for a retail chain's service desk: it reads store repair requests, suggests which contractor should take each one with a reason, using rules and an optional LLM, writes to the portal only after a human approves, and drafts follow-up emails for overdue work. A demo on fictional data runs in the browser.",
    highlights: [
      "The decision engine never rejects on its own: it either routes with a reason or hands the request to a person",
      "The LLM only suggests; it cannot route to a contractor the rules don't allow, and falls back to the local engine",
      "Portal writes are off by default and gated on approval; every write is read back and verified",
      "Overdue requests become .eml drafts grouped by contractor",
    ],
    results: ["requests auto-suggested"],
    shots: ["Portal: 72 fictional requests with SLA and assignment", "The engine's suggestion and reason; a person approves", "Overdue follow-up email grouped by contractor"],
  },
  "cast-and-chill": {
    status: "Side project",
    tagline: "An idle fishing game for the Windows taskbar",
    description:
      "An idle fishing game that lives on the Windows taskbar, with weighted catch tables, XP levels, upgrades, boss fights and random events, packaged as an installer with electron-builder.",
    highlights: ["Weighted catch tables and XP levels", "Upgrades, boss fights and random events", "Windows installer built with electron-builder"],
    shots: ["Taskbar strip and upgrades", "Cosmetics dropped by bosses"],
  },
};

export function buildContentEn(tr: Content): Content {
  return {
    ...tr,
    title: "AI Automation & Workflow Engineer",
    location: "İstanbul · Open to remote worldwide",
    headline: "I turn business requirements into working software with AI.",
    about: [
      "I use AI coding agents such as Claude Code, Cursor and GitHub Copilot as development partners to go from prototype to MVP to production.",
      "At FLO Group I built the LLM system that routes service requests for a network of about 800 stores. I build AI agents, MCP integrations and SQL-backed tools, including Turkish-speaking assistants for NETCAD and AutoCAD.",
    ],
    contactLead: "An idea, an MVP or a process to automate, let's talk. Reach me by email, on LinkedIn or on GitHub.",
    metrics: [
      { value: "3–4 h → 30 min", label: "Daily ticket triage at FLO Group" },
      { value: "~800", label: "Stores served by the LLM routing" },
      { value: "0.972", label: "Mario RAG answer accuracy (LLM-as-judge)" },
      { value: "669 → 320 ms", label: "kavunOS return-to-home time" },
    ],
    projects: tr.projects.map((p) => {
      const e = projects[p.slug];
      if (!e) return p;
      return {
        ...p,
        status: e.status,
        tagline: e.tagline,
        description: e.description,
        highlights: e.highlights,
        credit: e.credit ?? p.credit,
        results: p.results?.map((r, i) => ({ value: r.value, label: e.results?.[i] ?? r.label })),
        shots: p.shots?.map((s, i) => ({ src: s.src, alt: e.shots?.[i] ?? s.alt })),
      };
    }),
    experience: [
      {
        ...tr.experience[0],
        role: "Operations & Process Automation Specialist (Part-time)",
        period: "01/2025 – Present",
        bullets: [
          "Built a Python and LLM routing system that classifies incoming service requests against store and contractor reference data, cutting 3–4 hours of manual triage to 30 minutes.",
          "Keep it accurate in production by monitoring logs and live ticket data and correcting misrouted requests.",
          "Built PL/SQL queries, KPI reports and vendor performance dashboards covering ticket volume, resolution times and contractor performance.",
          "Coordinate daily operations between about 800 stores, internal teams and suppliers through SAP-based Flodesk workflows, running business analysis with stakeholders and turning requirements into process design improvements.",
          "Automate recurring operational work with Python and Selenium.",
        ],
      },
      {
        ...tr.experience[1],
        role: "Python Automation & Spatial Data Engineer",
        bullets: [
          "Automated analysis of high-resolution aerial orthophoto data with Python and OpenCV pipelines.",
          "Modeled geospatial inventory, coordinate and structural datasets and automated their processing with SQL and Pandas.",
          "Wrote Python and Excel tools for coordinate generation, calculations and volume workflows.",
          "Standardized data exchange between field teams and project management and ran technical data quality control.",
        ],
      },
    ],
    education: [
      { school: "Yıldız Technical University", degree: "B.Sc. Geomatics Engineering", period: "09/2020 – 06/2025", note: "Programming · Image processing · Statistics" },
      {
        school: "Digital University Platform (YÖK)",
        degree: "AI School, online",
        period: "11/2026 – Present",
        note: "Machine learning · LLMs, prompt engineering, agent development · AI-assisted software development",
      },
    ],
    languages: [
      { name: "Turkish", level: "Native" },
      { name: "English", level: "Fluent" },
    ],
    skillGroups: tr.skillGroups.map((g, i) => ({ ...g, group: ["AI-native development", "LLMs & agents", "Software & APIs", "Data & automation"][i] ?? g.group })),
    hobbies: [
      {
        label: "Hardware",
        title: "A PC I built myself",
        body: "I built the machine on this desk part by part: picking components, checking compatibility, assembly and cable management. After hours the same machine, with two controllers and spare keyboards under the desk, becomes a gaming station.",
        items: ["PC building", "Setup and tuning", "Gaming"],
      },
      {
        label: "Collection",
        title: "Shelves and figures",
        body: "The shelves are an exercise in order: every figure has its place, scale and story. Spider-Man holds the busiest shelf, next to Star Wars and framed 1:64 scale cars.",
        items: ["Spider-Man", "Star Wars", "Diecast", "Sneakers"],
      },
      { label: "Football", title: "The boots on the wall", body: "Five-a-side is a team game: once everyone knows their role, the match runs itself. On days I can't get to the pitch the boots hang on the wall, and the squad is still always one player short.", items: [] },
      { label: "Gym", title: "The tub on the corner", body: "I balance out the days at a screen with regular training. Small, consistent progress is a habit that pays off in code too.", items: [] },
    ],
  };
}
