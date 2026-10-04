/* memoblok.com — nav toggle, © year, invite paste flow, legal contents,
   home page motion. */
(function () {
  "use strict";

  /* Mobile nav ----------------------------------------------------------- */
  var toggle = document.querySelector(".nav-toggle");
  var links = document.getElementById("nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && links.classList.contains("open")) {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  }

  /* © year --------------------------------------------------------------- */
  var year = String(new Date().getFullYear());
  Array.prototype.forEach.call(document.querySelectorAll("[data-year]"), function (el) {
    el.textContent = year;
  });

  /* /join — invite paste flow -------------------------------------------
     Some messengers (WeChat and others) open links in their own webview and
     never hand them to the OS, so a universal link cannot fire even with the
     app installed. The app takes a pasted link at Settings › Sharing; this
     only shows the reader the link and says where it goes.

     The token rides the fragment so it never reaches a server — not this
     site's logs, not the link-preview bots that iMessage and WhatsApp run over
     invite URLs before anyone taps. Reading it here is fine: it stays in the
     browser. It must never leave — no query string, no href, no analytics, no
     fetch. Moving it to a query string to simplify this would leak a working
     credential for every invite ever sent. -------------------------------- */
  var tokenBlock = document.getElementById("paste-token");
  var token = tokenBlock ? location.hash.slice(1) : "";
  if (tokenBlock && token) {
    var urlEl = document.getElementById("invite-url");
    // Rebuilt rather than location.href so that a stray query string is never
    // shown as part of the invite, and so that landing on /join.html directly
    // still displays the /join URL the app actually mints.
    var path = location.pathname.replace(/\.html$/, "");
    urlEl.textContent = location.origin + path + "#" + token;

    document.getElementById("paste-generic").hidden = true;
    tokenBlock.hidden = false;

    // Selectable text is the floor; the button is the bonus, and only appears
    // where there is a clipboard to write to. Several webviews expose none.
    var copy = document.getElementById("copy-btn");
    var status = document.getElementById("copy-status");
    if (navigator.clipboard && navigator.clipboard.writeText) {
      copy.hidden = false;
      copy.addEventListener("click", function () {
        navigator.clipboard.writeText(urlEl.textContent).then(
          function () { status.textContent = "Link copied. Now paste it in the app."; },
          function () { status.textContent = "Couldn\u2019t copy \u2014 press and hold the link to select it."; }
        );
      });
    }
  }

  /* Legal pages — "On this page" -----------------------------------------
     One <details>: on desktop it is the sticky contents card, always open;
     on a phone it folds into a row above the text. It ships open so it
     still works without JavaScript; here it starts folded on a phone, and
     the link for the section being read is marked. -------------------- */
  var toc = document.querySelector(".toc");
  if (toc) {
    var phone = window.matchMedia("(max-width: 768px)");
    if (phone.matches) toc.open = false;
    phone.addEventListener && phone.addEventListener("change", function (m) { toc.open = !m.matches; });
    var tocLinks = Array.prototype.slice.call(toc.querySelectorAll("a[href^='#']"));
    tocLinks.forEach(function (a) {
      a.addEventListener("click", function () { if (phone.matches) toc.open = false; });
    });
    var targets = tocLinks.map(function (a) { return document.getElementById(a.hash.slice(1)); });
    var mark = function () {
      var line = window.innerHeight * 0.3, current = 0;
      targets.forEach(function (t, i) { if (t && t.getBoundingClientRect().top <= line) current = i; });
      // At the very bottom the last short sections can't reach the line.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) current = targets.length - 1;
      tocLinks.forEach(function (a, i) {
        a.classList.toggle("on", i === current);
        if (i === current) a.setAttribute("aria-current", "location"); else a.removeAttribute("aria-current");
      });
    };
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; mark(); }); }
    }, { passive: true });
    mark();
  }

  /* Home page motion --------------------------------------------------
     The ceiling for motion on this site, and skipped entirely when the
     visitor asks for reduced motion. Two parts:
     · Parallax: the hero's layers drift at their own rates as it scrolls
       away. site.js only writes --hero-y (pixels scrolled, capped at the
       hero's height) and --hero-f (the same as a 0-1 fraction); the rates
       live in site.css.
     · Reveal: sections and cards below the hero rise in as they reach the
       viewport. The class is added here, never in the HTML, so the page is
       complete without JavaScript. Siblings in a group are staggered. --- */
  var hero = document.querySelector(".home-head");
  var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (hero && !still) {
    var root = document.documentElement, queued = false;
    var drift = function () {
      queued = false;
      var h = hero.offsetHeight, y = Math.min(Math.max(window.scrollY, 0), h);
      root.style.setProperty("--hero-y", y + "px");
      root.style.setProperty("--hero-f", (y / h).toFixed(3));
    };
    window.addEventListener("scroll", function () {
      if (!queued) { queued = true; requestAnimationFrame(drift); }
    }, { passive: true });
    drift();

    // [selector, variant, stagger between siblings in ms, base delay in ms]
    var groups = [
      [".poss-txt", "", 0, 0],
      [".poss-card", "", 110, 0],
      [".poss-card .blok", "", 0, 180],
      [".how > .band, .pair > .band", "", 0, 0],
      [".band .blok", "", 0, 160],
      [".hand", "pop", 120, 420],
      [".ct", "pop", 16, 120],
      [".rule, .shared", "", 0, 320],
      [".nt", "right", 160, 200],
      [".tr", "", 70, 120],
      [".in-card", "", 0, 280],
      [".cmp", "", 0, 120],
      [".cn", "", 0, 240],
      [".cn-row", "left", 110, 420],
      [".plans", "", 0, 0],
      [".plan-free, .plan-prem", "", 120, 120],
      [".li, .lp", "left", 45, 260],
      [".data", "", 0, 0],
      [".data-head img", "pop", 0, 150],
      [".pt", "", 90, 200],
      [".know", "", 0, 0],
      [".know .faqd", "", 70, 120],
      [".closing", "", 0, 0],
      [".closing-in img", "pop", 0, 200]
    ];
    var targets = [];
    groups.forEach(function (g) {
      var seen = new Map();
      Array.prototype.forEach.call(document.querySelectorAll(g[0]), function (el) {
        if (el.closest(".hero") || el.offsetParent === null) return;
        // Stagger within the nearest group, not just the direct parent: the
        // second reminder, for one, sits a level deeper than the first.
        var group = el.parentNode.closest(".collage, .tr-grid, .cn, .plan-free, .plan-prem, .pts, .faq, .stack-nt, .poss, .pair, .how, .band") || el.parentNode;
        var i = seen.get(group) || 0;
        seen.set(group, i + 1);
        el.classList.add("reveal");
        if (g[1]) el.classList.add("reveal-" + g[1]);
        el.style.setProperty("--d", Math.min(g[3] + i * g[2], 900) + "ms");
        targets.push(el);
      });
    });
    var settle = function (el) {
      // Hand the element back to the hover transitions once it has landed.
      el.addEventListener("transitionend", function done(e) {
        if (e.target !== el) return;
        el.classList.add("settled");
        el.removeEventListener("transitionend", done);
      });
    };
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { settle(e.target); e.target.classList.add("in"); io.unobserve(e.target); }
        });
      }, { rootMargin: "0px 0px -8% 0px" });
      targets.forEach(function (el) { io.observe(el); });
    } else {
      targets.forEach(function (el) { el.classList.add("in", "settled"); });
    }
  }
})();
