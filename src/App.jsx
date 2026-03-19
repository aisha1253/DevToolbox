import React from "react";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Layout from "./components/Layout";

// Lazy-load pages/tools to keep initial bundle small
const Home = React.lazy(() => import("./pages/Home"));
const JsonFormatter = React.lazy(() => import("./tools/JsonFormatter"));
const Base64Tool = React.lazy(() => import("./tools/Base64Tool"));
const RegexTester = React.lazy(() => import("./tools/RegexTester"));
const UrlEncoderDecoder = React.lazy(() => import("./tools/UrlEncoderDecoder"));
const ColorPicker = React.lazy(() => import("./tools/ColorPicker"));
const JwtDecoder = React.lazy(() => import("./tools/JwtDecoder"));
const MarkdownPreviewer = React.lazy(() => import("./tools/MarkdownPreviewer"));
const WordCounter = React.lazy(() => import("./tools/WordCounter"));

function LoadingScreen() {
  // Small, friendly loading state for lazy-loaded routes
  return (
    <div className="grid min-h-[40vh] place-items-center">
      <div className="text-center">
        <div className="text-2xl" aria-hidden="true">
          ⏳
        </div>
        <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Loading tool…
        </div>
      </div>
    </div>
  );
}

function NotFound() {
  // Custom 404 page with a funny dev message
  return (
    <div className="mx-auto max-w-xl rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
        404 — Tool Not Found
      </div>
      <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        Looks like this route failed its unit tests. Try turning it off and on again.
      </div>
      <div className="mt-4">
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}

function withLayout(element) {
  // Wrap every route in the shared Layout (sidebar + header + dark mode)
  return <Layout>{element}</Layout>;
}

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        {/* Suspense boundary for all lazy-loaded routes */}
        <React.Suspense fallback={withLayout(<LoadingScreen />)}>
          <Routes>
            {/* Home */}
            <Route path="/" element={withLayout(<Home />)} />

            {/* Tools */}
            <Route
              path="/tools/json-formatter"
              element={withLayout(<JsonFormatter />)}
            />
            <Route path="/tools/base64" element={withLayout(<Base64Tool />)} />
            <Route path="/tools/regex" element={withLayout(<RegexTester />)} />
            <Route
              path="/tools/url-encoder"
              element={withLayout(<UrlEncoderDecoder />)}
            />
            <Route
              path="/tools/color-picker"
              element={withLayout(<ColorPicker />)}
            />
            <Route
              path="/tools/jwt-decoder"
              element={withLayout(<JwtDecoder />)}
            />
            <Route
              path="/tools/markdown"
              element={withLayout(<MarkdownPreviewer />)}
            />
            <Route
              path="/tools/word-counter"
              element={withLayout(<WordCounter />)}
            />

            {/* 404 */}
            <Route path="*" element={withLayout(<NotFound />)} />
          </Routes>
        </React.Suspense>
      </BrowserRouter>
    </HelmetProvider>
  );
}
