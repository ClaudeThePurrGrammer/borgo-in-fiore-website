(function () {
  "use strict";

  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  if (!("IntersectionObserver" in window)) return;

  // Spazi: la voce della colonna fissa segue l'immagine in vista
  var links = document.querySelectorAll(".names a");
  var spaces = document.querySelectorAll(".space");
  var spIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var i = parseInt(e.target.getAttribute("data-i"), 10);
      links.forEach(function (a, k) { a.classList.toggle("on", k === i); });
    });
  }, { rootMargin: "-40% 0px -50% 0px" });
  spaces.forEach(function (s) { spIO.observe(s); });

  // Intestazione: ombra sottile dopo la hero
  var head = document.getElementById("head");
  var hero = document.querySelector(".hero");
  if (head && hero) {
    new IntersectionObserver(function (e) {
      head.classList.toggle("solid", e[0].intersectionRatio < 0.97);
    }, { threshold: [0.97] }).observe(hero);
  }

  // Reveal (disattivato con reduced motion)
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  document.documentElement.classList.add("js");
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      io.unobserve(e.target);
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
  document.querySelectorAll(".rv, .reveal-img").forEach(function (el) {
    var p = el.parentElement;
    var i = p ? Array.prototype.indexOf.call(p.children, el) : 0;
    el.style.transitionDelay = Math.min(i, 4) * 110 + "ms";
    io.observe(el);
  });
})();
