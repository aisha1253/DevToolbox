import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import "../styles/bladeRunnerLanding.css";

const HIGHLIGHTS = [
  {
    tag: "Data",
    name: "JSON & structure",
    role: "Format · validate · minify",
    desc: "Clean up API responses, config files, and logs. Validate syntax and shrink payloads before you copy them back.",
  },
  {
    tag: "Encode",
    name: "Base64 & URLs",
    role: "Move text safely",
    desc: "Encode and decode Base64, normalize query strings, and share snippets without breaking special characters.",
  },
  {
    tag: "Inspect",
    name: "JWT & Regex",
    role: "See inside strings",
    desc: "Decode JWT headers and claims, and iterate on regular expressions with immediate visual feedback.",
  },
];

function useCityParallax(containerRef) {
  React.useEffect(() => {
    function onScroll() {
      try {
        const root = containerRef.current;
        if (!root) return;
        const scrollY = window.scrollY;
        const layers = root.querySelectorAll("[data-speed]");
        layers.forEach((layer) => {
          const speed = parseFloat(layer.getAttribute("data-speed") || "0.1");
          const yPos = -(scrollY * speed);
          layer.style.transform = `translateY(${yPos}px)`;
        });
      } catch {
        // no-op
      }
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [containerRef]);
}

function useScrollReveal() {
  React.useEffect(() => {
    const els = document.querySelectorAll("[data-br-reveal]");
    if (!els.length) return undefined;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const delay = Number(el.getAttribute("data-br-delay") || 0);
          window.setTimeout(() => {
            el.classList.add("br-in-view");
          }, delay);
          io.unobserve(el);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -5% 0px" }
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

export default function BladeRunnerLanding() {
  const heroRef = React.useRef(null);
  const glitchRef = React.useRef(null);

  useCityParallax(heroRef);
  useScrollReveal();

  React.useEffect(() => {
    const el = glitchRef.current;
    if (!el) return undefined;

    function enter() {
      el.style.animation = "br-text-shadow 0.3s infinite";
    }
    function leave() {
      el.style.animation = "br-text-shadow 4s infinite";
    }

    el.addEventListener("mouseenter", enter);
    el.addEventListener("mouseleave", leave);
    return () => {
      el.removeEventListener("mouseenter", enter);
      el.removeEventListener("mouseleave", leave);
    };
  }, []);

  return (
    <div className="br-root">
      <Helmet>
        <title>DevToolbox — Developer utilities</title>
        <meta
          name="description"
          content="Fast, offline-friendly developer utilities: JSON, Base64, regex, URL tools, colors, JWT, Markdown, and more."
        />
      </Helmet>

      <div className="br-film-grain" aria-hidden="true" />
      <div className="br-scanlines" aria-hidden="true" />

      <header className="br-hero" ref={heroRef}>
        <div className="br-parallax-container" aria-hidden="true">
          <div className="br-city-layer br-city-back" data-speed="0.1" />
          <div className="br-city-layer br-city-mid" data-speed="0.3" />
          <div className="br-city-layer br-city-front" data-speed="0.5" />
          <div className="br-neon-signs">
            <span className="br-neon-sign">JSON</span>
            <span className="br-neon-sign">BASE64</span>
            <span className="br-neon-sign">REGEX</span>
            <span className="br-neon-sign">URL</span>
            <span className="br-neon-sign">JWT</span>
          </div>
        </div>

        <div className="br-hero-content">
          <p className="br-brand-tag br-hero-kicker">DevToolbox · intro</p>
          <h1 ref={glitchRef} className="br-glitch-title" data-text="DEVTOOLBOX">
            DEVTOOLBOX
          </h1>
          <p className="br-subtitle br-hero-tagline">Build faster with small utilities</p>

          <div className="br-cta-row">
            <Link to="/tools" className="br-btn-get-started">
              Get started
            </Link>
          </div>
        </div>

        <div className="br-scroll-indicator" aria-hidden="true">
          <span />
        </div>
      </header>

      <section id="highlights">
        <h2 className="br-section-title">What you will use most</h2>
        <div className="br-characters-grid">
          {HIGHLIGHTS.map((c, i) => (
            <article
              key={c.name}
              className="br-character-card br-reveal-card"
              data-br-reveal
              data-br-delay={i * 120}
            >
              <span className="br-character-movie">{c.tag}</span>
              <h3 className="br-character-name">{c.name}</h3>
              <span className="br-character-role">{c.role}</span>
              <p className="br-character-desc">{c.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="br-footer">
        <p className="br-footer-text">
          <span>DevToolbox</span> — handy utilities for everyday development.{" "}
          <Link to="/tools">Open the tool grid</Link>
        </p>
      </footer>
    </div>
  );
}
