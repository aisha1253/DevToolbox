import React from "react";
import { Helmet } from "react-helmet-async";
import { useToast } from "../components/ToastProvider";

function normalizeHex(input) {
  // Normalize hex values to #RRGGBB (supports #RGB and RRGGBB)
  try {
    let v = String(input || "").trim();
    if (!v) return "";
    if (!v.startsWith("#")) v = `#${v}`;
    const hex = v.slice(1);

    if (/^[0-9a-fA-F]{3}$/.test(hex)) {
      const r = hex[0];
      const g = hex[1];
      const b = hex[2];
      return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
    }

    if (/^[0-9a-fA-F]{6}$/.test(hex)) {
      return `#${hex}`.toUpperCase();
    }

    return "";
  } catch {
    return "";
  }
}

function hexToRgb(hex) {
  // Convert #RRGGBB to { r, g, b }
  const v = normalizeHex(hex);
  if (!v) return null;
  const n = parseInt(v.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return { r, g, b };
}

function rgbToHsl({ r, g, b }) {
  // Convert RGB (0-255) to HSL (h 0-360, s/l 0-100)
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;

  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case rn:
        h = ((gn - bn) / d) % 6;
        break;
      case gn:
        h = (bn - rn) / d + 2;
        break;
      default:
        h = (rn - gn) / d + 4;
        break;
    }
    h *= 60;
    if (h < 0) h += 360;
  }

  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function rgbToHex({ r, g, b }) {
  // Convert RGB to #RRGGBB
  const to2 = (x) => clamp(Math.round(x), 0, 255).toString(16).padStart(2, "0");
  return `#${to2(r)}${to2(g)}${to2(b)}`.toUpperCase();
}

function mix(c1, c2, t) {
  // Linear mix between two RGB colors
  return {
    r: c1.r + (c2.r - c1.r) * t,
    g: c1.g + (c2.g - c1.g) * t,
    b: c1.b + (c2.b - c1.b) * t,
  };
}

function generatePalette(hex) {
  // Generate 5 shades from base color by mixing with white/black
  // Shade order: lighter -> base -> darker
  const base = hexToRgb(hex);
  if (!base) return [];

  const white = { r: 255, g: 255, b: 255 };
  const black = { r: 0, g: 0, b: 0 };

  const lighter2 = rgbToHex(mix(base, white, 0.6));
  const lighter1 = rgbToHex(mix(base, white, 0.3));
  const baseHex = rgbToHex(base);
  const darker1 = rgbToHex(mix(base, black, 0.25));
  const darker2 = rgbToHex(mix(base, black, 0.5));

  return [lighter2, lighter1, baseHex, darker1, darker2];
}

export default function ColorPicker() {
  // Toasts (used for copy notifications)
  const { pushToast } = useToast();
  // HEX input state (user-editable)
  const [hexInput, setHexInput] = React.useState("#4F46E5");

  // Error state
  const [error, setError] = React.useState("");

  // Derived color values (computed safely)
  const normalizedHex = React.useMemo(() => normalizeHex(hexInput), [hexInput]);
  const rgb = React.useMemo(() => {
    try {
      return normalizedHex ? hexToRgb(normalizedHex) : null;
    } catch {
      return null;
    }
  }, [normalizedHex]);

  const hsl = React.useMemo(() => {
    try {
      return rgb ? rgbToHsl(rgb) : null;
    } catch {
      return null;
    }
  }, [rgb]);

  const palette = React.useMemo(() => {
    try {
      return normalizedHex ? generatePalette(normalizedHex) : [];
    } catch {
      return [];
    }
  }, [normalizedHex]);

  // Validate hex input and show an error if invalid
  React.useEffect(() => {
    try {
      if (!hexInput.trim()) {
        setError("");
        return;
      }
      if (!normalizedHex) {
        setError("Invalid HEX color. Use #RGB or #RRGGBB.");
      } else {
        setError("");
      }
    } catch {
      setError("Invalid HEX color. Use #RGB or #RRGGBB.");
    }
  }, [hexInput, normalizedHex]);

  async function copyText(value) {
    // Copy helper with solid error handling
    setError("");
    try {
      if (!value) {
        setError("Nothing to copy yet.");
        return;
      }
      await navigator.clipboard.writeText(String(value));
      pushToast("Copied to clipboard!");
    } catch {
      setError("Copy failed. Your browser may block clipboard access.");
    }
  }

  return (
    <div className="space-y-4">
      {/* SEO */}
      <Helmet>
        <title>Color Picker & Converter — DevToolbox</title>
        <meta
          name="description"
          content="Convert HEX to RGB and HSL, preview colors, click-to-copy formats, and generate a 5-shade palette from a base color."
        />
      </Helmet>

      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          🎨 Color Picker
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Convert HEX to RGB/HSL and generate quick palettes.
        </p>
      </div>

      {/* Error message */}
      {error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-200">
          {error}
        </div>
      ) : null}

      {/* Converter section */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Left: inputs + preview */}
        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          {/* HEX input */}
          <div className="space-y-2">
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              HEX
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                value={hexInput}
                onChange={(e) => {
                  // Keep updates safe and predictable
                  try {
                    setHexInput(e.target.value);
                  } catch {
                    // No-op
                  }
                }}
                className="w-full max-w-xs rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-100"
                placeholder="#4F46E5"
              />

              {/* Visual picker (syncs normalized value when valid) */}
              <input
                type="color"
                value={normalizedHex || "#000000"}
                onChange={(e) => {
                  try {
                    setHexInput(e.target.value.toUpperCase());
                  } catch {
                    // No-op
                  }
                }}
                className="h-10 w-10 cursor-pointer rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900"
                aria-label="Color picker"
              />

              <button
                type="button"
                onClick={() => copyText(normalizedHex)}
                className="dt-btn rounded-lg px-4 py-2 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
              >
                Copy HEX
              </button>
            </div>
          </div>

          {/* Preview box */}
          <div className="space-y-2">
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Preview
            </div>
            <div
              className="h-20 w-full rounded-xl border border-slate-200 dark:border-slate-800"
              style={{ backgroundColor: normalizedHex || "transparent" }}
            />
          </div>
        </div>

        {/* Right: values + copy swatches */}
        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Values (click to copy)
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {/* HEX swatch */}
            <button
              type="button"
              onClick={() => copyText(normalizedHex)}
              className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:shadow-sm dark:border-slate-800 dark:bg-slate-950/40"
            >
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                HEX
              </div>
              <div className="mt-1 font-mono text-sm text-slate-900 dark:text-slate-100">
                {normalizedHex || "—"}
              </div>
            </button>

            {/* RGB swatch */}
            <button
              type="button"
              onClick={() =>
                copyText(rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : "")
              }
              className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:shadow-sm dark:border-slate-800 dark:bg-slate-950/40"
            >
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                RGB
              </div>
              <div className="mt-1 font-mono text-sm text-slate-900 dark:text-slate-100">
                {rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : "—"}
              </div>
            </button>

            {/* HSL swatch */}
            <button
              type="button"
              onClick={() =>
                copyText(hsl ? `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` : "")
              }
              className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:shadow-sm dark:border-slate-800 dark:bg-slate-950/40"
            >
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                HSL
              </div>
              <div className="mt-1 font-mono text-sm text-slate-900 dark:text-slate-100">
                {hsl ? `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` : "—"}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Palette generator */}
      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Palette (5 shades)
            </div>
            <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">
              Generated from the base color.
            </div>
          </div>
          <button
            type="button"
            onClick={() => copyText(palette.join(", "))}
            className="dt-btn rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
          >
            Copy palette
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {palette.length === 0 ? (
            <div className="col-span-2 text-sm text-slate-600 dark:text-slate-300 sm:col-span-5">
              Enter a valid HEX color to generate shades.
            </div>
          ) : (
            palette.map((hex) => (
              <button
                key={hex}
                type="button"
                onClick={() => copyText(hex)}
                className="group rounded-xl border border-slate-200 bg-slate-50 p-2 text-left transition hover:shadow-sm dark:border-slate-800 dark:bg-slate-950/40"
                title="Click to copy"
              >
                <div
                  className="h-12 w-full rounded-lg border border-slate-200 dark:border-slate-800"
                  style={{ backgroundColor: hex }}
                />
                <div className="mt-2 font-mono text-xs text-slate-700 dark:text-slate-200">
                  {hex}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
