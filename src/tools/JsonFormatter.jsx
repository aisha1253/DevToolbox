import React from "react";
import { Helmet } from "react-helmet-async";
import { useToast } from "../components/ToastProvider";

// Sample JSON for quick testing
const SAMPLE_JSON = `{
  "name": "DevToolbox",
  "version": 1,
  "enabled": true,
  "features": ["json", "base64", "regex"],
  "limits": { "maxItems": 10, "timeoutMs": 1500 },
  "notes": null
}`;

function escapeHtml(unsafe) {
  // Escape HTML to keep dangerouslySetInnerHTML safe
  // (We only inject spans we create, never raw user HTML)
  return String(unsafe)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function getLineAndColumnFromPos(text, pos) {
  // Convert a JS "position" (0-based char index) to 1-based line/column
  try {
    const before = text.slice(0, Math.max(0, pos));
    const lines = before.split(/\r\n|\r|\n/);
    const line = lines.length;
    const column = lines[lines.length - 1]?.length + 1;
    return { line, column };
  } catch {
    return { line: 1, column: 1 };
  }
}

function parseJsonErrorDetails(input, error) {
  // Extract an "exact" JSON.parse error with line/column when possible.
  // Browsers often provide: "... at position 123"
  try {
    const message = error?.message ? String(error.message) : "Invalid JSON";
    const match = message.match(/at position (\d+)/i);
    if (!match) return { message, line: null, column: null };

    const pos = Number(match[1]);
    if (!Number.isFinite(pos)) return { message, line: null, column: null };

    const { line, column } = getLineAndColumnFromPos(input, pos);
    return { message, line, column };
  } catch {
    return { message: "Invalid JSON", line: null, column: null };
  }
}

function syntaxHighlightJson(jsonText) {
  // Highlight JSON tokens without external libraries.
  // Keys: blue, strings: green, numbers: orange, booleans: red, null: gray
  //
  // Steps:
  // - Escape HTML first
  // - Wrap tokens with <span> classes using a regex-based tokenizer
  try {
    const escaped = escapeHtml(jsonText);

    const tokenRegex =
      /("(?:\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*")(\\s*:)?|\btrue\b|\bfalse\b|\bnull\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g;

    return escaped.replaceAll(tokenRegex, (match, quotedString, isKeyColon) => {
      // String token (either a key or a string value)
      if (quotedString) {
        const isKey = Boolean(isKeyColon);
        const cls = isKey
          ? "text-blue-600 dark:text-blue-400"
          : "text-emerald-600 dark:text-emerald-400";

        // If this was a key, preserve the trailing ":" captured in group 2
        const suffix = isKeyColon ? escapeHtml(isKeyColon) : "";
        return `<span class="${cls}">${quotedString}</span>${suffix}`;
      }

      // Boolean / null / number tokens
      if (match === "true" || match === "false") {
        return `<span class="text-rose-600 dark:text-rose-400">${match}</span>`;
      }
      if (match === "null") {
        return `<span class="text-slate-500 dark:text-slate-400">${match}</span>`;
      }
      // Number
      return `<span class="text-orange-600 dark:text-orange-400">${match}</span>`;
    });
  } catch {
    // If highlighting fails, fall back to escaped text
    return escapeHtml(jsonText);
  }
}

export default function JsonFormatter() {
  // Toasts (used for copy notifications)
  const { pushToast } = useToast();
  // Input/output state
  const [input, setInput] = React.useState("");
  const [output, setOutput] = React.useState("");

  // Indentation options (2, 4, or tab)
  const [indent, setIndent] = React.useState("2"); // "2" | "4" | "tab"

  // Validation state (auto-updated on input change)
  const [isValid, setIsValid] = React.useState(false);
  const [errorDetails, setErrorDetails] = React.useState(null);

  // UI state
  const [copied, setCopied] = React.useState(false);
  const [isWorking, setIsWorking] = React.useState(false);

  // Auto-validate whenever the input changes
  React.useEffect(() => {
    try {
      if (!input.trim()) {
        setIsValid(false);
        setErrorDetails(null);
        return;
      }

      JSON.parse(input);
      setIsValid(true);
      setErrorDetails(null);
    } catch (e) {
      setIsValid(false);
      setErrorDetails(parseJsonErrorDetails(input, e));
    }
  }, [input]);

  // Keyboard shortcut: Ctrl+Enter runs "Format"
  React.useEffect(() => {
    function onRun() {
      try {
        formatJson();
      } catch {
        // No-op
      }
    }
    window.addEventListener("devtoolbox:run", onRun);
    return () => window.removeEventListener("devtoolbox:run", onRun);
  }, [input, indent]); // ensure latest state is used

  // Automatically clear "Copied!" state after 2 seconds
  React.useEffect(() => {
    if (!copied) return;

    const t = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(t);
  }, [copied]);

  function getIndentValue() {
    // Convert UI selection into JSON.stringify's third argument
    try {
      if (indent === "tab") return "\t";
      const n = Number(indent);
      return Number.isFinite(n) ? n : 2;
    } catch {
      return 2;
    }
  }

  function formatJson() {
    // Format JSON with safe error handling (try/catch around all JSON operations)
    setIsWorking(true);
    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, getIndentValue());
      setOutput(formatted);
      setIsValid(true);
      setErrorDetails(null);
    } catch (e) {
      setOutput("");
      setIsValid(false);
      setErrorDetails(parseJsonErrorDetails(input, e));
    } finally {
      setIsWorking(false);
    }
  }

  function minifyJson() {
    // Minify JSON with safe error handling
    setIsWorking(true);
    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
      setIsValid(true);
      setErrorDetails(null);
    } catch (e) {
      setOutput("");
      setIsValid(false);
      setErrorDetails(parseJsonErrorDetails(input, e));
    } finally {
      setIsWorking(false);
    }
  }

  function clearAll() {
    // Clear input/output and reset state
    try {
      setInput("");
      setOutput("");
      setIsValid(false);
      setErrorDetails(null);
      setCopied(false);
    } catch {
      // No-op (state updates are best-effort)
    }
  }

  function loadSample() {
    // Load sample JSON for quick testing
    try {
      setInput(SAMPLE_JSON);
      setOutput("");
      setCopied(false);
    } catch {
      // No-op
    }
  }

  async function copyOutput() {
    // Copy formatted/minified output to clipboard, then show "Copied!" for 2 seconds
    try {
      if (!output) {
        setErrorDetails({
          message: "Nothing to copy yet. Format or minify JSON first.",
          line: null,
          column: null,
        });
        return;
      }

      await navigator.clipboard.writeText(output);
      setCopied(true);
      pushToast("Copied to clipboard!");
    } catch {
      setErrorDetails({
        message: "Copy failed. Your browser may block clipboard access.",
        line: null,
        column: null,
      });
    }
  }

  const highlightedOutputHtml = React.useMemo(() => {
    // Memoize highlighting to avoid recomputing on every render
    return syntaxHighlightJson(output);
  }, [output]);

  const inputCharCount = input.length;

  const outputBorderClass = errorDetails
    ? "border-rose-300 dark:border-rose-700"
    : isValid && output
      ? "border-emerald-300 dark:border-emerald-700"
      : "border-slate-200 dark:border-slate-800";

  return (
    <div className="space-y-4">
      {/* SEO */}
      <Helmet>
        <title>JSON Formatter Online — DevToolbox</title>
        <meta
          name="description"
          content="Format, validate, minify, and syntax-highlight JSON instantly. Includes indent options, auto-validation, and copy-to-clipboard."
        />
      </Helmet>

      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          🔧 JSON Formatter
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Format, minify, validate, and copy JSON instantly.
        </p>
      </div>

      {/* Status row (valid/invalid badge + indent options + sample/clear) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* Auto-validation badge */}
          <div
            className={[
              "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold",
              input.trim().length === 0
                ? "border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                : isValid
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-200"
                  : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-200",
            ].join(" ")}
          >
            <span aria-hidden="true">
              {input.trim().length === 0 ? "—" : isValid ? "✅" : "❌"}
            </span>
            <span>
              {input.trim().length === 0
                ? "Paste JSON to validate"
                : isValid
                  ? "Valid JSON"
                  : "Invalid JSON"}
            </span>
          </div>

          {/* Exact error message (with line/column when available) */}
          {errorDetails ? (
            <div className="text-xs text-rose-700 dark:text-rose-200">
              {errorDetails.message}
              {errorDetails.line ? ` (line ${errorDetails.line}, col ${errorDetails.column})` : ""}
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Indent selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Indent
            </span>
            <select
              value={indent}
              onChange={(e) => setIndent(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value="2">2 spaces</option>
              <option value="4">4 spaces</option>
              <option value="tab">Tab</option>
            </select>
          </div>

          {/* Sample + Clear */}
          <button
            type="button"
            onClick={loadSample}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800/60"
          >
            Sample JSON
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800/60"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Input / Output */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          {/* Input header */}
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Input
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {inputCharCount.toLocaleString()} chars
            </div>
          </div>

          {/* Input textarea */}
          <textarea
            className="min-h-56 w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
            value={input}
            onChange={(e) => {
              // Keep state updates safe and predictable
              try {
                setInput(e.target.value);
                setCopied(false);
              } catch {
                // No-op
              }
            }}
            placeholder='{"hello":"world"}'
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            {/* Output header */}
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Output
            </div>
            <button
              type="button"
              onClick={copyOutput}
              className="dt-btn rounded-lg px-3 py-1.5 text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
            >
              {copied ? "Copied!" : "Copy Output"}
            </button>
          </div>

          {/* Output panel (syntax-highlighted) */}
          <div
            className={[
              "min-h-56 w-full overflow-auto rounded-lg border bg-slate-50 p-3 text-sm outline-none dark:bg-slate-950/40",
              outputBorderClass,
            ].join(" ")}
          >
            {/* Use <pre> to preserve whitespace/newlines */}
            {output ? (
              <pre
                className="whitespace-pre-wrap break-words font-mono text-xs leading-5 text-slate-900 dark:text-slate-100"
                dangerouslySetInnerHTML={{ __html: highlightedOutputHtml }}
              />
            ) : (
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Formatted / minified JSON will appear here…
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={formatJson}
          disabled={isWorking}
          className="dt-btn rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
        >
          {isWorking ? "Formatting…" : "Format"}
        </button>

        <button
          type="button"
          onClick={minifyJson}
          disabled={isWorking}
          className="dt-btn rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
        >
          {isWorking ? "Working…" : "Minify"}
        </button>
      </div>
    </div>
  );
}
