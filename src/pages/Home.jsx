import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

// Routes align with Sidebar + App; layout matches intro landing “What you will use most” cards
const TOOLS = [
  {
    badge: "Data",
    role: "Format · validate · minify",
    icon: "🔧",
    name: "JSON Formatter",
    description: "Format, validate and minify JSON instantly",
    to: "/tools/json-formatter",
  },
  {
    badge: "Encode",
    role: "Text & binary",
    icon: "🔐",
    name: "Base64",
    description: "Encode and decode Base64 text and images",
    to: "/tools/base64",
  },
  {
    badge: "Inspect",
    role: "Live pattern match",
    icon: "🔍",
    name: "Regex Tester",
    description: "Test regular expressions with live highlighting",
    to: "/tools/regex",
  },
  {
    badge: "URL",
    role: "Query-safe strings",
    icon: "🔗",
    name: "URL Encoder",
    description: "Encode and decode URLs and query params",
    to: "/tools/url-encoder",
  },
  {
    badge: "Color",
    role: "HEX · RGB · HSL",
    icon: "🎨",
    name: "Color Picker",
    description: "Convert colors between HEX, RGB and HSL",
    to: "/tools/color-picker",
  },
  {
    badge: "JWT",
    role: "Decode claims",
    icon: "🪙",
    name: "JWT Decoder",
    description: "Decode and inspect JWT tokens",
    to: "/tools/jwt-decoder",
  },
  {
    badge: "Docs",
    role: "Write & preview",
    icon: "📝",
    name: "Markdown Preview",
    description: "Write markdown and preview it live",
    to: "/tools/markdown",
  },
  {
    badge: "Text",
    role: "Counts & stats",
    icon: "📊",
    name: "Word Counter",
    description: "Count words, characters and paragraphs",
    to: "/tools/word-counter",
  },
  {
    badge: "CSS",
    role: "Shadow · preview",
    icon: "🖼",
    name: "CSS Box Shadow",
    description: "Build box-shadow values with sliders and live preview",
    to: "/tools/css-shadow",
  },
  {
    badge: "CSS",
    role: "Linear · radial",
    icon: "🌈",
    name: "CSS Gradient",
    description: "Create gradients with live preview and copyable CSS",
    to: "/tools/css-gradient",
  },
  {
    badge: "Security",
    role: "Length · strength",
    icon: "🔑",
    name: "Password Generator",
    description: "Random passwords with length, sets, strength, copy & regenerate",
    to: "/tools/password-generator",
  },
  {
    badge: "CSS",
    role: "Flex · Grid",
    icon: "📐",
    name: "Flex & Grid Generator",
    description: "Flex or CSS Grid, live numbered boxes, copy container CSS",
    to: "/tools/flexbox-generator",
  },
];

function matchesToolQuery(tool, q) {
  if (!q.trim()) return true;
  const s = q.trim().toLowerCase();
  const hay = [
    tool.name,
    tool.badge,
    tool.role,
    tool.description,
    tool.to.replace(/^\/tools\/?/, ""),
  ]
    .join(" ")
    .toLowerCase();
  return hay.includes(s);
}

export default function Home() {
  const [query, setQuery] = React.useState("");

  const filteredTools = React.useMemo(() => {
    try {
      return TOOLS.filter((tool) => matchesToolQuery(tool, query));
    } catch {
      return TOOLS;
    }
  }, [query]);

  return (
    <div className="br-tools-page">
      <Helmet>
        <title>DevToolbox — Developer Utilities</title>
        <meta
          name="description"
          content="A collection of fast, offline-friendly developer utilities: JSON formatter, Base64, regex tester, URL encoder/decoder, color tools, JWT decoder, markdown preview, and word counter."
        />
      </Helmet>

      <div className="mb-8">
        <h1 className="br-section-title">DevToolbox — Developer Utilities</h1>
        <p className="br-tools-lead mt-2 max-w-2xl">
          Fast, offline-friendly tools to help with everyday development tasks.
        </p>
      </div>

      <div className="mb-8 max-w-2xl">
        <label htmlFor="tools-home-search" className="sr-only">
          Search tools
        </label>
        <input
          id="tools-home-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tools by name, category, or description…"
          autoComplete="off"
          className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition-shadow focus:ring-2 focus:ring-[#3aafa9] dark:border-slate-500/50 dark:bg-[rgba(15,23,42,0.45)] dark:text-white dark:placeholder:text-slate-400"
        />
      </div>

      <div className="br-characters-grid">
        {filteredTools.map((tool) => (
          <div key={tool.to} className="br-character-card group relative">
            <span className="br-character-movie" aria-hidden="true">
              {tool.badge}
            </span>

            <Link
              to={tool.to}
              className="relative z-[2] block rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3aafa9] focus-visible:ring-offset-2 focus-visible:ring-offset-[#17252a] dark:focus-visible:ring-offset-[#263d42]"
            >
              <h2 className="br-character-name br-tool-card-title">{tool.name}</h2>
            </Link>

            <p className="br-character-role">{tool.role}</p>
            <p className="br-character-desc">{tool.description}</p>

            <div className="relative z-[2] mt-6 flex items-center justify-between gap-3">
              <span className="text-xs opacity-0 transition-opacity duration-200 group-hover:opacity-100 br-tools-hint">
                Click to open
              </span>
              <Link
                to={tool.to}
                className="dt-btn relative z-[2] inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-semibold shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
              >
                Open Tool
              </Link>
            </div>
          </div>
        ))}
      </div>

      {query.trim() && filteredTools.length === 0 ? (
        <p className="mt-6 text-sm text-slate-600 dark:text-slate-400" role="status">
          No tools match &ldquo;{query.trim()}&rdquo;. Try another search.
        </p>
      ) : null}
    </div>
  );
}
