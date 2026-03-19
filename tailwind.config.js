/** @type {import('tailwindcss').Config} */
export default {
  // DevToolbox uses class-based dark mode (we toggle `dark` on <html>)
  darkMode: "class",

  // Ensure Tailwind scans all JSX files for class names
  content: ["./index.html", "./src/**/*.{js,jsx}"],

  theme: {
    extend: {
      // Brand palette (requested): #17252A #2B7A78 #3AAFA9 #DEF2F1 #FEFFFF
      colors: {
        brand: {
          900: "#17252A",
          700: "#2B7A78",
          500: "#3AAFA9",
          100: "#DEF2F1",
          50: "#FEFFFF",
        },
      },
    },
  },
  plugins: [],
};

