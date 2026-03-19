/** @type {import('tailwindcss').Config} */
export default {
  // DevToolbox uses class-based dark mode (we toggle `dark` on <html>)
  darkMode: "class",

  // Ensure Tailwind scans all JSX files for class names
  content: ["./index.html", "./src/**/*.{js,jsx}"],

  theme: {
    extend: {},
  },
  plugins: [],
};

