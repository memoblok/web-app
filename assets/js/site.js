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

  /* Sticky bar -------------------------------------------------------------
     A copy of the header's nav, fixed to the top, shown once the real one has
     scrolled out of view. A copy rather than the nav itself, so the header
     keeps its place and nothing below it jumps. Hidden copies are inert, so
     keyboard and screen-reader users meet one nav at a time. ------------- */
  var realNav = document.querySelector(".page-head .topnav");
  if (realNav && "IntersectionObserver" in window) {
    var bar = document.createElement("div");
    bar.className = "stickybar";
    bar.setAttribute("aria-hidden", "true");
    bar.inert = true;
    var inner = document.createElement("div");
    inner.className = "wrap";
    var nav = realNav.cloneNode(true);
    nav.setAttribute("aria-label", "Main (pinned)");
    var barLinks = nav.querySelector(".nav-links");
    var barToggle = nav.querySelector(".nav-toggle");
    if (barLinks) { barLinks.id = "nav-links-bar"; barLinks.classList.remove("open"); }
    var closeBarMenu = function () {
      if (barLinks) barLinks.classList.remove("open");
      if (barToggle) barToggle.setAttribute("aria-expanded", "false");
    };
    if (barToggle && barLinks) {
      barToggle.setAttribute("aria-controls", "nav-links-bar");
      barToggle.setAttribute("aria-expanded", "false");
      barToggle.addEventListener("click", function () {
        var open = barLinks.classList.toggle("open");
        barToggle.setAttribute("aria-expanded", String(open));
      });
      barLinks.addEventListener("click", function (e) { if (e.target.closest("a")) closeBarMenu(); });
    }
    inner.appendChild(nav);
    bar.appendChild(inner);
    document.body.appendChild(bar);
    new IntersectionObserver(function (entries) {
      var show = !entries[0].isIntersecting && entries[0].boundingClientRect.top < 0;
      bar.classList.toggle("shown", show);
      bar.setAttribute("aria-hidden", String(!show));
      bar.inert = !show;
      if (!show) closeBarMenu();
    }).observe(realNav);
  }

  /* No orphans ------------------------------------------------------------
     Ties the last two words of every heading, paragraph and list item with a
     no-break space, so a block's final word never sits alone on a line. Done
     here rather than by hand in the HTML, so new copy is covered too. Skips
     anything already tied and anything inside a script-built bar. ------- */
  Array.prototype.forEach.call(document.querySelectorAll("h1, h2, h3, p, li, summary"), function (el) {
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    var last = null, node;
    while ((node = walker.nextNode())) { if (/\S/.test(node.data)) last = node; }
    if (!last) return;
    var text = last.data.replace(/\s+$/, "");
    // Already tied by hand ("Blok&nbsp;it"): leave it, or a third word joins.
    if (/\u00a0[^\s\u00a0]*$/.test(text)) return;
    var i = text.lastIndexOf(" ");
    // Only within one text node, and only when a word precedes the last one
    // there: tying across tags would need restructuring the markup.
    if (i > 0 && /\S/.test(text.slice(0, i))) last.data = text.slice(0, i) + "\u00a0" + text.slice(i + 1) + last.data.slice(text.length);
  });

  /* No lone words: the safety net ----------------------------------------
     The CSS balances headings and the tie above handles a block's last word,
     but a short heading in a narrow card can still leave one word alone on a
     line ("Places / stay private"). After layout, any heading or list item
     that does is shrunk a step at a time, never below 85% of its size, until
     it doesn't. Re-run whenever the window changes width. ---------------- */
  var fitTargets = Array.prototype.filter.call(
    document.querySelectorAll("h1, h2, h3, li, summary"),
    function (el) { return !el.closest(".stickybar, .nav-links"); }
  );
  var loneWord = function (el) {
    var range = document.createRange(), tops = [], counts = [];
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null), node, m, re;
    while ((node = walker.nextNode())) {
      re = /[^\s\u00a0]+/g;
      while ((m = re.exec(node.data))) {
        range.setStart(node, m.index); range.setEnd(node, m.index + m[0].length);
        var rect = range.getClientRects()[0];
        if (!rect) continue;
        var top = Math.round(rect.top), i = tops.findIndex(function (t) { return Math.abs(t - top) < 4; });
        if (i < 0) { tops.push(top); counts.push(1); } else counts[i] += 1;
      }
    }
    return counts.length > 1 && counts.indexOf(1) >= 0;
  };
  var fitAll = function () {
    fitTargets.forEach(function (el) {
      el.style.fontSize = "";
      if (!el.offsetParent || !loneWord(el)) return;
      var base = parseFloat(getComputedStyle(el).fontSize), size = base;
      while (size > base * 0.85 && loneWord(el)) {
        size -= Math.max(0.5, base * 0.02);
        el.style.fontSize = size + "px";
      }
      if (loneWord(el)) el.style.fontSize = "";   // couldn't fix it; don't shrink for nothing
    });
  };
  var lastWidth = 0, fitQueued = false;
  var queueFit = function () {
    if (window.innerWidth === lastWidth || fitQueued) return;
    fitQueued = true;
    requestAnimationFrame(function () { fitQueued = false; lastWidth = window.innerWidth; fitAll(); });
  };
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(queueFit);
  window.addEventListener("resize", queueFit, { passive: true });

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
     · Parallax: pure CSS now (a scroll-driven animation in site.css), so
       nothing here runs on scroll. A JavaScript scroll handler lagged a
       frame behind the finger on iOS and restyled the whole page per frame.
     · Reveal: sections and cards below the hero rise in as they reach the
       viewport. The class is added here, never in the HTML, so the page is
       complete without JavaScript. Siblings in a group are staggered. --- */
  var hero = document.querySelector(".home-head");
  var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (hero && !still) {
    // [selector, variant, stagger between siblings in ms, base delay in ms]
    var groups = [
      [".poss-txt", "", 0, 0],
      [".poss-card", "", 110, 0],
      [".poss-card .blok", "", 0, 180],
      [".how > .band, .pair > .band", "", 0, 0],
      [".band .blok", "", 90, 160],
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
      [".plans-stack", "pop", 0, 360],
      [".perch", "pop", 0, 420],
      [".prem-art", "pop", 0, 520],
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
