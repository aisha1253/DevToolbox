import React from "react";
import { Helmet } from "react-helmet-async";
import { useToast } from "../components/ToastProvider";

function hexToRgb(hex) {
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
    if (!/^[0-9a-fA-F]{6}$/.test(h)) return { r: 0, g: 0, b: 0 };
    const n = parseInt(h, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  } catch {
    return { r: 0, g: 0, b: 0 };
  }
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function formatAlpha(a) {
  const x = Number(a);
  if (!Number.isFinite(x)) return "0";
  return String(parseFloat(x.toFixed(3)));
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

export default function CssShadowGenerator() {
  const { pushToast } = useToast();

  const [offsetX, setOffsetX] = React.useState(4);
  const [offsetY, setOffsetY] = React.useState(4);
  const [blur, setBlur] = React.useState(10);
  const [spread, setSpread] = React.useState(0);
  const [opacity, setOpacity] = React.useState(0.3);
  const [color, setColor] = React.useState("#000000");
  const [copyLabel, setCopyLabel] = React.useState("Copy CSS");

  const { r, g, b } = React.useMemo(() => hexToRgb(color), [color]);

  const boxShadowValue = React.useMemo(() => {
    const a = formatAlpha(opacity);
    return `${offsetX}px ${offsetY}px ${blur}px ${spread}px rgba(${r},${g},${b},${a})`;
  }, [offsetX, offsetY, blur, spread, r, g, b, opacity]);

  const cssOutput = React.useMemo(
    () => `box-shadow: ${boxShadowValue};`,
    [boxShadowValue]
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

  return (
    <div className="space-y-4 text-slate-900 dark:text-slate-100">
      <Helmet>
        <title>CSS Box Shadow Generator — DevToolbox</title>
        <meta
          name="description"
          content="Build box-shadow values with live preview: offset, blur, spread, color, and opacity. Copy ready-to-paste CSS."
        />
      </Helmet>

      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          CSS Box Shadow Generator
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Adjust sliders and color, preview on the card, then copy the CSS.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <div className="space-y-4 rounded-xl border border-slate-200 bg-[#ffffff] p-4 shadow-sm dark:border-slate-500/35 dark:bg-[rgba(20,30,34,0.92)] dark:shadow-none">
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            Controls
          </div>

          <SliderRow
            label="Horizontal offset"
            suffix="px"
            value={offsetX}
            min={-50}
            max={50}
            step={1}
            onChange={(v) => setOffsetX(clamp(v, -50, 50))}
          />
          <SliderRow
            label="Vertical offset"
            suffix="px"
            value={offsetY}
            min={-50}
            max={50}
            step={1}
            onChange={(v) => setOffsetY(clamp(v, -50, 50))}
          />
          <SliderRow
            label="Blur"
            suffix="px"
            value={blur}
            min={0}
            max={100}
            step={1}
            onChange={(v) => setBlur(clamp(v, 0, 100))}
          />
          <SliderRow
            label="Spread"
            suffix="px"
            value={spread}
            min={-20}
            max={20}
            step={1}
            onChange={(v) => setSpread(clamp(v, -20, 20))}
          />
          <SliderRow
            label="Opacity"
            value={opacity}
            min={0}
            max={1}
            step={0.01}
            onChange={(v) => setOpacity(clamp(v, 0, 1))}
          />

          <div className="space-y-2 pt-1">
            <div className="text-sm font-medium text-slate-800 dark:text-slate-100">
              Shadow color
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-10 w-14 cursor-pointer rounded border border-slate-300 bg-[#ffffff] p-0 dark:border-slate-500 dark:bg-[#1a2228]"
                aria-label="Shadow color"
              />
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="min-w-[7rem] rounded-lg border border-slate-200 bg-[#f8fafc] px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-[#3aafa9] dark:border-slate-500/50 dark:bg-[rgba(15,23,42,0.65)] dark:text-slate-100"
                placeholder="#000000"
                spellCheck={false}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-[#ffffff] p-4 shadow-sm dark:border-slate-500/35 dark:bg-[rgba(20,30,34,0.92)] dark:shadow-none">
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              Live preview
            </div>
            <div
              className="mt-4 flex min-h-[220px] items-center justify-center rounded-lg bg-[#e8ecf0] p-8 dark:bg-[#0a1014] dark:ring-1 dark:ring-white/10"
              aria-hidden="true"
            >
              <div
                className="h-28 w-44 rounded-xl border border-slate-300/90 bg-[#ffffff] dark:border-slate-400/25 dark:bg-[#eef2f6]"
                style={{ boxShadow: boxShadowValue }}
              />
            </div>
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
