# DevToolbox

DevToolbox is a modern React + Vite app that bundles a set of fast, offline-friendly **developer utilities** in one place. It’s responsive, supports dark mode, and includes keyboard shortcuts for speed.

## Live demo

- **Demo**: `https://your-live-demo-link-here`

## Tools

- **🔧 JSON Formatter**: Format, validate, minify, and syntax-highlight JSON
- **🔐 Base64 Encoder/Decoder**: Encode/decode text and convert images to Base64
- **🔍 Regex Tester**: Live match highlighting, match details, and quick regex inserts
- **🔗 URL Encoder/Decoder**: encodeURI vs encodeURIComponent + query params parser
- **🎨 Color Picker & Converter**: HEX ↔ RGB/HSL + 5-shade palette generator
- **🪙 JWT Decoder**: Decode header/payload/signature and check expiry (no signature verification)
- **📝 Markdown Previewer**: Markdown editor with live preview and copy-HTML
- **📊 Word Counter**: Live stats (words/chars/sentences/paragraphs), reading time, top words

## Tech stack

- **React** + **Vite**
- **Tailwind CSS**
- **React Router**
- **react-helmet-async** for SEO metadata

## How to run locally

```bash
cd DevToolbox
npm install
npm run dev
```

Then open the URL printed in the terminal (usually `http://localhost:5173/`).

## Keyboard shortcuts

- **Ctrl+K**: Focus the sidebar tool search (opens sidebar on mobile)
- **Ctrl+Enter**: Run the current tool’s primary action (varies per tool)

## Contributing

1. Fork the repo and create a feature branch.
2. Keep code clean and readable, with solid error handling.
3. Test your changes locally.
4. Open a pull request with a clear description and screenshots (if UI changes).
