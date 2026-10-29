(function () {
  "use strict";

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // 1. Header
  var header = $(".site-header");
  if (header) {
    var onScroll = function () { header.classList.toggle("is-scrolled", window.scrollY > 40); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // 2. Menu
  var toggle = $(".menu-toggle");
  var menu = $("#menu");
  function setMenu(open) {
    if (!toggle || !menu) return;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Chiudi il menu" : "Apri il menu");
    menu.setAttribute("data-open", String(open));
    document.body.classList.toggle("menu-open", open);
  }
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setMenu(false);
        toggle.focus();
      }
    });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  }

  // 3. Reveal
  var reveals = $$(".reveal");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-visible");
        io.unobserve(e.target);
      });
    }, { threshold: 0.15 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  // 5. Form (before 4, which reuses its change handler)
  var form = $("#richiesta");
  var sel = form && $("select[name=occasione]", form);
  var festaWrap = form && $(".field--festa", form);
  var festa = form && $("input[name=festa]", form);
  var note = form && $(".form-note", form);

  function syncFesta() {
    if (!sel) return;
    var on = sel.value === "Altra occasione";
    if (festaWrap) festaWrap.hidden = !on;
    if (festa) festa.required = on;
  }
  function val(name) {
    var el = $("[name=" + name + "]", form);
    return el ? el.value.trim() : "";
  }
  function fail(text, field) {
    if (note) note.textContent = text;
    if (field) {
      field.setAttribute("aria-invalid", "true");
      field.focus();
    }
  }

  if (form) {
    if (sel) { sel.addEventListener("change", syncFesta); syncFesta(); }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var nome = $("input[name=nome]", form);
      var showFesta = !!festa && !(festaWrap && festaWrap.hidden);
      if (nome) nome.setAttribute("aria-invalid", "false");
      if (festa) festa.setAttribute("aria-invalid", "false");

      if (nome && !nome.value.trim()) return fail("Scrivi il tuo nome per continuare.", nome);
      if (showFesta && !festa.value.trim()) return fail("Scrivi il nome della festa per continuare.", festa);

      var righe = ["Buongiorno, vorrei richiedere informazioni per un evento.", ""];
      righe.push("Nome: " + val("nome"));
      if (val("telefono")) righe.push("Telefono: " + val("telefono"));
      if (val("occasione")) righe.push("Occasione: " + val("occasione"));
      if (showFesta) righe.push("Nome della festa: " + festa.value.trim());
      var d = val("data");
      if (d) {
        var p = d.split("-");
        righe.push("Data indicativa: " + (p.length === 3 ? p[2] + "/" + p[1] + "/" + p[0] : d));
      }
      if (val("ospiti")) righe.push("Ospiti: " + val("ospiti"));
      if (val("messaggio")) righe.push("Messaggio: " + val("messaggio"));

      window.open("https://wa.me/393397071801?text=" + encodeURIComponent(righe.join("\n")), "_blank", "noopener");
      if (note) note.textContent = "Si è aperto WhatsApp: invia il messaggio per completare la richiesta.";
    });
  }

  // 4. Links with data-occasione preselect the form
  $$("[data-occasione]").forEach(function (a) {
    a.addEventListener("click", function () {
      if (!sel) return;
      var want = a.getAttribute("data-occasione").toLowerCase();
      var opt = $$("option", sel).filter(function (o) {
        return o.value.toLowerCase() === want || o.textContent.trim().toLowerCase() === want;
      })[0];
      if (!opt) return;
      sel.value = opt.value;
      sel.dispatchEvent(new Event("change"));
    });
  });
})();
