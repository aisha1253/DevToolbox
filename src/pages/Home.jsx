import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

// Tool cards shown on the home page (names/routes align with Sidebar + App routes)
const TOOLS = [
  {
    icon: "🔧",
    name: "JSON Formatter",
    description: "Format, validate and minify JSON instantly",
    to: "/tools/json-formatter",
  },
  {
    icon: "🔐",
    name: "Base64",
    description: "Encode and decode Base64 text and images",
    to: "/tools/base64",
  },
  {
    icon: "🔍",
    name: "Regex Tester",
    description: "Test regular expressions with live highlighting",
    to: "/tools/regex",
  },
  {
    icon: "🔗",
    name: "URL Encoder",
    description: "Encode and decode URLs and query params",
    to: "/tools/url-encoder",
  },
  {
    icon: "🎨",
    name: "Color Picker",
    description: "Convert colors between HEX, RGB and HSL",
    to: "/tools/color-picker",
  },
  {
    icon: "🪙",
    name: "JWT Decoder",
    description: "Decode and inspect JWT tokens",
    to: "/tools/jwt-decoder",
  },
  {
    icon: "📝",
    name: "Markdown Preview",
    description: "Write markdown and preview it live",
    to: "/tools/markdown",
  },
  {
    icon: "📊",
    name: "Word Counter",
    description: "Count words, characters and paragraphs",
    to: "/tools/word-counter",
  },
];

export default function Home() {
  return (
    <div>
      {/* SEO */}
      <Helmet>
        <title>DevToolbox — Developer Utilities</title>
        <meta
          name="description"
          content="A collection of fast, offline-friendly developer utilities: JSON formatter, Base64, regex tester, URL encoder/decoder, color tools, JWT decoder, markdown preview, and word counter."
        />
      </Helmet>

      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          DevToolbox — Developer Utilities
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Fast, offline-friendly tools to help with everyday development tasks.
        </p>
      </div>

      {/* Tool cards grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {TOOLS.map((tool) => (
          <div
            key={tool.to}
            className="group relative rounded-2xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-500/40 dark:focus-within:ring-offset-slate-900"
          >
            {/* Full-card clickable link (keeps semantic navigation) */}
            <Link
              to={tool.to}
              className="absolute inset-0 rounded-2xl focus:outline-none"
              aria-label={`Open ${tool.name}`}
            />

            {/* Card content */}
            <div className="relative">
              <div className="flex items-start gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-lg dark:bg-slate-800">
                  <span aria-hidden="true">{tool.icon}</span>
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {tool.name}
                  </div>
                  <div className="mt-1 line-clamp-1 text-xs text-slate-600 dark:text-slate-300">
                    {tool.description}
                  </div>
                </div>
              </div>

              {/* Button row */}
              <div className="mt-4 flex items-center justify-between gap-2">
                <div className="text-xs text-slate-500 opacity-0 transition-opacity group-hover:opacity-100 dark:text-slate-400">
                  Click to open
                </div>

                <Link
                  to={tool.to}
                  className="relative inline-flex items-center justify-center rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
                >
                  Open Tool
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
