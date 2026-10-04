/* memoblok.com — nav toggle, © year, invite paste flow, legal contents,
   guarded reveal. */
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

  /* Reveal on scroll — the ceiling for motion here, and skipped entirely
     when the visitor asks for reduced motion. --------------------------- */
  var reveals = document.querySelectorAll(".reveal");
  var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reveals.length && !still && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -10% 0px" });
    Array.prototype.forEach.call(reveals, function (el) { io.observe(el); });
  } else {
    Array.prototype.forEach.call(reveals, function (el) { el.classList.add("in"); });
  }
})();
