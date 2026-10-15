(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var y = $("#year");
  if (y) y.textContent = new Date().getFullYear();

  // Sfondo fisso: la foto cambia con la sezione che attraversa il centro dello schermo
  var bgs = $$(".bg img");
  var cur = 0;
  function setBg(i) {
    if (i === cur || !bgs[i]) return;
    bgs[cur].classList.remove("on");
    bgs[i].classList.add("on");
    cur = i;
  }

  // Eventi: selettore con anteprima (click, focus e hover)
  var evs = $$(".ev");
  var now = $("#ev-now");
  var desc = $(".ev-desc");
  var views = $$(".ev-view img");
  var tipo = $("#req-tipo");
  function pick(i, fromUser) {
    evs.forEach(function (b, k) {
      var on = k === i;
      b.classList.toggle("on", on);
      b.setAttribute("aria-pressed", on);
      if (views[k]) views[k].classList.toggle("on", on);
      if (!on) return;
      if (now) now.textContent = "0" + (k + 1);
      if (desc) {
        var t = b.querySelector(".ev-more");
        desc.textContent = t ? t.textContent : "";
        desc.style.animation = "none"; void desc.offsetWidth; desc.style.animation = "";
      }
      // il tipo scelto passa al modulo di richiesta
      if (fromUser && tipo && b.dataset.tipo) tipo.value = b.dataset.tipo;
    });
  }
  if (evs.length) pick(0, false);
  evs.forEach(function (b, k) {
    b.addEventListener("click", function () { pick(k, true); });
    b.addEventListener("focus", function () { pick(k, true); });
    b.addEventListener("mouseenter", function () { pick(k, false); });
  });

  // Ambienti: un pannello aperto alla volta (hover, focus o tap)
  var items = $$(".item");
  function open(it) { items.forEach(function (x) { x.classList.toggle("on", x === it); }); }
  items.forEach(function (it) {
    ["mouseenter", "focus", "click"].forEach(function (ev) { it.addEventListener(ev, function () { open(it); }); });
  });

  // Navbar: vetro più denso dopo la hero + barra di avanzamento
  var nav = $(".nav");
  var bar = $(".progress");
  var ticking = false;
  function onScroll() {
    ticking = false;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (nav) nav.classList.toggle("scrolled", window.scrollY > 40);
    if (bar && max > 0) bar.style.setProperty("--p", Math.min(1, window.scrollY / max));
  }
  onScroll();
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });

  // Menu mobile
  var burger = $(".burger");
  var menu = $("#menu");
  function setMenu(openIt) {
    if (!burger || !menu) return;
    menu.classList.toggle("open", openIt);
    burger.setAttribute("aria-expanded", openIt);
    burger.setAttribute("aria-label", openIt ? "Chiudi il menu" : "Apri il menu");
  }
  if (burger) {
    burger.addEventListener("click", function () { setMenu(!menu.classList.contains("open")); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
  }

  // Spotlight: l'alone segue il puntatore (solo mouse)
  $$(".spot").forEach(function (el) {
    el.addEventListener("pointermove", function (e) {
      if (e.pointerType !== "mouse") return;
      var r = el.getBoundingClientRect();
      el.style.setProperty("--mx", (e.clientX - r.left) + "px");
      el.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });

  // Modulo richiesta evento: apre WhatsApp con il messaggio già scritto
  var form = $("#req");
  if (form) {
    var msg = $(".form-msg", form);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var f = form.elements;
      var nome = f.nome.value.trim();
      f.nome.setAttribute("aria-invalid", nome ? "false" : "true");
      if (!nome) { msg.textContent = "Scrivi il tuo nome per continuare."; f.nome.focus(); return; }
      var righe = ["Buongiorno, sono " + nome + "."];
      righe.push("Vorrei informazioni per: " + f.tipo.value + ".");
      if (f.data.value) {
        var p = f.data.value.split("-");
        righe.push("Data indicativa: " + p[2] + "/" + p[1] + "/" + p[0] + ".");
      }
      if (f.ospiti.value) righe.push("Ospiti: circa " + f.ospiti.value + ".");
      if (f.note.value.trim()) righe.push("Note: " + f.note.value.trim());
      msg.textContent = "Si apre WhatsApp: premi invia per mandarci la richiesta.";
      window.open("https://wa.me/393397071801?text=" + encodeURIComponent(righe.join("\n")), "_blank", "noopener");
    });
  }

  if (!("IntersectionObserver" in window)) return;

  var bgIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) setBg(parseInt(e.target.getAttribute("data-bg"), 10));
    });
  }, { rootMargin: "-45% 0px -45% 0px" });
  $$("[data-bg]").forEach(function (s) { bgIO.observe(s); });

  // Navbar: voce attiva in base alla sezione al centro dello schermo
  var links = $$(".nav-links a");
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
  $$("#spazi, #eventi, #cucina, #richiesta, #contatti").forEach(function (s) { spy.observe(s); });

  // Reveal allo scroll (disattivato con reduced motion)
  if (reduce) return;
  document.documentElement.classList.add("js");

  // Titoli e frasi: ogni parola entra con una breve cascata, quando il blocco e' a vista
  var split = function (node, counter) {
    Array.prototype.slice.call(node.childNodes).forEach(function (c) {
      if (c.nodeType === 3) {
        var frag = document.createDocumentFragment();
        c.nodeValue.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
          var w = document.createElement("span");
          w.className = "w"; w.style.setProperty("--i", counter.n++); w.textContent = part;
          frag.appendChild(w);
        });
        node.replaceChild(frag, c);
      } else if (c.nodeType === 1) split(c, counter);
    });
  };
  var wordsIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      wordsIO.unobserve(e.target);
    });
  }, { threshold: 0.6 });
  $$(".hero-sub, .intro-text, .head h2, .events h2, .cucina h2, .req-intro h2, .contact-card h2").forEach(function (el) {
    var label = el.textContent;
    el.classList.add("words");
    el.setAttribute("aria-label", label.replace(/\s+/g, " ").trim());
    split(el, { n: 0 });
    $$(".w", el).forEach(function (w) { w.setAttribute("aria-hidden", "true"); });
    wordsIO.observe(el);
  });

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      io.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  $$(".reveal").forEach(function (el) { io.observe(el); });
})();
