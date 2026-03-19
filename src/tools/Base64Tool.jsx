import React from "react";
import { Helmet } from "react-helmet-async";
import { useToast } from "../components/ToastProvider";

function normalizeBase64Input(value) {
  // Remove whitespace/newlines that users often paste with Base64
  return String(value || "").replace(/\s+/g, "");
}

function looksLikeBase64(value) {
  // Heuristic (not perfect): base64 alphabet, optional padding
  // Also accept base64 data URLs by stripping prefix.
  try {
    const raw = String(value || "").trim();
    if (!raw) return false;

    const cleaned = raw.startsWith("data:")
      ? raw.slice(raw.indexOf(",") + 1)
      : raw;

    const s = normalizeBase64Input(cleaned);
    if (s.length < 8) return false;
    if (s.length % 4 !== 0) return false;
    return /^[A-Za-z0-9+/]*={0,2}$/.test(s);
  } catch {
    return false;
  }
}

function encodeTextToBase64(text) {
  // UTF-8 safe base64 encoding
  const bytes = new TextEncoder().encode(String(text));
  let bin = "";
  for (let i = 0; i < bytes.length; i += 1) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function decodeBase64ToText(base64) {
  // UTF-8 safe base64 decoding
  const bin = atob(normalizeBase64Input(base64));
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export default function Base64Tool() {
  // Toasts (used for copy notifications)
  const { pushToast } = useToast();
  // Mode tabs: "text" or "image"
  const [mode, setMode] = React.useState("text");

  // Text mode state
  const [textInput, setTextInput] = React.useState("");
  const [textOutput, setTextOutput] = React.useState("");
  const [textError, setTextError] = React.useState("");
  const [isWorking, setIsWorking] = React.useState(false);

  // Auto-detect when the input looks like Base64 to emphasize "Decode"
  const autoLooksBase64 = React.useMemo(() => {
    try {
      return looksLikeBase64(textInput);
    } catch {
      return false;
    }
  }, [textInput]);

  // Keyboard shortcut: Ctrl+Enter runs Encode/Decode in Text mode
  React.useEffect(() => {
    function onRun() {
      try {
        if (mode !== "text") return;
        if (autoLooksBase64) decodeText();
        else encodeText();
      } catch {
        // No-op
      }
    }
    window.addEventListener("devtoolbox:run", onRun);
    return () => window.removeEventListener("devtoolbox:run", onRun);
  }, [mode, autoLooksBase64, textInput]);

  // Image mode state
  const [imageError, setImageError] = React.useState("");
  const [imageDataUrl, setImageDataUrl] = React.useState("");
  const [imageBase64, setImageBase64] = React.useState("");
  const [imageInfo, setImageInfo] = React.useState(null); // { name, sizeBytes, width, height, type }

  function clearText() {
    // Clear text mode inputs/outputs
    try {
      setTextInput("");
      setTextOutput("");
      setTextError("");
    } catch {
      // No-op
    }
  }

  function encodeText() {
    // Encode text -> Base64 (try/catch around operations)
    setIsWorking(true);
    setTextError("");
    try {
      const encoded = encodeTextToBase64(textInput);
      setTextOutput(encoded);
    } catch {
      setTextOutput("");
      setTextError("Encoding failed. Please try again.");
    } finally {
      setIsWorking(false);
    }
  }

  function decodeText() {
    // Decode Base64 -> text (try/catch around operations)
    setIsWorking(true);
    setTextError("");

    try {
      const raw = textInput.trim();
      const cleaned = raw.startsWith("data:")
        ? raw.slice(raw.indexOf(",") + 1)
        : raw;

      const decoded = decodeBase64ToText(cleaned);
      setTextOutput(decoded);
    } catch (e) {
      setTextOutput("");
      setTextError("Invalid Base64 string");
    } finally {
      setIsWorking(false);
    }
  }

  async function copyTextOutput() {
    // Copy output to clipboard with graceful error handling
    setTextError("");
    try {
      if (!textOutput) {
        setTextError("Nothing to copy yet.");
        return;
      }
      await navigator.clipboard.writeText(textOutput);
      pushToast("Copied to clipboard!");
    } catch {
      setTextError("Copy failed. Your browser may block clipboard access.");
    }
  }

  function clearImage() {
    // Clear image mode state
    try {
      setImageError("");
      setImageDataUrl("");
      setImageBase64("");
      setImageInfo(null);
    } catch {
      // No-op
    }
  }

  function loadImageFile(file) {
    // Read the image file -> data URL, extract Base64, and compute dimensions
    setImageError("");
    try {
      if (!file) return;
      if (!file.type?.startsWith("image/")) {
        setImageError("Please upload a valid image file (jpg, png, gif, webp).");
        return;
      }

      const reader = new FileReader();
      reader.onerror = () => {
        setImageError("Failed to read file. Please try again.");
      };
      reader.onload = () => {
        try {
          const dataUrl = String(reader.result || "");
          setImageDataUrl(dataUrl);

          const comma = dataUrl.indexOf(",");
          const b64 = comma >= 0 ? dataUrl.slice(comma + 1) : "";
          setImageBase64(b64);

          const img = new Image();
          img.onload = () => {
            try {
              setImageInfo({
                name: file.name,
                sizeBytes: file.size,
                width: img.naturalWidth,
                height: img.naturalHeight,
                type: file.type,
              });
            } catch {
              // No-op
            }
          };
          img.onerror = () => {
            setImageError("Could not load image preview.");
          };
          img.src = dataUrl;
        } catch {
          setImageError("Failed to process image. Please try again.");
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setImageError("Unexpected error while loading image.");
    }
  }

  async function copyImageBase64() {
    // Copy image Base64 to clipboard with graceful error handling
    setImageError("");
    try {
      if (!imageBase64) {
        setImageError("Nothing to copy yet.");
        return;
      }
      await navigator.clipboard.writeText(imageBase64);
      pushToast("Copied to clipboard!");
    } catch {
      setImageError("Copy failed. Your browser may block clipboard access.");
    }
  }

  return (
    <div className="space-y-4">
      {/* SEO */}
      <Helmet>
        <title>Base64 Encoder/Decoder — DevToolbox</title>
        <meta
          name="description"
          content="Encode and decode Base64 text, or convert images to Base64 with preview, dimensions, and one-click copy."
        />
      </Helmet>

      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          🔐 Base64 Encoder
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Encode/decode text or convert images to Base64.
        </p>
      </div>

      {/* Mode tabs */}
      <div className="flex w-full max-w-md rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
        <button
          type="button"
          onClick={() => setMode("text")}
          className={[
            "flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition",
            mode === "text"
              ? "bg-brand-500 text-white"
              : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/60",
          ].join(" ")}
        >
          Text
        </button>
        <button
          type="button"
          onClick={() => setMode("image")}
          className={[
            "flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition",
            mode === "image"
              ? "bg-brand-500 text-white"
              : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/60",
          ].join(" ")}
        >
          Image
        </button>
      </div>

      {/* TEXT MODE */}
      {mode === "text" ? (
        <div className="space-y-4">
          {/* Error message */}
          {textError ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-200">
              {textError}
            </div>
          ) : null}

          {/* Two panel layout */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Input
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {textInput.length.toLocaleString()} chars
                </div>
              </div>
              <textarea
                className="min-h-44 w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                value={textInput}
                onChange={(e) => {
                  // Keep state updates safe and predictable
                  try {
                    setTextInput(e.target.value);
                  } catch {
                    // No-op
                  }
                }}
                placeholder="Type text or paste Base64…"
              />
            </div>

            {/* Output */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Output
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {textOutput.length.toLocaleString()} chars
                </div>
              </div>
              <textarea
                className="min-h-44 w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-100"
                value={textOutput}
                readOnly
                placeholder="Result will appear here…"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={encodeText}
              disabled={isWorking}
              className="dt-btn rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
            >
              {isWorking ? "Working…" : "Encode"}
            </button>
            <button
              type="button"
              onClick={decodeText}
              disabled={isWorking}
              className={[
                "dt-btn rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-60",
                autoLooksBase64 ? "ring-2 ring-brand-500/40" : "",
              ].join(" ")}
            >
              {isWorking ? "Working…" : "Decode"}
            </button>
            <button
              type="button"
              onClick={copyTextOutput}
              className="dt-btn rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
            >
              Copy output
            </button>
            <button
              type="button"
              onClick={clearText}
              className="dt-btn rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
            >
              Clear
            </button>
          </div>
        </div>
      ) : null}

      {/* IMAGE MODE */}
      {mode === "image" ? (
        <div className="space-y-4">
          {/* Error message */}
          {imageError ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-200">
              {imageError}
            </div>
          ) : null}

          {/* Upload section */}
          <div className="flex flex-wrap items-center gap-2">
            <label className="dt-btn inline-flex cursor-pointer items-center justify-center rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900">
              Upload image
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
                onChange={(e) => {
                  try {
                    const file = e.target.files?.[0];
                    loadImageFile(file);
                  } catch {
                    setImageError("Could not read selected file.");
                  }
                }}
              />
            </label>
            <button
              type="button"
              onClick={clearImage}
              className="dt-btn rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
            >
              Clear
            </button>
          </div>

          {/* Preview + info */}
          {imageDataUrl ? (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Preview
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                  <img
                    src={imageDataUrl}
                    alt="Uploaded preview"
                    className="max-h-64 w-full rounded-lg object-contain"
                  />
                </div>

                {imageInfo ? (
                  <div className="text-xs text-slate-600 dark:text-slate-300">
                    <div>
                      <span className="font-semibold">Name:</span> {imageInfo.name}
                    </div>
                    <div>
                      <span className="font-semibold">Type:</span> {imageInfo.type}
                    </div>
                    <div>
                      <span className="font-semibold">Size:</span>{" "}
                      {(imageInfo.sizeBytes / 1024).toFixed(1)} KB
                    </div>
                    <div>
                      <span className="font-semibold">Dimensions:</span>{" "}
                      {imageInfo.width}×{imageInfo.height}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Base64
                  </div>
                  <button
                    type="button"
                    onClick={copyImageBase64}
                    className="dt-btn rounded-lg px-3 py-1.5 text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
                  >
                    Copy Base64
                  </button>
                </div>
                <textarea
                  className="min-h-64 w-full rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-900 outline-none dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-100"
                  value={imageBase64}
                  readOnly
                  placeholder="Base64 will appear here…"
                />
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
              Upload an image to preview it and get the Base64 string.
            </div>
          )}
        </div>
      ) : null}

    </div>
  );
}

