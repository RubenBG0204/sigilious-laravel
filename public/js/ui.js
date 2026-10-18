// UI helpers
export function initMenu() {
  const toggle = document.getElementById("menuToggle");
  const links = document.getElementById("navLinks");
  if (!toggle || !links) return;
  toggle.addEventListener("click", () => links.classList.toggle("open"));
}


export function initLoader() {
  const loader = document.getElementById("loader");
  if (!loader) return;
  window.addEventListener("load", () => {
    setTimeout(() => loader.style.display = "none", 600);
  });
}

export function initScrollReveal() {
  const elements = document.querySelectorAll(".section, .card, .product-card, .slide");
  elements.forEach((el) => el.classList.add("reveal"));
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  }, { threshold: 0.15 });
  elements.forEach((el) => observer.observe(el));
}

export function initPageTransitions() {
  document.querySelectorAll("a").forEach((link) => {
    if (link.target === "_blank" || link.href.startsWith("#")) return;
    link.addEventListener("click", (e) => {
      const url = new URL(link.href);
      if (url.origin !== window.location.origin) return;
      e.preventDefault();
      document.body.classList.add("fade-out");
      setTimeout(() => (window.location.href = link.href), 300);
    });
  });
}

export function initTiltEffects() {
  const targets = document.querySelectorAll(
    ".product-card, .category-card, .slide, .newsletter-card, .card"
  );
  targets.forEach((el) => {
    el.classList.add("tilt");
    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      const intensity = el.dataset.tilt === "low" ? 2 : 4;
      const rotateX = (-y * intensity).toFixed(2);
      const rotateY = (x * intensity).toFixed(2);
      el.style.transform = `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    el.addEventListener("mouseleave", () => {
      el.style.transform = "";
    });
  });
}

export function initParallax() {
  const targets = document.querySelectorAll("[data-parallax]");
  if (!targets.length || window.matchMedia("(hover: none)").matches) return;
  const strength = 12;
  const onMove = (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    targets.forEach((el) => {
      el.style.transform = `translate3d(${x * strength}px, ${y * strength}px, 0)`;
    });
  };
  const onLeave = () => {
    targets.forEach((el) => {
      el.style.transform = "";
    });
  };
  window.addEventListener("mousemove", onMove);
  window.addEventListener("mouseleave", onLeave);
}

export function initBackToTop() {
  const btn = document.getElementById("backToTop");
  if (!btn) return;
  const toggle = () => {
    if (window.scrollY > 300) btn.classList.add("show");
    else btn.classList.remove("show");
  };
  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  window.addEventListener("scroll", toggle);
  toggle();
}
