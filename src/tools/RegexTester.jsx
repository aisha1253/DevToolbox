import React from "react";
import { Helmet } from "react-helmet-async";
import { useToast } from "../components/ToastProvider";

function escapeHtml(unsafe) {
  // Escape HTML to keep highlighting safe
  return String(unsafe)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function buildFlags({ g, i, m }) {
  // Convert checkbox flags to a string, always ensuring deterministic order
  return `${g ? "g" : ""}${i ? "i" : ""}${m ? "m" : ""}`;
}

function makeHighlightRegex(pattern, flags) {
  // For highlighting, we always need a global regex to find ALL matches.
  // If user didn't select g, we still add it for highlight computation only.
  const f = flags.includes("g") ? flags : `${flags}g`;
  return new RegExp(pattern, f);
}

function computeMatches(pattern, flags, text) {
  // Compute matches + groups without crashing (all regex ops in try/catch)
  try {
    if (!pattern) return { error: null, matches: [] };

    const re = new RegExp(pattern, flags);
    const results = [];

    // Use matchAll when possible (needs global). If not global, take first exec.
    if (flags.includes("g")) {
      for (const m of text.matchAll(re)) {
        results.push({
          text: m[0],
          index: m.index ?? 0,
          groups: m.length > 1 ? m.slice(1) : [],
        });
      }
    } else {
      const m = re.exec(text);
      if (m) {
        results.push({
          text: m[0],
          index: m.index ?? 0,
          groups: m.length > 1 ? m.slice(1) : [],
        });
      }
    }

    return { error: null, matches: results };
  } catch (e) {
    return { error: e?.message ? String(e.message) : "Unknown error", matches: [] };
  }
}

function highlightText(text, pattern, flags) {
  // Return HTML with <mark> around matches, or plain escaped text if invalid/empty.
  try {
    if (!pattern) return escapeHtml(text);

    const re = makeHighlightRegex(pattern, flags);
    const parts = [];
    let lastIndex = 0;

    for (const m of text.matchAll(re)) {
      const start = m.index ?? 0;
      const matchText = m[0] ?? "";
      const end = start + matchText.length;

      if (end < start) continue;
      if (start > lastIndex) parts.push(escapeHtml(text.slice(lastIndex, start)));

      parts.push(
        `<mark class="rounded bg-yellow-200/80 px-0.5 text-slate-900 dark:bg-yellow-400/30 dark:text-slate-100">${escapeHtml(
          matchText
        )}</mark>`
      );

      lastIndex = end;

      // Prevent infinite loops on zero-length matches
      if (matchText.length === 0) {
        lastIndex += 1;
        re.lastIndex = lastIndex;
      }
    }

    parts.push(escapeHtml(text.slice(lastIndex)));
    return parts.join("");
  } catch {
    // Invalid regex: no highlight
    return escapeHtml(text);
  }
}

export default function RegexTester() {
  // Toasts (used for copy notifications)
  const { pushToast } = useToast();
  // Regex state
  const [pattern, setPattern] = React.useState("");
  const [flagG, setFlagG] = React.useState(true);
  const [flagI, setFlagI] = React.useState(false);
  const [flagM, setFlagM] = React.useState(false);

  // Test string
  const [text, setText] = React.useState("");

  // UI state
  const [error, setError] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  const flags = React.useMemo(
    () => buildFlags({ g: flagG, i: flagI, m: flagM }),
    [flagG, flagI, flagM]
  );

  const { error: regexError, matches } = React.useMemo(() => {
    // Keep match computation stable and safe
    return computeMatches(pattern, flags, text);
  }, [pattern, flags, text]);

  const highlightedHtml = React.useMemo(() => {
    // Clear highlights if regex is invalid
    if (regexError) return escapeHtml(text);
    return highlightText(text, pattern, flags);
  }, [text, pattern, flags, regexError]);

  // Surface regex errors in the UI (without crashing)
  React.useEffect(() => {
    if (regexError) setError(`Invalid regex: ${regexError}`);
    else setError("");
  }, [regexError]);

  // Auto-clear "Copied!" state after 2 seconds
  React.useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(t);
  }, [copied]);

  async function copyRegex() {
    // Copy the regex in /pattern/flags form
    setError((prev) => prev); // keep any regex error visible
    try {
      const value = `/${pattern}/${flags}`;
      await navigator.clipboard.writeText(value);
      setCopied(true);
      pushToast("Copied to clipboard!");
    } catch {
      setError("Copy failed. Your browser may block clipboard access.");
    }
  }

  function insertQuick(patternValue, defaultFlags = { g: true, i: true, m: false }) {
    // Quick insert common patterns with safe updates
    try {
      setPattern(patternValue);
      setFlagG(Boolean(defaultFlags.g));
      setFlagI(Boolean(defaultFlags.i));
      setFlagM(Boolean(defaultFlags.m));
    } catch {
      // No-op
    }
  }

  return (
    <div className="space-y-4">
      {/* SEO */}
      <Helmet>
        <title>Regex Tester — DevToolbox</title>
        <meta
          name="description"
          content="Test regular expressions with live highlighting, match counts, group details, quick inserts, and one-click copy."
        />
      </Helmet>

      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          🔍 Regex Tester
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Test regular expressions with live highlighting and match details.
        </p>
      </div>

      {/* Error message */}
      {error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-200">
          {error}
        </div>
      ) : null}

      {/* Regex input row with / / wrapper */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-1 items-center gap-2">
            <span className="font-mono text-sm text-slate-500 dark:text-slate-400">
              /
            </span>
            <input
              className="w-full min-w-[220px] rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-100"
              value={pattern}
              onChange={(e) => {
                // Safe pattern updates
                try {
                  setPattern(e.target.value);
                  setCopied(false);
                } catch {
                  // No-op
                }
              }}
              placeholder="pattern"
              aria-label="Regex pattern"
            />
            <span className="font-mono text-sm text-slate-500 dark:text-slate-400">
              /
            </span>
          </div>

          {/* Flags checkboxes */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
              <input
                type="checkbox"
                checked={flagG}
                onChange={(e) => setFlagG(e.target.checked)}
              />
              g
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
              <input
                type="checkbox"
                checked={flagI}
                onChange={(e) => setFlagI(e.target.checked)}
              />
              i
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
              <input
                type="checkbox"
                checked={flagM}
                onChange={(e) => setFlagM(e.target.checked)}
              />
              m
            </label>
          </div>

          {/* Copy regex */}
          <button
            type="button"
            onClick={copyRegex}
            className="dt-btn rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
          >
            {copied ? "Copied!" : "Copy regex"}
          </button>
        </div>

        {/* Quick inserts */}
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              insertQuick(String.raw`[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}`, {
                g: true,
                i: true,
                m: false,
              })
            }
            className="dt-btn rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
          >
            Email
          </button>
          <button
            type="button"
            onClick={() =>
              insertQuick(String.raw`https?:\/\/[^\s]+`, { g: true, i: true, m: false })
            }
            className="dt-btn rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
          >
            URL
          </button>
          <button
            type="button"
            onClick={() =>
              insertQuick(String.raw`(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{2,4}\)?[\s-]?)?\d{3,4}[\s-]?\d{4}`, {
                g: true,
                i: false,
                m: false,
              })
            }
            className="dt-btn rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
          >
            Phone number
          </button>
          <button
            type="button"
            onClick={() => insertQuick(String.raw`^\d+$`, { g: false, i: false, m: true })}
            className="dt-btn rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
          >
            Numbers only
          </button>
          <button
            type="button"
            onClick={() => insertQuick(String.raw`^[a-z0-9]+$`, { g: false, i: true, m: true })}
            className="dt-btn rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
          >
            Alphanumeric
          </button>
        </div>
      </div>

      {/* Test string with live highlighting (overlay technique) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Test string
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Live highlights
          </div>
        </div>

        <div className="relative">
          {/* Highlight layer */}
          <pre
            className="pointer-events-none min-h-[12rem] w-full overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-sm leading-6 text-slate-900 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-100"
            aria-hidden="true"
          >
            <code dangerouslySetInnerHTML={{ __html: highlightedHtml || "&nbsp;" }} />
          </pre>

          {/* Input layer */}
          <textarea
            className="absolute inset-0 min-h-[12rem] w-full resize-y rounded-lg border border-transparent bg-transparent p-3 font-mono text-sm leading-6 text-transparent caret-slate-900 outline-none focus:ring-2 focus:ring-brand-500 dark:caret-slate-100"
            value={text}
            onChange={(e) => {
              // Safe text updates
              try {
                setText(e.target.value);
              } catch {
                // No-op
              }
            }}
            placeholder="Paste or type text here…"
            spellCheck={false}
          />
        </div>
      </div>

      {/* Match info panel */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Match info
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-300">
            Total matches: <span className="font-semibold">{matches.length}</span>
          </div>
        </div>

        {matches.length === 0 ? (
          <div className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            No matches yet.
          </div>
        ) : (
          <ul className="mt-3 space-y-2">
            {matches.map((m, idx) => (
              <li
                key={`${m.index}-${idx}`}
                className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-800 dark:bg-slate-950/40"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-mono text-slate-900 dark:text-slate-100">
                    {m.text}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    index: {m.index}
                  </div>
                </div>

                {m.groups?.length ? (
                  <div className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                    <span className="font-semibold">Groups:</span>{" "}
                    {m.groups.map((g, gi) => (
                      <span
                        key={gi}
                        className="ml-2 inline-flex rounded-md border border-slate-200 bg-white px-2 py-0.5 font-mono dark:border-slate-800 dark:bg-slate-900"
                      >
                        {String(g)}
                      </span>
                    ))}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
