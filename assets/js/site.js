/* memoblok.com — nav toggle, © year, invite paste flow, guarded reveal. */
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
          function () { status.textContent = "Link copied."; },
          function () { status.textContent = "Couldn\u2019t copy \u2014 press and hold the link to select it."; }
        );
      });
    }
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
