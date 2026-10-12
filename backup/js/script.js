(function () {
  "use strict";

  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  // Sfondo fisso: la foto cambia con la sezione che attraversa il centro dello schermo
  var bgs = document.querySelectorAll(".bg img");
  var cur = 0;
  function setBg(i) {
    if (i === cur || !bgs[i]) return;
    bgs[cur].classList.remove("on");
    bgs[i].classList.add("on");
    cur = i;
  }

  // Eventi: selettore con anteprima (click, focus e hover)
  var evs = document.querySelectorAll(".ev");
  var now = document.getElementById("ev-now");
  var desc = document.querySelector(".ev-desc");
  var views = document.querySelectorAll(".ev-view img");
  function pick(i) {
    evs.forEach(function (b, k) {
      var on = k === i;
      b.classList.toggle("on", on);
      b.setAttribute("aria-pressed", on);
      if (views[k]) views[k].classList.toggle("on", on);
      if (on && now) now.textContent = "0" + (k + 1);
      if (on && desc) {
        var t = b.querySelector(".ev-more");
        desc.textContent = t ? t.textContent : "";
        desc.style.animation = "none"; void desc.offsetWidth; desc.style.animation = "";
      }
    });
  }
  if (evs.length) pick(0);
  evs.forEach(function (b, k) {
    b.addEventListener("click", function () { pick(k); });
    b.addEventListener("focus", function () { pick(k); });
    b.addEventListener("mouseenter", function () { pick(k); });
  });

  // Ambienti: un pannello aperto alla volta (hover, focus o tap)
  var items = document.querySelectorAll(".item");
  function open(it) { items.forEach(function (x) { x.classList.toggle("on", x === it); }); }
  items.forEach(function (it) {
    ["mouseenter", "focus", "click"].forEach(function (ev) { it.addEventListener(ev, function () { open(it); }); });
  });

  // Navbar: vetro più denso dopo la hero
  var nav = document.querySelector(".nav");
  function onScroll() { if (nav) nav.classList.toggle("scrolled", window.scrollY > 40); }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if (!("IntersectionObserver" in window)) return;

  var sections = document.querySelectorAll("[data-bg]");
  var bgIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) setBg(parseInt(e.target.getAttribute("data-bg"), 10));
    });
  }, { rootMargin: "-45% 0px -45% 0px" });
  sections.forEach(function (s) { bgIO.observe(s); });

  // Navbar: voce attiva in base alla sezione al centro dello schermo
  var links = document.querySelectorAll(".nav-links a");
  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      links.forEach(function (a) {
        var on = a.getAttribute("href") === "#" + e.target.id;
        a.classList.toggle("on", on);
        if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
      });
    });
  }, { rootMargin: "-45% 0px -45% 0px" });
  document.querySelectorAll("#spazi, #eventi, #cucina, #contatti").forEach(function (s) { spy.observe(s); });

  // Reveal allo scroll (disattivato con reduced motion)
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  document.documentElement.classList.add("js");
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      io.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
})();
