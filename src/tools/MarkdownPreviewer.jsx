import React from "react";
import { marked } from "marked";
import { Helmet } from "react-helmet-async";
import { useToast } from "../components/ToastProvider";

const SAMPLE_MD = `# DevToolbox Markdown Preview

Use the toolbar to insert markdown quickly.

## Features
- **Bold** and *italic*
- Links: [Vite](https://vite.dev)
- Inline code: \`const x = 1\`

\`\`\`js
function hello(name) {
  return \`Hello, \${name}!\`
}
\`\`\`
`;

function applyWrap(text, start, end, wrapperLeft, wrapperRight) {
  // Apply toolbar transformations by wrapping selection
  try {
    const before = text.slice(0, start);
    const selected = text.slice(start, end);
    const after = text.slice(end);
    return {
      nextText: `${before}${wrapperLeft}${selected || ""}${wrapperRight}${after}`,
      nextSelectionStart: start + wrapperLeft.length,
      nextSelectionEnd: start + wrapperLeft.length + (selected || "").length,
    };
  } catch {
    return { nextText: text, nextSelectionStart: start, nextSelectionEnd: end };
  }
}

function applyPrefixLine(text, start, end, prefix) {
  // Prefix the current line (used for heading/list)
  try {
    const lines = text.split(/\r\n|\r|\n/);

    // Compute line index from selectionStart by walking char counts
    let pos = 0;
    let lineIndex = 0;
    for (let i = 0; i < lines.length; i += 1) {
      const lineLen = lines[i].length;
      if (start <= pos + lineLen) {
        lineIndex = i;
        break;
      }
      pos += lineLen + 1; // assumes \n; good enough for UI
    }

    lines[lineIndex] = `${prefix}${lines[lineIndex]}`;
    const nextText = lines.join("\n");
    return { nextText, nextSelectionStart: start + prefix.length, nextSelectionEnd: end + prefix.length };
  } catch {
    return { nextText: text, nextSelectionStart: start, nextSelectionEnd: end };
  }
}

export default function MarkdownPreviewer() {
  // Toasts (used for copy notifications)
  const { pushToast } = useToast();
  // Markdown input state
  const [markdown, setMarkdown] = React.useState(SAMPLE_MD);
  const [error, setError] = React.useState("");
  const [copied, setCopied] = React.useState(false);
  const editorRef = React.useRef(null);

  React.useEffect(() => {
    // Auto-clear "Copied!" state after 2 seconds
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(t);
  }, [copied]);

  function withEditorSelection(applyFn) {
    // Helper to apply toolbar ops using the current textarea selection
    try {
      const el = editorRef.current;
      if (!el) return;

      const start = el.selectionStart ?? 0;
      const end = el.selectionEnd ?? 0;
      const { nextText, nextSelectionStart, nextSelectionEnd } = applyFn(markdown, start, end);

      setMarkdown(nextText);

      // Restore selection after state update
      window.requestAnimationFrame(() => {
        try {
          el.focus();
          el.setSelectionRange(nextSelectionStart, nextSelectionEnd);
        } catch {
          // No-op
        }
      });
    } catch {
      // No-op
    }
  }

  function insertBold() {
    withEditorSelection((t, s, e) => applyWrap(t, s, e, "**", "**"));
  }
  function insertItalic() {
    withEditorSelection((t, s, e) => applyWrap(t, s, e, "*", "*"));
  }
  function insertHeading() {
    withEditorSelection((t, s, e) => applyPrefixLine(t, s, e, "# "));
  }
  function insertLink() {
    withEditorSelection((t, s, e) => applyWrap(t, s, e, "[", "](https://)"));
  }
  function insertCode() {
    withEditorSelection((t, s, e) => applyWrap(t, s, e, "`", "`"));
  }
  function insertList() {
    withEditorSelection((t, s, e) => applyPrefixLine(t, s, e, "- "));
  }

  function loadSample() {
    // Load sample markdown for testing
    setError("");
    setCopied(false);
    try {
      setMarkdown(SAMPLE_MD);
    } catch {
      // No-op
    }
  }

  // Keyboard shortcut: Ctrl+Enter copies HTML (quick "run" action)
  React.useEffect(() => {
    function onRun() {
      try {
        copyHtml();
      } catch {
        // No-op
      }
    }
    window.addEventListener("devtoolbox:run", onRun);
    return () => window.removeEventListener("devtoolbox:run", onRun);
  }, [markdown]);

  async function copyHtml() {
    // Copy rendered HTML output to clipboard with graceful error handling
    setError("");
    try {
      const htmlText = marked.parse(markdown || "");
      if (!htmlText) {
        setError("Nothing to copy yet.");
        return;
      }
      await navigator.clipboard.writeText(String(htmlText));
      setCopied(true);
      pushToast("Copied to clipboard!");
    } catch {
      setError("Copy failed. Your browser may block clipboard access.");
    }
  }

  const html = React.useMemo(() => {
    try {
      // marked.js parsing (requested)
      return marked.parse(markdown || "");
    } catch {
      return "";
    }
  }, [markdown]);

  return (
    <div className="space-y-4">
      {/* SEO */}
      <Helmet>
        <title>Markdown Previewer — DevToolbox</title>
        <meta
          name="description"
          content="Write Markdown and preview it live. Includes a quick toolbar, sample content, and copy HTML output."
        />
      </Helmet>

      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          📝 Markdown Preview
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Write markdown on the left, preview on the right.
        </p>
      </div>

      {/* Error message */}
      {error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-200">
          {error}
        </div>
      ) : null}

      {/* Layout */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          {/* Toolbar + editor header */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Markdown
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={insertBold}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800/60"
              >
                Bold
              </button>
              <button
                type="button"
                onClick={insertItalic}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800/60"
              >
                Italic
              </button>
              <button
                type="button"
                onClick={insertHeading}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800/60"
              >
                Heading
              </button>
              <button
                type="button"
                onClick={insertLink}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800/60"
              >
                Link
              </button>
              <button
                type="button"
                onClick={insertCode}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800/60"
              >
                Code
              </button>
              <button
                type="button"
                onClick={insertList}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800/60"
              >
                List
              </button>
              <button
                type="button"
                onClick={loadSample}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800/60"
              >
                Sample
              </button>
            </div>
          </div>
          <textarea
            className="min-h-72 w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
            value={markdown}
            onChange={(e) => {
              // Safe editor updates
              try {
                setMarkdown(e.target.value);
                setCopied(false);
              } catch {
                // No-op
              }
            }}
            ref={editorRef}
          />
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Preview
            </div>
            <button
              type="button"
              onClick={copyHtml}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800/60"
            >
              {copied ? "Copied!" : "Copy HTML"}
            </button>
          </div>
          <div
            className="min-h-72 w-full rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          >
            {/* Preview rendering (marked.js) */}
            <div
              className="prose max-w-none prose-slate dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
