import React from "react";
import { Helmet } from "react-helmet-async";
import { useToast } from "../components/ToastProvider";

function safeBase64UrlDecode(str) {
  // Base64URL -> Base64 -> UTF-8
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    "="
  );
  const bin = atob(padded);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function formatJsonSafe(value) {
  // Format JSON safely with try/catch to avoid UI crashes
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "";
  }
}

function formatExpiry(expSeconds) {
  // Return { label, expired, deltaLabel }
  try {
    if (!Number.isFinite(expSeconds)) return null;

    const expMs = expSeconds * 1000;
    const expDate = new Date(expMs);
    const now = Date.now();
    const diffMs = expMs - now;

    const absDays = Math.floor(Math.abs(diffMs) / (1000 * 60 * 60 * 24));
    const absHours = Math.floor(
      (Math.abs(diffMs) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );

    const dateStr = expDate.toLocaleString();

    if (diffMs >= 0) {
      return {
        expired: false,
        label: `Expires on ${dateStr}`,
        deltaLabel:
          absDays > 0
            ? `in ${absDays} day(s)`
            : absHours > 0
              ? `in ${absHours} hour(s)`
              : "soon",
      };
    }

    return {
      expired: true,
      label: `EXPIRED ${absDays} day(s) ago`,
      deltaLabel: `Expired on ${dateStr}`,
    };
  } catch {
    return null;
  }
}

export default function JwtDecoder() {
  // Toasts (used for copy notifications)
  const { pushToast } = useToast();
  // Token + decoded output
  const [token, setToken] = React.useState("");
  const [error, setError] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  // Decoded sections
  const [header, setHeader] = React.useState(null);
  const [payload, setPayload] = React.useState(null);
  const [signature, setSignature] = React.useState("");
  const [expiryInfo, setExpiryInfo] = React.useState(null);

  function decode() {
    // Decode header/payload/signature with try/catch for user-friendly errors
    setError("");
    setCopied(false);
    try {
      const parts = token.trim().split(".");
      if (parts.length !== 3) {
        throw new Error("Invalid JWT format");
      }

      const headerJson = safeBase64UrlDecode(parts[0]);
      const payloadJson = safeBase64UrlDecode(parts[1]);
      const sig = parts[2] || "";

      const headerObj = JSON.parse(headerJson);
      const payloadObj = JSON.parse(payloadJson);

      setHeader(headerObj);
      setPayload(payloadObj);
      setSignature(sig);

      // Expiry check (exp is in seconds since epoch)
      const exp = payloadObj?.exp;
      const info = Number.isFinite(exp) ? formatExpiry(Number(exp)) : null;
      setExpiryInfo(info);

      // NOTE: We explicitly do NOT verify signature (tool requirement)
    } catch (e) {
      setHeader(null);
      setPayload(null);
      setSignature("");
      setExpiryInfo(null);

      const message = e?.message ? String(e.message) : "Invalid JWT format";
      setError(message.startsWith("Invalid JWT format") ? "Invalid JWT format" : message);
    }
  }

  // Keyboard shortcut: Ctrl+Enter runs Decode
  React.useEffect(() => {
    function onRun() {
      try {
        decode();
      } catch {
        // No-op
      }
    }
    window.addEventListener("devtoolbox:run", onRun);
    return () => window.removeEventListener("devtoolbox:run", onRun);
  }, [token]);

  React.useEffect(() => {
    // Auto-clear "Copied!" state after 2 seconds
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(t);
  }, [copied]);

  async function copyAll() {
    // Copy decoded sections to clipboard with graceful error handling
    setError("");
    try {
      if (!header && !payload && !signature) {
        setError("Nothing to copy yet. Decode a token first.");
        return;
      }

      const text = [
        "Header:",
        formatJsonSafe(header),
        "",
        "Payload:",
        formatJsonSafe(payload),
        "",
        "Signature:",
        signature || "",
      ].join("\n");

      await navigator.clipboard.writeText(text);
      setCopied(true);
      pushToast("Copied to clipboard!");
    } catch {
      setError("Copy failed. Your browser may block clipboard access.");
    }
  }

  return (
    <div className="space-y-4">
      {/* SEO */}
      <Helmet>
        <title>JWT Decoder — DevToolbox</title>
        <meta
          name="description"
          content="Decode JWT header, payload, and signature without verifying the signature. Includes expiry detection and copy-to-clipboard."
        />
      </Helmet>

      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          🪙 JWT Decoder
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Decode JWT header, payload, and signature. This tool does{" "}
          <span className="font-semibold">not</span> verify the signature.
        </p>
      </div>

      {/* Expiry badge */}
      {expiryInfo ? (
        <div
          className={[
            "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold",
            expiryInfo.expired
              ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-200"
              : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-200",
          ].join(" ")}
        >
          <span aria-hidden="true">{expiryInfo.expired ? "⚠️" : "⏳"}</span>
          <span>{expiryInfo.label}</span>
          <span className="text-xs opacity-80">({expiryInfo.deltaLabel})</span>
        </div>
      ) : null}

      {/* Error message */}
      {error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-200">
          {error}
        </div>
      ) : null}

      {/* Token input */}
      <div className="space-y-2">
        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Token
        </div>
        <textarea
          className="min-h-28 w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          value={token}
          onChange={(e) => {
            // Keep updates safe and predictable
            try {
              setToken(e.target.value);
            } catch {
              // No-op
            }
          }}
          placeholder="paste.jwt.token.here"
        />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={decode}
          className="dt-btn rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
        >
          Decode
        </button>
        <button
          type="button"
          onClick={copyAll}
          className="dt-btn rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Output sections */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Header */}
        <div className="space-y-2">
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Header
          </div>
          <textarea
            className="min-h-56 w-full rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-900 outline-none dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-100"
            value={header ? formatJsonSafe(header) : ""}
            readOnly
            placeholder="Decoded header JSON…"
          />
        </div>

        {/* Payload */}
        <div className="space-y-2">
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Payload
          </div>
          <textarea
            className="min-h-56 w-full rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-900 outline-none dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-100"
            value={payload ? formatJsonSafe(payload) : ""}
            readOnly
            placeholder="Decoded payload JSON…"
          />
        </div>

        {/* Signature */}
        <div className="space-y-2">
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Signature
          </div>
          <textarea
            className="min-h-56 w-full rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-900 outline-none dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-100"
            value={signature}
            readOnly
            placeholder="Raw signature (not verified)…"
          />
        </div>
      </div>
    </div>
  );
}
