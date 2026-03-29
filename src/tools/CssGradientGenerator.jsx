import React from "react";
import { Helmet } from "react-helmet-async";
import { useToast } from "../components/ToastProvider";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

/** Returns #rrggbb or fallback */
function normalizeHex(hex, fallback) {
  try {
    let h = String(hex || "").trim();
    if (!h.startsWith("#")) h = `#${h}`;
    h = h.slice(1);
    if (h.length === 3) {
      h = h
        .split("")
        .map((c) => c + c)
        .join("");
    }
    if (!/^[0-9a-fA-F]{6}$/.test(h)) return fallback;
    return `#${h.toLowerCase()}`;
  } catch {
    return fallback;
  }
}

function SliderRow({ label, value, min, max, step, suffix = "", onChange }) {
  const display =
    step < 1
      ? parseFloat(Number(value).toFixed(2))
      : Math.round(value);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="font-medium text-slate-800 dark:text-slate-100">
          {label}
        </span>
        <span className="tabular-nums text-slate-600 dark:text-slate-300">
          {display}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer accent-[#36555c] dark:accent-[#5ec4be]"
      />
    </div>
  );
}

function ColorField({ label, value, onChange, fallback = "#3aafa9" }) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-slate-800 dark:text-slate-100">
        {label}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="color"
          value={normalizeHex(value, fallback)}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-14 cursor-pointer rounded border border-slate-300 bg-[#ffffff] p-0 dark:border-slate-500 dark:bg-[#1a2228]"
          aria-label={label}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-w-[7rem] rounded-lg border border-slate-200 bg-[#f8fafc] px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-[#3aafa9] dark:border-slate-500/50 dark:bg-[rgba(15,23,42,0.65)] dark:text-slate-100"
          placeholder={fallback}
          spellCheck={false}
        />
      </div>
    </div>
  );
}

export default function CssGradientGenerator() {
  const { pushToast } = useToast();

  const [mode, setMode] = React.useState("linear");
  const [colorStart, setColorStart] = React.useState("#3aafa9");
  const [colorEnd, setColorEnd] = React.useState("#2b7a78");
  const [angle, setAngle] = React.useState(135);
  const [copyLabel, setCopyLabel] = React.useState("Copy CSS");

  const c1 = React.useMemo(
    () => normalizeHex(colorStart, "#3aafa9"),
    [colorStart]
  );
  const c2 = React.useMemo(() => normalizeHex(colorEnd, "#2b7a78"), [colorEnd]);

  const gradientValue = React.useMemo(() => {
    if (mode === "radial") {
      return `radial-gradient(circle, ${c1}, ${c2})`;
    }
    const a = clamp(Math.round(angle), 0, 360);
    return `linear-gradient(${a}deg, ${c1}, ${c2})`;
  }, [mode, c1, c2, angle]);

  const cssOutput = React.useMemo(
    () => `background-image: ${gradientValue};`,
    [gradientValue]
  );

  async function copyCss() {
    try {
      await navigator.clipboard.writeText(cssOutput);
      setCopyLabel("Copied!");
      pushToast("Copied!");
      window.setTimeout(() => setCopyLabel("Copy CSS"), 1600);
    } catch {
      pushToast("Copy failed.");
    }
  }

  const toggleBtn = (active) =>
    [
      "rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3aafa9] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#263d42]",
      active
        ? "dt-btn"
        : "border border-slate-200 bg-[#f8fafc] text-slate-800 hover:bg-slate-100 dark:border-slate-500/40 dark:bg-[rgba(15,23,42,0.5)] dark:text-slate-200 dark:hover:bg-[rgba(15,23,42,0.75)]",
    ].join(" ");

  return (
    <div className="space-y-4 text-slate-900 dark:text-slate-100">
      <Helmet>
        <title>CSS Gradient Generator — DevToolbox</title>
        <meta
          name="description"
          content="Create linear or radial CSS gradients with two colors, angle control, live preview, and copyable background-image code."
        />
      </Helmet>

      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          CSS Gradient Generator
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Choose linear or radial, pick two colors, then copy the CSS.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <div className="space-y-4 rounded-xl border border-slate-200 bg-[#ffffff] p-4 shadow-sm dark:border-slate-500/35 dark:bg-[rgba(20,30,34,0.92)] dark:shadow-none">
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            Controls
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-800 dark:text-slate-100">
              Gradient type
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={toggleBtn(mode === "linear")}
                onClick={() => setMode("linear")}
              >
                Linear
              </button>
              <button
                type="button"
                className={toggleBtn(mode === "radial")}
                onClick={() => setMode("radial")}
              >
                Radial
              </button>
            </div>
          </div>

          <ColorField
            label="Start color"
            value={colorStart}
            onChange={setColorStart}
            fallback="#3aafa9"
          />
          <ColorField
            label="End color"
            value={colorEnd}
            onChange={setColorEnd}
            fallback="#2b7a78"
          />

          {mode === "linear" ? (
            <SliderRow
              label="Angle"
              suffix="°"
              value={angle}
              min={0}
              max={360}
              step={1}
              onChange={(v) => setAngle(clamp(v, 0, 360))}
            />
          ) : null}
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-[#ffffff] p-4 shadow-sm dark:border-slate-500/35 dark:bg-[rgba(20,30,34,0.92)] dark:shadow-none">
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              Live preview
            </div>
            <div
              className="mt-4 min-h-[220px] rounded-lg border border-slate-200/80 dark:border-slate-500/30"
              style={{ backgroundImage: gradientValue }}
              aria-hidden="true"
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-[#ffffff] p-4 shadow-sm dark:border-slate-500/35 dark:bg-[rgba(20,30,34,0.92)] dark:shadow-none">
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                CSS output
              </div>
              <button
                type="button"
                onClick={copyCss}
                className="dt-btn rounded-lg px-3 py-1.5 text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3aafa9] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#263d42]"
              >
                {copyLabel}
              </button>
            </div>
            <pre className="mt-3 overflow-x-auto rounded-lg border border-slate-200 bg-[#f1f5f9] p-3 font-mono text-xs text-slate-900 dark:border-slate-600/50 dark:bg-[rgba(8,12,16,0.95)] dark:text-[#e2e8f0]">
              <code>{cssOutput}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
