/* memoblok.com — nav toggle, © year, marker underline, guarded reveal. */
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

  /* Marker underline (§4.5) — seeded, so the same heading draws the same
     stroke forever. Never Math.random() here. --------------------------- */
  function markerPath(width, thickness, roughness, seed) {
    var OVERSHOOT = 5, SPACING = 12;
    var a = (seed + Math.round(width)) >>> 0;
    var rnd = function () {
      a = (a + 0x6d2b79f5) >>> 0; var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    var height = thickness + (roughness + 2.4) * 2, mid = height / 2;
    var start = -OVERSHOOT * (0.4 + rnd() * 1.2);
    var end = width + OVERSHOOT * (0.4 + rnd() * 1.2);
    var span = end - start, steps = Math.max(4, Math.round(span / SPACING));
    var bow = -(0.6 + rnd() * 0.8), half = thickness / 2, top = [], bot = [];
    for (var i = 0; i <= steps; i++) {
      var t = i / steps;
      var cx = start + span * t;
      var cy = mid + Math.sin(t * Math.PI) * bow + (rnd() * 2 - 1) * roughness;
      // Pressure profile: broad plateau across the middle, tapering to a point.
      var w = half * Math.pow(Math.sin(t * Math.PI), 0.45) * (0.82 + rnd() * 0.36);
      top.push([cx, cy - w]); bot.push([cx, cy + w]);
    }
    // Join samples with quadratics through their midpoints so the edge curves.
    var edge = function (p) {
      var d = "";
      for (var i = 1; i < p.length - 1; i++) {
        var c = p[i], n = p[i + 1];
        d += " Q " + c[0] + " " + c[1] + ", " + (c[0] + n[0]) / 2 + " " + (c[1] + n[1]) / 2;
      }
      var last = p[p.length - 1];
      return d + " L " + last[0] + " " + last[1];
    };
    var back = bot.slice().reverse();
    return {
      height: height, svgWidth: width + OVERSHOOT * 2, offsetX: -OVERSHOOT,
      d: "M " + top[0][0] + " " + top[0][1] + edge(top) +
         " L " + back[0][0] + " " + back[0][1] + edge(back) + " Z"
    };
  }

  var NS = "http://www.w3.org/2000/svg";
  var marks = document.querySelectorAll(".mark");

  function drawMarks() {
    Array.prototype.forEach.call(marks, function (el, i) {
      var old = el.querySelector("svg");
      if (old) old.remove();
      var width = el.getBoundingClientRect().width;
      if (!width) return;
      var m = markerPath(width, 7, 2.2, i + 1);
      var svg = document.createElementNS(NS, "svg");
      svg.setAttribute("width", m.svgWidth);
      svg.setAttribute("height", m.height);
      svg.setAttribute("viewBox", m.offsetX + " 0 " + m.svgWidth + " " + m.height);
      svg.setAttribute("aria-hidden", "true");
      svg.style.left = m.offsetX + "px";
      svg.style.bottom = -(m.height / 2) + "px";
      var path = document.createElementNS(NS, "path");
      path.setAttribute("d", m.d);
      path.setAttribute("fill", "#6E4FA8");
      svg.appendChild(path);
      el.appendChild(svg);
    });
  }

  if (marks.length) {
    drawMarks();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(drawMarks);
    var t;
    window.addEventListener("resize", function () {
      clearTimeout(t); t = setTimeout(drawMarks, 150);
    });
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
