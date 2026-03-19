import React from "react";
import Sidebar from "./Sidebar";
import ToastProvider from "./ToastProvider";
import { Link } from "react-router-dom";

const THEME_STORAGE_KEY = "devtoolbox-theme"; // "dark" | "light"

function getInitialTheme() {
  // Safely read persisted preference, otherwise fall back to OS preference
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "dark" || stored === "light") return stored;
  } catch {
    // localStorage may be blocked (privacy mode, browser policy, etc.)
  }

  try {
    const prefersDark =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
    return prefersDark ? "dark" : "light";
  } catch {
    return "light";
  }
}

function applyThemeToDocument(theme) {
  // Tailwind dark mode via the `dark` class on <html>
  try {
    document.documentElement.classList.toggle("dark", theme === "dark");
  } catch {
    // If document is unavailable for some reason, ignore to avoid crashing UI
  }
}

export default function Layout({ children }) {
  // Theme state
  const [theme, setTheme] = React.useState(getInitialTheme);

  // Mobile sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  // Keyboard shortcuts
  // - Ctrl+K: focus sidebar search (and open sidebar on mobile)
  // - Ctrl+Enter: run current tool (tools listen for this custom event)
  React.useEffect(() => {
    function onKeyDown(e) {
      try {
        const isCtrlOrCmd = e.ctrlKey || e.metaKey;

        // Ctrl+K focuses sidebar search
        if (isCtrlOrCmd && (e.key === "k" || e.key === "K")) {
          e.preventDefault();

          // Ensure sidebar is visible on mobile
          setIsSidebarOpen(true);

          // Focus search input (works for desktop + mobile drawer)
          window.setTimeout(() => {
            try {
              const el = document.getElementById("sidebar-search");
              el?.focus?.();
            } catch {
              // No-op
            }
          }, 0);

          return;
        }

        // Ctrl+Enter triggers "run" for current tool
        if (isCtrlOrCmd && e.key === "Enter") {
          e.preventDefault();
          window.dispatchEvent(new CustomEvent("devtoolbox:run"));
        }
      } catch {
        // No-op
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Apply theme and persist preference (useLayoutEffect avoids visible flicker)
  React.useLayoutEffect(() => {
    applyThemeToDocument(theme);

    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Persisting is best-effort; ignore failures gracefully
    }
  }, [theme]);

  function toggleTheme() {
    try {
      setTheme((t) => (t === "dark" ? "light" : "dark"));
    } catch {
      // setState shouldn't fail, but keep the UI resilient
    }
  }

  function closeSidebar() {
    setIsSidebarOpen(false);
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Desktop sidebar (fixed, 250px wide) */}
      <div className="fixed inset-y-0 left-0 hidden w-[250px] border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 md:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay + drawer */}
      {isSidebarOpen ? (
        <div className="fixed inset-0 z-40 md:hidden" aria-hidden="true">
          {/* Backdrop */}
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={closeSidebar}
            aria-label="Close sidebar"
          />

          {/* Drawer */}
          <div className="absolute inset-y-0 left-0 w-[250px] bg-white shadow-xl dark:bg-slate-900">
            <Sidebar onNavigate={closeSidebar} />
          </div>
        </div>
      ) : null}

      {/* Main content area (offset by sidebar width on desktop) */}
      <div className="md:pl-[250px]">
        {/* Header with hamburger + dark mode toggle */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
            {/* Left: hamburger (mobile) + page title */}
            <div className="flex min-w-0 items-center gap-2">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800/60 dark:focus-visible:ring-offset-slate-900 md:hidden"
                onClick={() => setIsSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                <span aria-hidden="true">☰</span>
              </button>

              <Link
                to="/"
                className="min-w-0 rounded-lg px-2 py-1 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:hover:bg-slate-800/40 dark:focus-visible:ring-offset-slate-900"
                aria-label="Go to home"
                onClick={() => setIsSidebarOpen(false)}
              >
                <div className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                  DevToolbox
                </div>
                <div className="truncate text-xs text-slate-500 dark:text-slate-400">
                  Build faster with small utilities
                </div>
              </Link>
            </div>

            {/* Right: theme toggle */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800/60 dark:focus-visible:ring-offset-slate-900"
                onClick={toggleTheme}
              >
                <span className="text-base" aria-hidden="true">
                  {theme === "dark" ? "🌙" : "☀️"}
                </span>
                <span className="hidden sm:inline">
                  {theme === "dark" ? "Dark" : "Light"} mode
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Content container */}
        <main className="mx-auto w-full max-w-6xl px-4 py-6">
          {children}
        </main>
      </div>
      </div>
    </ToastProvider>
  );
}
