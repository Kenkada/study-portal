/* Interactive fatigue diagram (σm horizontal, σa vertical).
   Markup: <div class="widget goodman" data-sut="600" data-syt="380" data-se="200" data-sm="150" data-sa="80"></div>
   Draws the Soderberg, Goodman and Gerber lines plus the yield line, plots the
   working point and its load line, and reports the factor of safety for each. */
(function () {
  "use strict";
  function el(tag, attrs, text) {
    var e = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    return e;
  }
  function build(box) {
    var d = {
      sut: +box.getAttribute("data-sut") || 600,
      syt: +box.getAttribute("data-syt") || 380,
      se: +box.getAttribute("data-se") || 200,
      sm: +box.getAttribute("data-sm") || 150,
      sa: +box.getAttribute("data-sa") || 80
    };
    box.innerHTML =
      '<span class="label">Fatigue diagram: move the numbers</span>' +
      '<div class="inputs">' +
      '<label>S<sub>ut</sub> (N/mm²)<input type="number" data-k="sut" value="' + d.sut + '"></label>' +
      '<label>S<sub>yt</sub> (N/mm²)<input type="number" data-k="syt" value="' + d.syt + '"></label>' +
      '<label>S<sub>e</sub> corrected (N/mm²)<input type="number" data-k="se" value="' + d.se + '"></label>' +
      '<label>σ<sub>m</sub> mean (N/mm²)<input type="number" data-k="sm" value="' + d.sm + '"></label>' +
      '<label>σ<sub>a</sub> amplitude (N/mm²)<input type="number" data-k="sa" value="' + d.sa + '"></label>' +
      "</div>";
    var W = 600, H = 360, L = 56, R = 18, T = 16, B = 44;
    var svg = el("svg", { viewBox: "0 0 " + W + " " + H, class: "fig", role: "img", "aria-label": "Fatigue diagram" });
    box.appendChild(svg);
    var out = document.createElement("div");
    out.className = "readout";
    box.appendChild(out);

    function draw() {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      var xmax = Math.max(d.sut, d.sm * 1.2) * 1.08;
      var ymax = Math.max(d.syt, d.se, d.sa * 1.2) * 1.12;
      function X(v) { return L + (v / xmax) * (W - L - R); }
      function Y(v) { return H - B - (v / ymax) * (H - T - B); }
      // grid + axes
      var step = Math.pow(10, Math.floor(Math.log10(xmax))) / 2;
      if (xmax / step > 12) step *= 2;
      for (var g = step; g < xmax; g += step) {
        svg.appendChild(el("line", { x1: X(g), y1: Y(0), x2: X(g), y2: Y(ymax), class: "grid" }));
        svg.appendChild(el("text", { x: X(g), y: H - B + 16, "text-anchor": "middle", class: "small" }, Math.round(g)));
      }
      for (var h = step; h < ymax; h += step) {
        svg.appendChild(el("line", { x1: X(0), y1: Y(h), x2: X(xmax), y2: Y(h), class: "grid" }));
        svg.appendChild(el("text", { x: L - 6, y: Y(h) + 4, "text-anchor": "end", class: "small" }, Math.round(h)));
      }
      svg.appendChild(el("line", { x1: X(0), y1: Y(0), x2: X(xmax), y2: Y(0), class: "axis" }));
      svg.appendChild(el("line", { x1: X(0), y1: Y(0), x2: X(0), y2: Y(ymax), class: "axis" }));
      svg.appendChild(el("text", { x: X(xmax) - 4, y: H - 8, "text-anchor": "end" }, "mean stress σm →"));
      svg.appendChild(el("text", { x: 8, y: T + 4, "text-anchor": "start" }, "σa"));
      // yield line
      svg.appendChild(el("line", { x1: X(0), y1: Y(d.syt), x2: X(d.syt), y2: Y(0), class: "dash" }));
      svg.appendChild(el("text", { x: X(d.syt * 0.12) + 4, y: Y(d.syt * 0.88) - 4, class: "small" }, "yield line"));
      // Soderberg
      svg.appendChild(el("line", { x1: X(0), y1: Y(d.se), x2: X(d.syt), y2: Y(0), class: "blu" }));
      // Goodman
      svg.appendChild(el("line", { x1: X(0), y1: Y(d.se), x2: X(d.sut), y2: Y(0), class: "acc" }));
      // Gerber
      var pts = [];
      for (var k = 0; k <= 40; k++) { var m = d.sut * k / 40; pts.push(X(m) + "," + Y(d.se * (1 - (m / d.sut) * (m / d.sut)))); }
      svg.appendChild(el("polyline", { points: pts.join(" "), class: "grn" }));
      // labels
      svg.appendChild(el("text", { x: X(d.syt) - 4, y: Y(0) - 6, "text-anchor": "end", class: "blu small" }, "Soderberg"));
      svg.appendChild(el("text", { x: X(d.sut) - 4, y: Y(0) - 18, "text-anchor": "end", class: "acc small" }, "Goodman"));
      svg.appendChild(el("text", { x: X(d.sut * 0.62), y: Y(d.se * (1 - 0.62 * 0.62)) - 8, class: "small", fill: "currentColor" }, "Gerber"));
      svg.appendChild(el("text", { x: X(0) + 4, y: Y(d.se) - 6, class: "small" }, "Se"));
      // working point + load line
      var nG = 1 / (d.sa / d.se + d.sm / d.sut);
      var nS = 1 / (d.sa / d.se + d.sm / d.syt);
      var a = d.sm / d.sut, b = d.sa / d.se, nGe;
      if (d.sm <= 0) nGe = d.se / d.sa; else nGe = (-b + Math.sqrt(b * b + 4 * a * a)) / (2 * a * a);
      var nY = d.syt / (d.sm + d.sa);
      var nMG = Math.min(nG, nY);
      if (d.sm > 0 || d.sa > 0) {
        var reach = Math.max(nG, nS, nGe, 1) * 1.02;
        svg.appendChild(el("line", { x1: X(0), y1: Y(0), x2: X(d.sm * Math.min(reach, xmax / Math.max(d.sm, 1e-9))), y2: Y(d.sa * Math.min(reach, xmax / Math.max(d.sm, 1e-9))), class: "dash" }));
        svg.appendChild(el("circle", { cx: X(d.sm * nMG), cy: Y(d.sa * nMG), r: 4, class: "dotb" }));
        svg.appendChild(el("circle", { cx: X(d.sm), cy: Y(d.sa), r: 5, class: "dot" }));
        svg.appendChild(el("text", { x: X(d.sm) + 8, y: Y(d.sa) - 6, class: "acc" }, "working point"));
      }
      function f(n) { return isFinite(n) ? n.toFixed(2) : "—"; }
      out.innerHTML =
        "Factor of safety along the load line (σa/σm held constant):<br>" +
        "Soderberg <b>" + f(nS) + "</b> · Goodman <b>" + f(nG) + "</b> · Gerber <b>" + f(nGe) + "</b> · against yielding <b>" + f(nY) + "</b><br>" +
        "Bhandari's modified Goodman diagram (Goodman line + yield line): <b>" + f(nMG) + "</b>" +
        (nY < nG ? " (yield governs: the load line reaches the yield line first)" : " (the Goodman line governs)");
    }
    box.querySelectorAll("input").forEach(function (i) {
      i.addEventListener("input", function () { var v = parseFloat(i.value); if (!isNaN(v) && v >= 0) { d[i.getAttribute("data-k")] = v; draw(); } });
    });
    draw();
  }
  function init() { document.querySelectorAll(".goodman").forEach(build); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
