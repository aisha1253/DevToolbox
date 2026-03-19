import React from "react";
import { Link, NavLink } from "react-router-dom";

// Sidebar navigation items (emoji icons as requested)
const TOOL_LINKS = [
  { icon: "🔧", label: "JSON Formatter", to: "/tools/json-formatter" },
  { icon: "🔐", label: "Base64 Encoder", to: "/tools/base64" },
  { icon: "🔍", label: "Regex Tester", to: "/tools/regex" },
  { icon: "🔗", label: "URL Encoder", to: "/tools/url-encoder" },
  { icon: "🎨", label: "Color Picker", to: "/tools/color-picker" },
  { icon: "🪙", label: "JWT Decoder", to: "/tools/jwt-decoder" },
  { icon: "📝", label: "Markdown Preview", to: "/tools/markdown" },
  { icon: "📊", label: "Word Counter", to: "/tools/word-counter" },
];

function getNavLinkClassName({ isActive }) {
  // Active-state highlighting for NavLink
  return [
    "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900",
    isActive
      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-200"
      : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/70",
  ].join(" ");
}

export default function Sidebar({ onNavigate }) {
  // Sidebar search/filter state (Ctrl+K focuses this input)
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    try {
      const q = query.trim().toLowerCase();
      if (!q) return TOOL_LINKS;
      return TOOL_LINKS.filter((t) => t.label.toLowerCase().includes(q));
    } catch {
      return TOOL_LINKS;
    }
  }, [query]);

  return (
    <aside className="flex h-full w-full flex-col">
      {/* App branding */}
      <Link
        to="/"
        onClick={() => {
          // Close mobile drawer when navigating home
          try {
            onNavigate?.();
          } catch {
            // No-op
          }
        }}
        className="flex items-center gap-3 border-b border-slate-200 px-4 py-4 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:border-slate-800 dark:hover:bg-slate-800/40 dark:focus-visible:ring-offset-slate-900"
        aria-label="Go to home"
      >
        <div className="grid size-9 place-items-center rounded-lg bg-indigo-600 text-white">
          {/* Simple logo mark */}
          <span className="text-lg" aria-hidden="true">
            🧰
          </span>
        </div>
        <div className="min-w-0">
          <div className="truncate text-base font-semibold text-slate-900 dark:text-slate-100">
            DevToolbox
          </div>
          <div className="truncate text-xs text-slate-500 dark:text-slate-400">
            Handy developer utilities
          </div>
        </div>
      </Link>

      {/* Tool links */}
      <nav className="flex-1 overflow-y-auto p-3">
        <div className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Tools
        </div>

        {/* Search (Ctrl+K) */}
        <div className="px-2 pb-3">
          <input
            id="sidebar-search"
            value={query}
            onChange={(e) => {
              try {
                setQuery(e.target.value);
              } catch {
                // No-op
              }
            }}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-100"
            placeholder="Search tools… (Ctrl+K)"
            aria-label="Search tools"
          />
        </div>

        <ul className="space-y-1">
          {filtered.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={getNavLinkClassName}
                onClick={() => {
                  // Close mobile drawer after navigation (no-op on desktop)
                  try {
                    onNavigate?.();
                  } catch {
                    // If a parent passes a bad handler, ignore and keep navigation working
                  }
                }}
              >
                <span className="text-base" aria-hidden="true">
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer area */}
      <div className="border-t border-slate-200 p-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
        <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-900/40">
          Tip: Use the sidebar to switch tools quickly.
        </div>
      </div>
    </aside>
  );
}
