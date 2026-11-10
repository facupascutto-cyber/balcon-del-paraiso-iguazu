/* Balcón del Paraíso Iguazú — main.js (IIFE, sin módulos) */
(function () {
  "use strict";
  var root = document.documentElement;
  root.classList.remove("no-js");

  var B = window.__BRAND__ || {};
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  var lang = "es";

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function safe(fn, name) { try { fn(); } catch (e) { console.warn("[" + name + "] falló:", e); } }

  /* ---------- Splash (CSS también lo oculta a los 4,5 s) ---------- */
  var heroStarted = false;
  function startHero() {
    if (heroStarted) return; heroStarted = true;
    root.classList.add("is-ready");
    setTimeout(function () { safe(initCountUp, "countUp"); }, 900);
  }
  function initSplash() {
    var s = $("[data-splash]");
    var hide = function () { if (s) s.classList.add("is-out"); startHero(); };
    if (document.readyState === "complete") setTimeout(hide, 500);
    else window.addEventListener("load", function () { setTimeout(hide, 350); });
    setTimeout(hide, 3800);
  }

  /* ---------- Nav ---------- */
  function initNav() {
    var nav = $("[data-nav]"), wa = $(".wa-float");
    var onScroll = function () {
      var y = window.scrollY;
      nav.classList.toggle("is-solid", y > 40);
      if (wa) wa.classList.toggle("is-on", y > window.innerHeight * 0.7);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // Sección activa en el menú
    var links = $$(".nav__links a");
    if (!("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) {
          if (a.getAttribute("href") === "#" + e.target.id) a.setAttribute("aria-current", "true");
          else a.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    links.forEach(function (a) { var t = $(a.getAttribute("href")); if (t) io.observe(t); });
  }

  function initMenu() {
    var btn = $("[data-burger]"), menu = $("[data-menu]");
    if (!btn || !menu) return;
    var open = false, timer;
    function set(next) {
      open = next;
      clearTimeout(timer);
      btn.setAttribute("aria-expanded", String(open));
      btn.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
      document.body.classList.toggle("menu-open", open);
      if (open) { menu.hidden = false; requestAnimationFrame(function () { menu.classList.add("is-open"); }); }
      else { menu.classList.remove("is-open"); timer = setTimeout(function () { menu.hidden = true; }, 700); }
    }
    btn.addEventListener("click", function () { set(!open); });
    menu.addEventListener("click", function (e) { if (e.target.closest("a")) set(false); });
    document.addEventListener("keydown", function (e) { if (open && e.key === "Escape") { set(false); btn.focus(); } });
  }

  /* ---------- Apariciones (umbral bajo + red de seguridad a los 6 s) ---------- */
  function initReveals() {
    var els = $$(".reveal");
    var show = function (el) { el.classList.add("is-visible"); };
    if (!("IntersectionObserver" in window)) { els.forEach(show); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.01, rootMargin: "0px 0px -6% 0px" });
    els.forEach(function (el) { io.observe(el); });
    setTimeout(function () {
      $$(".reveal:not(.is-visible)").forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) show(el); });
    }, 6000);
  }

  /* ---------- Contadores ---------- */
  function initCountUp() {
    $$("[data-count-to]").forEach(function (el) {
      var to = parseFloat(el.getAttribute("data-count-to"));
      if (!(to > 2)) return;
      var t0 = performance.now(), dur = 1400;
      (function tick(now) {
        var k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        el.textContent = Math.round(to * e);
        if (k < 1) requestAnimationFrame(tick); else el.textContent = to;
      })(t0);
    });
  }

  /* ---------- Cabañas: inclinación 3D (máx. 6°) + halo ---------- */
  function initTilt() {
    if (!finePointer) return;
    $$("[data-tilt]").forEach(function (card) {
      var raf = null, tx = 0, ty = 0;
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        card.style.setProperty("--hx", (px * 100) + "%");
        card.style.setProperty("--hy", (py * 100) + "%");
        tx = (px - 0.5) * 6; ty = (0.5 - py) * 6;
        if (!raf) raf = requestAnimationFrame(function () {
          card.style.transform = "perspective(1100px) rotateY(" + tx + "deg) rotateX(" + ty + "deg)";
          raf = null;
        });
      });
      card.addEventListener("mouseleave", function () { card.style.transform = ""; });
    });
  }

  /* ---------- Firma: "Un día acá" ---------- */
  function initDay() {
    var day = $("[data-day]"), rail = $("[data-day-rail]"), bar = $("[data-day-bar]");
    if (!day || !rail) return;
    var panels = $$(".day__panel", day);
    var colors = panels.map(function (p) { return p.getAttribute("data-bg"); });
    var current = -1;
    function setTone(i) {
      i = Math.max(0, Math.min(colors.length - 1, i));
      if (i === current) return;
      current = i;
      day.style.backgroundColor = colors[i];
    }
    setTone(0);

    var canPin = window.gsap && window.ScrollTrigger;
    if (canPin) {
      gsap.registerPlugin(ScrollTrigger);
      var mm = gsap.matchMedia();
      mm.add("(min-width: 901px)", function () {
        day.classList.add("is-pinned");
        var dist = function () { return Math.max(0, rail.scrollWidth - window.innerWidth); };
        var tween = gsap.to(rail, {
          x: function () { return -dist(); },
          ease: "none",
          scrollTrigger: {
            trigger: day,
            pin: ".day__pin",
            start: "top top",
            end: function () { return "+=" + dist(); },
            scrub: 0.6,
            invalidateOnRefresh: true,
            onUpdate: function (st) {
              if (bar) bar.style.transform = "scaleX(" + st.progress + ")";
              setTone(Math.floor(st.progress * colors.length * 0.999 + 0.15));
            }
          }
        });
        return function () { day.classList.remove("is-pinned"); tween.kill(); rail.style.transform = ""; };
      });
    }

    // Celular (o sin GSAP): el color cambia según el panel visible
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (es) {
        if (day.classList.contains("is-pinned")) return;
        es.forEach(function (e) { if (e.isIntersecting) setTone(panels.indexOf(e.target)); });
      }, { rootMargin: "-45% 0px -45% 0px" });
      panels.forEach(function (p) { io.observe(p); });
    }
  }

  /* ---------- Parallax suave de la portada ---------- */
  function initHeroParallax() {
    if (reduced || !window.gsap || !window.ScrollTrigger) return;
    gsap.to("[data-hero-bg]", { yPercent: 10, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  }

  /* ---------- El predio: la foto cambia con cada ítem ---------- */
  function initGrounds() {
    var img = $("[data-grounds-img]"), items = $$(".grounds__item");
    if (!img || !items.length) return;
    // precarga
    items.forEach(function (b) { var i = new Image(); i.src = b.getAttribute("data-img"); });
    var timer;
    function pick(btn) {
      if (btn.classList.contains("is-active")) return;
      items.forEach(function (b) { var on = b === btn; b.classList.toggle("is-active", on); b.setAttribute("aria-pressed", String(on)); });
      clearTimeout(timer);
      img.classList.add("is-swapping");
      timer = setTimeout(function () { img.src = btn.getAttribute("data-img"); img.classList.remove("is-swapping"); }, 260);
    }
    items.forEach(function (b) {
      b.addEventListener("click", function () { pick(b); });
      if (finePointer) b.addEventListener("mouseenter", function () { pick(b); });
      b.addEventListener("focus", function () { pick(b); });
    });
  }

  /* ---------- Galería + visor ---------- */
  function initLightbox() {
    var lb = $("[data-lb]"), items = $$("[data-gallery] .mosaic__item");
    if (!lb || !items.length || typeof lb.showModal !== "function") return;
    var img = $(".lb__img", lb), idx = 0, opener = null;
    function show(i) {
      idx = (i + items.length) % items.length;
      var src = $("img", items[idx]);
      img.src = src.getAttribute("src"); img.alt = src.alt;
    }
    items.forEach(function (it, i) {
      it.addEventListener("click", function () { opener = it; show(i); lb.showModal(); document.body.style.overflow = "hidden"; });
    });
    lb.addEventListener("close", function () { document.body.style.overflow = ""; if (opener) opener.focus(); });
    $("[data-lb-close]", lb).addEventListener("click", function () { lb.close(); });
    $("[data-lb-prev]", lb).addEventListener("click", function () { show(idx - 1); });
    $("[data-lb-next]", lb).addEventListener("click", function () { show(idx + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) lb.close(); });
    lb.addEventListener("keydown", function (e) { if (e.key === "ArrowLeft") show(idx - 1); if (e.key === "ArrowRight") show(idx + 1); });
  }

  /* ---------- WhatsApp: links y formulario ---------- */
  function waUrl(text) { return "https://wa.me/" + (B.whatsapp || "5493757447613") + "?text=" + encodeURIComponent(text); }
  function msg() { return (B.msg && B.msg[lang]) || (B.msg && B.msg.es) || {}; }
  function updateWaLinks() {
    var M = msg(); if (!M.gen) return;
    $$("[data-wa]").forEach(function (a) {
      var cab = a.getAttribute("data-cab");
      a.href = waUrl(cab ? M.cab.replace("{c}", cab) : M.gen);
    });
  }
  function initForm() {
    var form = $("[data-book]"); if (!form) return;
    var fin = $("#fIn"), fout = $("#fOut"), status = $(".form__status", form);
    var today = new Date(); today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    fin.min = today.toISOString().slice(0, 10);
    fin.addEventListener("change", function () { fout.min = fin.value; if (fout.value && fout.value <= fin.value) fout.value = ""; });
    function fmt(v) { var p = v.split("-"); return p[2] + "/" + p[1] + "/" + p[0]; }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var M = msg();
      if (fin.value && fout.value && fout.value <= fin.value) { status.textContent = M.dates; return; }
      var cab = $("#fCab").value, pax = $("#fPax").value;
      var parts = [cab ? M.cab.replace("{c}", cab) : M.gen];
      if (fin.value) parts.push(M.inn + ": " + fmt(fin.value) + ".");
      if (fout.value) parts.push(M.out + ": " + fmt(fout.value) + ".");
      parts.push(M.pax.replace("{n}", pax));
      // Se abre en el mismo clic para que el navegador no lo bloquee
      window.open(waUrl(parts.join(" ")), "_blank", "noopener");
      form.classList.add("is-sent");
      status.textContent = M.sent;
      setTimeout(function () { form.classList.remove("is-sent"); }, 3200);
    });
  }

  /* ---------- Idiomas ---------- */
  function initLang() {
    var nodes = $$("[data-i18n]");
    nodes.forEach(function (n) { n.setAttribute("data-es", n.innerHTML); });
    function apply(l) {
      lang = (l === "pt" || l === "en") ? l : "es";
      var dict = (B.i18n && B.i18n[lang]) || {};
      nodes.forEach(function (n) {
        var k = n.getAttribute("data-i18n");
        n.innerHTML = (lang !== "es" && dict[k] !== undefined) ? dict[k] : n.getAttribute("data-es");
      });
      root.lang = lang === "pt" ? "pt-BR" : lang;
      $$("[data-lang]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-lang") === lang)); });
      updateWaLinks();
      try { localStorage.setItem("bdp-lang", lang); } catch (e) {}
      if (window.ScrollTrigger) setTimeout(function () { ScrollTrigger.refresh(); }, 50);
    }
    $$("[data-lang]").forEach(function (b) { b.addEventListener("click", function () { apply(b.getAttribute("data-lang")); }); });
    var start = "es";
    try {
      var saved = localStorage.getItem("bdp-lang");
      if (saved) start = saved;
      else { var nl = (navigator.language || "es").slice(0, 2).toLowerCase(); if (nl === "pt" || nl === "en") start = nl; }
    } catch (e) {}
    if (start !== "es") apply(start); else updateWaLinks();
  }

  function initYear() { var y = $("[data-year]"); if (y) y.textContent = new Date().getFullYear(); }

  function boot() {
    safe(initLang, "lang");
    safe(initSplash, "splash");
    safe(initNav, "nav");
    safe(initMenu, "menu");
    safe(initReveals, "reveals");
    safe(initTilt, "tilt");
    safe(initGrounds, "grounds");
    safe(initLightbox, "lightbox");
    safe(initForm, "form");
    safe(initYear, "year");
    safe(initDay, "day");
    safe(initHeroParallax, "parallax");
    // Recalcular medidas cuando cargan fuentes e imágenes
    window.addEventListener("load", function () { if (window.ScrollTrigger) ScrollTrigger.refresh(); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
