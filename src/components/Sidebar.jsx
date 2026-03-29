import React from "react";
import { Link, NavLink } from "react-router-dom";

const TOOL_LINKS = [
  { label: "JSON Formatter", to: "/tools/json-formatter" },
  { label: "Base64 Encoder", to: "/tools/base64" },
  { label: "Regex Tester", to: "/tools/regex" },
  { label: "URL Encoder", to: "/tools/url-encoder" },
  { label: "Color Picker", to: "/tools/color-picker" },
  { label: "JWT Decoder", to: "/tools/jwt-decoder" },
  { label: "Markdown Preview", to: "/tools/markdown" },
  { label: "Word Counter", to: "/tools/word-counter" },
  { label: "CSS Box Shadow", to: "/tools/css-shadow" },
  { label: "CSS Gradient", to: "/tools/css-gradient" },
  { label: "Password Generator", to: "/tools/password-generator" },
  { label: "Flex & Grid Generator", to: "/tools/flexbox-generator" },
];

function getNavLinkClassName({ isActive }) {
  return [
    "block rounded-lg px-3 py-2 text-sm font-medium",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3aafa9] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#263d42]",
    "hover:bg-transparent dark:hover:bg-transparent",
    "hover:text-slate-700 dark:hover:text-white",
    isActive
      ? "bg-brand-100 text-brand-900 dark:bg-[rgba(58,175,169,0.2)] dark:text-white"
      : "text-slate-700 dark:text-white",
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
    <aside className="dt-sidebar flex h-full w-full flex-col">
      {/* App branding */}
      <Link
        to="/tools"
        onClick={() => {
          // Close mobile drawer when navigating home
          try {
            onNavigate?.();
          } catch {
            // No-op
          }
        }}
        className="block border-b border-slate-200 px-4 py-4 hover:bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3aafa9] focus-visible:ring-offset-2 dark:border-slate-600/60 dark:hover:bg-transparent dark:focus-visible:ring-offset-[#263d42]"
        aria-label="Go to tools home"
      >
        <div className="min-w-0">
          <div className="truncate text-base font-semibold text-slate-900 dark:text-white">
            DevToolbox
          </div>
          <div className="truncate text-xs text-slate-500 dark:text-white">
            Handy developer utilities
          </div>
        </div>
      </Link>

      {/* Tool links */}
      <nav className="flex-1 overflow-y-auto p-3">
        <div className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-white">
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
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-[#3aafa9] dark:border-slate-500/50 dark:bg-[rgba(15,23,42,0.45)] dark:text-white dark:placeholder:text-slate-400"
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
                <span className="truncate">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer area */}
      <div className="border-t border-slate-200 p-3 text-xs text-slate-500 dark:border-slate-600/50 dark:text-white">
        <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-[rgba(15,23,42,0.5)] dark:text-white">
          Tip: Use the sidebar to switch tools quickly.
        </div>
      </div>
    </aside>
  );
}
