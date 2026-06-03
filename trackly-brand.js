/**
 * Shared Trackly marketing + auth utilities
 */
(function () {
  const THEME_KEY = "trackly-theme";

  function prefersDark() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function applyTheme(theme) {
    const isLight = theme === "light";
    document.documentElement.classList.toggle("light", isLight);
    document.documentElement.classList.toggle("dark", !isLight);
    document.documentElement.style.colorScheme = isLight ? "light" : "dark";
    document.querySelectorAll("[data-theme-label]").forEach((btn) => {
      btn.textContent = isLight ? "Dark" : "Light";
    });
  }

  function applyDirection() {
    document.documentElement.setAttribute("dir", "ltr");
    document.documentElement.lang = "en";
    localStorage.removeItem("trackly-direction");
  }

  function initTheme() {
    const stored = localStorage.getItem(THEME_KEY);
    applyTheme(stored || (prefersDark() ? "dark" : "light"));
    document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const next = document.documentElement.classList.contains("light")
          ? "dark"
          : "light";
        localStorage.setItem(THEME_KEY, next);
        applyTheme(next);
      });
    });
  }

  function initNavScroll() {
    const nav = document.querySelector("[data-trackly-nav]");
    if (!nav) return;
    const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 32);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function initReveal() {
    const nodes = document.querySelectorAll(".reveal");
    if (!nodes.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -48px 0px" }
    );
    nodes.forEach((el) => observer.observe(el));
  }

  function isViteDev() {
    return window.location.port === "5173";
  }

  function getDashboardUrl() {
    const params = new URLSearchParams(window.location.search);
    if (params.get("classic") === "1") return "trackly_dashboard.html";
    return window.location.origin + "/app/";
  }

  function getAppPreviewUrl() {
    return window.location.origin + "/app/";
  }

  window.TracklyBrand = {
    applyTheme,
    applyDirection,
    initTheme,
    initDirection: applyDirection,
    initNavScroll,
    initReveal,
    getDashboardUrl,
    getAppPreviewUrl,
    routes: {
      home: "index.html",
      auth: "auth_fixed.html",
      signIn: "auth_fixed.html",
      signUp: "auth_fixed.html?tab=signup",
    },
  };

  document.addEventListener("DOMContentLoaded", () => {
    applyDirection();
    initTheme();
    initNavScroll();
    initReveal();
    const preview = document.querySelector("[data-app-preview]");
    if (preview) preview.setAttribute("href", getAppPreviewUrl());
  });
})();