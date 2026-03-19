import React from "react";
import { Helmet } from "react-helmet-async";
import { useToast } from "../components/ToastProvider";

function getWords(text) {
  // Extract words for counting and frequency analysis
  try {
    const matches = String(text || "").toLowerCase().match(/[a-z0-9']+/g);
    return matches ? matches.filter(Boolean) : [];
  } catch {
    return [];
  }
}

function countSentences(text) {
  // Basic sentence splitting by punctuation
  try {
    const parts = String(text || "")
      .split(/[.!?]+/g)
      .map((s) => s.trim())
      .filter(Boolean);
    return parts.length;
  } catch {
    return 0;
  }
}

function countParagraphs(text) {
  // Paragraphs are separated by one or more blank lines
  try {
    const trimmed = String(text || "").trim();
    if (!trimmed) return 0;
    return trimmed.split(/\n\s*\n/g).map((p) => p.trim()).filter(Boolean).length;
  } catch {
    return 0;
  }
}

function readingTimeMinutes(wordCount) {
  // Average reading speed: 200 words/min
  try {
    const minutes = wordCount / 200;
    if (!Number.isFinite(minutes) || minutes <= 0) return 0;
    return Math.ceil(minutes * 10) / 10; // round up to 0.1
  } catch {
    return 0;
  }
}

export default function WordCounter() {
  // Toasts (used for copy notifications)
  const { pushToast } = useToast();
  // Text state
  const [text, setText] = React.useState("");
  const [error, setError] = React.useState("");

  const stats = React.useMemo(() => {
    // Live stats computation with safe fallbacks
    try {
      const t = String(text || "");
      const wordsArr = getWords(t);

      const charsWithSpaces = t.length;
      const charsWithoutSpaces = t.replace(/\s+/g, "").length;
      const words = wordsArr.length;
      const sentences = countSentences(t);
      const paragraphs = countParagraphs(t);
      const readTime = readingTimeMinutes(words);

      // Most used words (top 5)
      const freq = new Map();
      for (const w of wordsArr) {
        freq.set(w, (freq.get(w) || 0) + 1);
      }
      const topWords = Array.from(freq.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([word, count]) => ({ word, count }));

      return {
        words,
        charsWithSpaces,
        charsWithoutSpaces,
        sentences,
        paragraphs,
        readTime,
        topWords,
      };
    } catch {
      return {
        words: 0,
        charsWithSpaces: 0,
        charsWithoutSpaces: 0,
        sentences: 0,
        paragraphs: 0,
        readTime: 0,
        topWords: [],
      };
    }
  }, [text]);

  async function copyStats() {
    // Copy stats to clipboard with graceful error handling
    setError("");
    try {
      const hasAny =
        stats.words ||
        stats.charsWithSpaces ||
        stats.charsWithoutSpaces ||
        stats.sentences ||
        stats.paragraphs;
      if (!hasAny) {
        setError("Nothing to copy yet.");
        return;
      }

      const lines = [
        `Words: ${stats.words}`,
        `Characters (with spaces): ${stats.charsWithSpaces}`,
        `Characters (without spaces): ${stats.charsWithoutSpaces}`,
        `Sentences: ${stats.sentences}`,
        `Paragraphs: ${stats.paragraphs}`,
        `Reading time (200 wpm): ${stats.readTime} min`,
        "",
        "Top words:",
        ...(stats.topWords.length
          ? stats.topWords.map((w) => `- ${w.word}: ${w.count}`)
          : ["- (none)"]),
      ];

      await navigator.clipboard.writeText(lines.join("\n"));
      pushToast("Copied to clipboard!");
    } catch {
      setError("Copy failed. Your browser may block clipboard access.");
    }
  }

  return (
    <div className="space-y-4">
      {/* SEO */}
      <Helmet>
        <title>Word Counter — DevToolbox</title>
        <meta
          name="description"
          content="Count words, characters, sentences, and paragraphs with live updates. Includes reading time, top words, and copyable stats."
        />
      </Helmet>

      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          📊 Word Counter
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Count words, characters, and lines.
        </p>
      </div>

      {/* Error message */}
      {error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-200">
          {error}
        </div>
      ) : null}

      {/* Editor */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Text
          </div>
          <button
            type="button"
            onClick={copyStats}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800/60"
          >
            Copy stats
          </button>
        </div>
        <textarea
          className="min-h-56 w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          value={text}
          onChange={(e) => {
            // Safe updates while typing
            try {
              setText(e.target.value);
            } catch {
              // No-op
            }
          }}
          placeholder="Paste or type text…"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500 dark:text-slate-400">Words</div>
          <div className="mt-1 text-2xl font-semibold">{stats.words}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Characters (with spaces)
          </div>
          <div className="mt-1 text-2xl font-semibold">
            {stats.charsWithSpaces}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Characters (without spaces)
          </div>
          <div className="mt-1 text-2xl font-semibold">
            {stats.charsWithoutSpaces}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Sentences
          </div>
          <div className="mt-1 text-2xl font-semibold">{stats.sentences}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Paragraphs
          </div>
          <div className="mt-1 text-2xl font-semibold">
            {stats.paragraphs}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Reading time
          </div>
          <div className="mt-1 text-2xl font-semibold">{stats.readTime} min</div>
        </div>
      </div>

      {/* Most used words */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Most used words (top 5)
        </div>
        {stats.topWords.length === 0 ? (
          <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            No words yet.
          </div>
        ) : (
          <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {stats.topWords.map((w) => (
              <li
                key={w.word}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950/40"
              >
                <span className="font-mono text-slate-900 dark:text-slate-100">
                  {w.word}
                </span>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {w.count}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
