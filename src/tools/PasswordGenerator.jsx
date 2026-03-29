import React from "react";
import { Helmet } from "react-helmet-async";
import { useToast } from "../components/ToastProvider";

const CHARSET_UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const CHARSET_LOWER = "abcdefghijklmnopqrstuvwxyz";
const CHARSET_NUM = "0123456789";
const CHARSET_SYM = "!@#$%^&*()_+-=[]{}|;:,.<>?";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

/** Uniform index in [0, max) using crypto.getRandomValues */
function randomInt(max) {
  if (max <= 0) return 0;
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] % max;
}

function randomChar(pool) {
  return pool[randomInt(pool.length)];
}

function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    const t = arr[i];
    arr[i] = arr[j];
    arr[j] = t;
  }
}

function generatePassword(length, opts) {
  const pools = [];
  if (opts.upper) pools.push(CHARSET_UPPER);
  if (opts.lower) pools.push(CHARSET_LOWER);
  if (opts.num) pools.push(CHARSET_NUM);
  if (opts.sym) pools.push(CHARSET_SYM);
  if (pools.length === 0) return "";

  const full = pools.join("");
  const guaranteed = Math.min(length, pools.length);
  const chars = [];
  for (let i = 0; i < guaranteed; i++) {
    chars.push(randomChar(pools[i]));
  }
  for (let i = guaranteed; i < length; i++) {
    chars.push(randomChar(full));
  }
  shuffleInPlace(chars);
  return chars.join("");
}

/** Weak / medium / strong — length + number of character classes */
function getStrength(password, opts) {
  const len = password.length;
  const types = [opts.upper, opts.lower, opts.num, opts.sym].filter(Boolean).length;
  if (len === 0) return "weak";
  if (len < 10 || types <= 1) return "weak";
  if (types >= 4 && len >= 14) return "strong";
  if (types >= 3 && len >= 16) return "strong";
  if (types >= 3 && len >= 12) return "medium";
  if (types >= 2 && len >= 18) return "strong";
  if (types >= 2 && len >= 12) return "medium";
  return "weak";
}

/** Same footprint as dt-btn; background reflects strength level */
function strengthBadgeClass(level) {
  switch (level) {
    case "strong":
      return "border border-emerald-700/40 bg-emerald-600 text-white shadow-sm dark:border-emerald-400/30 dark:bg-emerald-600 dark:text-white";
    case "medium":
      return "border border-amber-600/40 bg-amber-500 text-white shadow-sm dark:border-amber-400/30 dark:bg-amber-500 dark:text-white";
    default:
      return "border border-rose-700/40 bg-rose-600 text-white shadow-sm dark:border-rose-400/30 dark:bg-rose-600 dark:text-white";
  }
}

export default function PasswordGenerator() {
  const { pushToast } = useToast();

  const [length, setLength] = React.useState(16);
  const [upper, setUpper] = React.useState(true);
  const [lower, setLower] = React.useState(true);
  const [num, setNum] = React.useState(true);
  const [sym, setSym] = React.useState(true);
  const [password, setPassword] = React.useState("");
  const [copyLabel, setCopyLabel] = React.useState("Copy");

  const opts = React.useMemo(
    () => ({ upper, lower, num, sym }),
    [upper, lower, num, sym]
  );

  const regenerate = React.useCallback(() => {
    try {
      const pwd = generatePassword(clamp(length, 8, 64), opts);
      setPassword(pwd);
    } catch {
      setPassword("");
    }
  }, [length, opts]);

  React.useLayoutEffect(() => {
    regenerate();
  }, [regenerate]);

  const strength = React.useMemo(
    () => getStrength(password, opts),
    [password, opts]
  );

  const strengthLabel =
    strength === "strong" ? "Strong" : strength === "medium" ? "Medium" : "Weak";

  async function copyPassword() {
    if (!password) {
      pushToast("Nothing to copy — enable at least one character type.");
      return;
    }
    try {
      await navigator.clipboard.writeText(password);
      setCopyLabel("Copied!");
      pushToast("Copied!");
      window.setTimeout(() => setCopyLabel("Copy"), 1600);
    } catch {
      pushToast("Copy failed.");
    }
  }

  const panel =
    "rounded-xl border border-slate-200 bg-[#ffffff] p-4 shadow-sm dark:border-slate-500/35 dark:bg-[rgba(20,30,34,0.92)] dark:shadow-none";

  const checkboxRow = (id, label, checked, onChange) => (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200/90 px-3 py-2.5 dark:border-slate-600/40"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 rounded border-slate-300 text-[#36555c] focus:ring-[#3aafa9] dark:border-slate-500 dark:bg-[rgba(15,23,42,0.5)]"
      />
      <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
        {label}
      </span>
    </label>
  );

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      <Helmet>
        <title>Password Generator — DevToolbox</title>
        <meta
          name="description"
          content="Generate secure random passwords with adjustable length, character sets, strength indicator, copy and regenerate."
        />
      </Helmet>

      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          Password Generator
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Choose length and character types. Password updates automatically; use Regenerate for a new one.
        </p>
      </div>

      <div className={`${panel} space-y-4`}>
        <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">
          Length
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2 text-sm">
            <span className="font-medium text-slate-800 dark:text-slate-100">
              Characters
            </span>
            <span className="tabular-nums text-slate-600 dark:text-slate-300">
              {length}
            </span>
          </div>
          <input
            type="range"
            min={8}
            max={64}
            step={1}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="h-2 w-full cursor-pointer accent-[#36555c] dark:accent-[#5ec4be]"
          />
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>8</span>
            <span>64</span>
          </div>
        </div>
      </div>

      <div className={`${panel} space-y-3`}>
        <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">
          Character sets
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {checkboxRow("pw-upper", "Uppercase (A–Z)", upper, setUpper)}
          {checkboxRow("pw-lower", "Lowercase (a–z)", lower, setLower)}
          {checkboxRow("pw-num", "Numbers (0–9)", num, setNum)}
          {checkboxRow("pw-sym", "Symbols", sym, setSym)}
        </div>
        {!upper && !lower && !num && !sym ? (
          <p className="text-sm text-rose-700 dark:text-rose-300" role="status">
            Select at least one set to generate a password.
          </p>
        ) : null}
      </div>

      <div className={`${panel} space-y-4`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            Password
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={regenerate}
              className="dt-btn rounded-lg px-3 py-1.5 text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3aafa9] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#263d42]"
            >
              Regenerate
            </button>
            <button
              type="button"
              onClick={copyPassword}
              className="dt-btn rounded-lg px-3 py-1.5 text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3aafa9] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#263d42]"
            >
              {copyLabel}
            </button>
          </div>
        </div>

        <div
          className="min-h-[7.5rem] break-all rounded-lg border border-slate-200 bg-[#f8fafc] p-4 font-mono text-xl font-medium leading-relaxed tracking-wide text-slate-900 dark:border-slate-600/50 dark:bg-[rgba(8,12,16,0.85)] dark:text-slate-100"
          aria-live="polite"
        >
          {password || "—"}
        </div>

        <span
          className={`inline-flex cursor-default items-center rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors duration-200 ${strengthBadgeClass(strength)}`}
          role="status"
        >
          Strength: {strengthLabel}
        </span>
      </div>
    </div>
  );
}
