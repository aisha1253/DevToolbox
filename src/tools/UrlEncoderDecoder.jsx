import React from "react";
import { Helmet } from "react-helmet-async";
import { useToast } from "../components/ToastProvider";

export default function UrlEncoderDecoder() {
  // Toasts (used for copy notifications)
  const { pushToast } = useToast();
  // Tabs: Encode/Decode
  const [tab, setTab] = React.useState("encode"); // "encode" | "decode"

  // Encode/decode section state
  const [input, setInput] = React.useState("");
  const [output, setOutput] = React.useState("");
  const [error, setError] = React.useState("");
  const [isWorking, setIsWorking] = React.useState(false);

  // Encode mode: full URL vs component
  const [encodeMode, setEncodeMode] = React.useState("component"); // "full" | "component"
  const [showTooltip, setShowTooltip] = React.useState(false);

  // Query params parser (bonus section)
  const [queryUrl, setQueryUrl] = React.useState("");
  const [paramsError, setParamsError] = React.useState("");

  const parsedParams = React.useMemo(() => {
    // Parse query params into a list of { key, value } safely
    try {
      const value = queryUrl.trim();
      if (!value) {
        setParamsError("");
        return [];
      }

      const url = new URL(value);
      const entries = [];
      for (const [k, v] of url.searchParams.entries()) {
        entries.push({ key: k, value: v });
      }

      setParamsError("");
      return entries;
    } catch {
      setParamsError(
        "Paste a valid full URL (including protocol), e.g. https://example.com?a=1"
      );
      return [];
    }
  }, [queryUrl]);

  function clearAll() {
    // Clear all sections
    try {
      setInput("");
      setOutput("");
      setError("");
      setQueryUrl("");
      setParamsError("");
    } catch {
      // No-op
    }
  }

  function encode() {
    // Encode text/URL using encodeURI (full) or encodeURIComponent (component)
    setIsWorking(true);
    setError("");
    try {
      const fn = encodeMode === "full" ? encodeURI : encodeURIComponent;
      setOutput(fn(input));
    } catch {
      setOutput("");
      setError("Encoding failed. Please check your input and try again.");
    } finally {
      setIsWorking(false);
    }
  }

  function decode() {
    // Decode URL-encoded input (try/catch to prevent crashes)
    setIsWorking(true);
    setError("");
    try {
      setOutput(decodeURIComponent(input));
    } catch {
      setOutput("");
      setError("Decoding failed. Input may be malformed or incomplete.");
    } finally {
      setIsWorking(false);
    }
  }

  // Keyboard shortcut: Ctrl+Enter runs Encode/Decode based on current tab
  React.useEffect(() => {
    function onRun() {
      try {
        if (tab === "encode") encode();
        else decode();
      } catch {
        // No-op
      }
    }
    window.addEventListener("devtoolbox:run", onRun);
    return () => window.removeEventListener("devtoolbox:run", onRun);
  }, [tab, input, encodeMode]);

  async function copyText(text, setSectionError) {
    // Shared clipboard helper with solid error handling
    try {
      if (!text) {
        setSectionError("Nothing to copy yet.");
        return;
      }
      await navigator.clipboard.writeText(text);
      pushToast("Copied to clipboard!");
    } catch {
      setSectionError("Copy failed. Your browser may block clipboard access.");
    }
  }

  return (
    <div className="space-y-4">
      {/* SEO */}
      <Helmet>
        <title>URL Encoder/Decoder — DevToolbox</title>
        <meta
          name="description"
          content="Encode and decode URLs using encodeURI/encodeURIComponent modes, and parse query params into a copy-friendly table."
        />
      </Helmet>

      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          🔗 URL Encoder
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Encode and decode URLs, plus parse query parameters.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex w-full max-w-md rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
        <button
          type="button"
          onClick={() => {
            try {
              setTab("encode");
              setError("");
              setOutput("");
            } catch {
              // No-op
            }
          }}
          className={[
            "flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition",
            tab === "encode"
              ? "bg-indigo-600 text-white"
              : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/60",
          ].join(" ")}
        >
          Encode
        </button>
        <button
          type="button"
          onClick={() => {
            try {
              setTab("decode");
              setError("");
              setOutput("");
            } catch {
              // No-op
            }
          }}
          className={[
            "flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition",
            tab === "decode"
              ? "bg-indigo-600 text-white"
              : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/60",
          ].join(" ")}
        >
          Decode
        </button>
      </div>

      {/* Error message (encode/decode section) */}
      {error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-200">
          {error}
        </div>
      ) : null}

      {/* Encode/Decode section */}
      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        {/* Encode mode options + tooltip */}
        {tab === "encode" ? (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Mode
              </span>
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                <input
                  type="radio"
                  name="encode-mode"
                  checked={encodeMode === "full"}
                  onChange={() => setEncodeMode("full")}
                />
                Full URL
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                <input
                  type="radio"
                  name="encode-mode"
                  checked={encodeMode === "component"}
                  onChange={() => setEncodeMode("component")}
                />
                Component
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowTooltip((v) => !v)}
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800/60"
                  aria-label="What is the difference?"
                >
                  ?
                </button>
                {showTooltip ? (
                  <div className="absolute right-0 top-9 z-10 w-72 rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-700 shadow-lg dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                    <div className="font-semibold">Full vs Component</div>
                    <div className="mt-1">
                      <span className="font-semibold">Full URL</span> uses{" "}
                      <code className="font-mono">encodeURI</code> (keeps
                      characters like{" "}
                      <code className="font-mono">:/?&amp;=</code>).
                    </div>
                    <div className="mt-1">
                      <span className="font-semibold">Component</span> uses{" "}
                      <code className="font-mono">encodeURIComponent</code>{" "}
                      (encodes everything except a few safe chars).
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        {/* Two panel layout */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Input
            </div>
            <textarea
              className="min-h-40 w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-100"
              value={input}
              onChange={(e) => {
                try {
                  setInput(e.target.value);
                } catch {
                  // No-op
                }
              }}
              placeholder={
                tab === "encode"
                  ? "https://example.com?q=hello world"
                  : "https%3A%2F%2Fexample.com%3Fq%3Dhello%20world"
              }
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Output
              </div>
              <button
                type="button"
                onClick={() => {
                  setError("");
                  copyText(output, setError);
                }}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800/60"
              >
                Copy output
              </button>
            </div>
            <textarea
              className="min-h-40 w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-100"
              value={output}
              readOnly
              placeholder="Result will appear here…"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          {tab === "encode" ? (
            <button
              type="button"
              onClick={encode}
              disabled={isWorking}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isWorking ? "Working…" : "Encode"}
            </button>
          ) : (
            <button
              type="button"
              onClick={decode}
              disabled={isWorking}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isWorking ? "Working…" : "Decode"}
            </button>
          )}
          <button
            type="button"
            onClick={clearAll}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800/60"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Query Params Parser (bonus) */}
      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Query Params Parser
            </div>
            <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">
              Paste a full URL and get a clean params table.
            </div>
          </div>
          <button
            type="button"
            onClick={() => copyText(queryUrl, setParamsError)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800/60"
          >
            Copy URL
          </button>
        </div>

        {paramsError ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-200">
            {paramsError}
          </div>
        ) : null}

        <textarea
          className="min-h-24 w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-100"
          value={queryUrl}
          onChange={(e) => {
            try {
              setQueryUrl(e.target.value);
            } catch {
              // No-op
            }
          }}
          placeholder="https://example.com/search?q=hello&lang=en"
        />

        {/* Params table */}
        <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-700 dark:bg-slate-950/40 dark:text-slate-200">
              <tr>
                <th className="px-3 py-2">Key</th>
                <th className="px-3 py-2">Value</th>
                <th className="px-3 py-2 text-right">Copy</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900">
              {parsedParams.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-3 py-3 text-sm text-slate-600 dark:text-slate-300"
                  >
                    No params found.
                  </td>
                </tr>
              ) : (
                parsedParams.map((row, idx) => (
                  <tr
                    key={`${row.key}-${idx}`}
                    className="border-t border-slate-200 dark:border-slate-800"
                  >
                    <td className="px-3 py-2 font-mono text-xs text-slate-900 dark:text-slate-100">
                      {row.key}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-slate-700 dark:text-slate-200">
                      {row.value}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          copyText(`${row.key}=${row.value}`, setParamsError)
                        }
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800/60"
                      >
                        Copy
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
