/* Interactive S–N diagram (Bhandari Fig. 5.27): straight line on log–log axes from
   (10^3, 0.9 Sut) to (10^6, Se). Give a stress amplitude to read the life, or a
   life to read the fatigue strength.
   Markup: <div class="widget sn" data-sut="600" data-se="100.6" data-s="250" data-n="90000"></div> */
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
      se: +box.getAttribute("data-se") || 200,
      s: +box.getAttribute("data-s") || 300,
      n: +box.getAttribute("data-n") || 90000
    };
    box.innerHTML =
      '<span class="label">S–N curve: read life or fatigue strength</span>' +
      '<div class="inputs">' +
      '<label>S<sub>ut</sub> (N/mm²)<input type="number" data-k="sut" value="' + d.sut + '"></label>' +
      '<label>S<sub>e</sub> corrected (N/mm²)<input type="number" data-k="se" value="' + d.se + '"></label>' +
      '<label>stress amplitude σ (N/mm²)<input type="number" data-k="s" value="' + d.s + '"></label>' +
      '<label>required life N (cycles)<input type="number" data-k="n" value="' + d.n + '"></label>' +
      "</div>";
    var W = 600, H = 320, L = 60, R = 16, T = 14, B = 42;
    var svg = el("svg", { viewBox: "0 0 " + W + " " + H, class: "fig", role: "img", "aria-label": "S-N diagram" });
    box.appendChild(svg);
    var out = document.createElement("div");
    out.className = "readout";
    box.appendChild(out);
    function draw() {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      var A = Math.log10(0.9 * d.sut), Bv = Math.log10(d.se);
      var ymin = Math.floor((Bv - 0.15) * 10) / 10, ymax = Math.ceil((A + 0.1) * 10) / 10;
      function X(lg) { return L + (lg - 2.5) / (7 - 2.5) * (W - L - R); }
      function Y(lg) { return H - B - (lg - ymin) / (ymax - ymin) * (H - T - B); }
      for (var k = 3; k <= 7; k++) {
        svg.appendChild(el("line", { x1: X(k), y1: Y(ymin), x2: X(k), y2: Y(ymax), class: "grid" }));
        svg.appendChild(el("text", { x: X(k), y: H - B + 16, "text-anchor": "middle", class: "small" }, "10" + String.fromCharCode([8323, 8308, 8309, 8310, 8311][k - 3])));
      }
      [50, 100, 150, 200, 300, 400, 500, 600, 800, 1000, 1500].forEach(function (s) {
        var lg = Math.log10(s);
        if (lg > ymin && lg < ymax) {
          svg.appendChild(el("line", { x1: X(2.5), y1: Y(lg), x2: X(7), y2: Y(lg), class: "grid" }));
          svg.appendChild(el("text", { x: L - 6, y: Y(lg) + 4, "text-anchor": "end", class: "small" }, s));
        }
      });
      svg.appendChild(el("line", { x1: X(2.5), y1: Y(ymin), x2: X(7), y2: Y(ymin), class: "axis" }));
      svg.appendChild(el("line", { x1: X(2.5), y1: Y(ymin), x2: X(2.5), y2: Y(ymax), class: "axis" }));
      svg.appendChild(el("text", { x: X(7) - 4, y: H - 6, "text-anchor": "end" }, "cycles N (log scale) →"));
      svg.appendChild(el("text", { x: 6, y: T + 6 }, "S (log)"));
      // curve
      svg.appendChild(el("line", { x1: X(3), y1: Y(A), x2: X(6), y2: Y(Bv), class: "acc" }));
      svg.appendChild(el("line", { x1: X(6), y1: Y(Bv), x2: X(7), y2: Y(Bv), class: "acc" }));
      svg.appendChild(el("circle", { cx: X(3), cy: Y(A), r: 4, class: "dot" }));
      svg.appendChild(el("circle", { cx: X(6), cy: Y(Bv), r: 4, class: "dot" }));
      svg.appendChild(el("text", { x: X(3) + 8, y: Y(A) - 6, class: "acc small" }, "0.9 Sut = " + (0.9 * d.sut).toFixed(0)));
      svg.appendChild(el("text", { x: X(6) + 6, y: Y(Bv) - 8, class: "acc small" }, "Se = " + d.se.toFixed(1)));
      // life for stress s
      var lifeTxt, sfTxt;
      if (d.s <= d.se) lifeTxt = "infinite (σ ≤ Se)";
      else if (d.s >= 0.9 * d.sut) lifeTxt = "below 10³ cycles: low-cycle region, design on static strength";
      else {
        var lgN = 3 + 3 * (A - Math.log10(d.s)) / (A - Bv);
        var N = Math.pow(10, lgN);
        lifeTxt = Math.round(N).toLocaleString("en-IN") + " cycles (log N = " + lgN.toFixed(4) + ")";
        svg.appendChild(el("line", { x1: X(2.5), y1: Y(Math.log10(d.s)), x2: X(lgN), y2: Y(Math.log10(d.s)), class: "dash" }));
        svg.appendChild(el("line", { x1: X(lgN), y1: Y(Math.log10(d.s)), x2: X(lgN), y2: Y(ymin), class: "dash" }));
        svg.appendChild(el("circle", { cx: X(lgN), cy: Y(Math.log10(d.s)), r: 4, class: "dotb" }));
      }
      var lgn = Math.log10(Math.max(d.n, 1));
      if (lgn >= 6) sfTxt = "Se = " + d.se.toFixed(2) + " N/mm² (N ≥ 10⁶)";
      else if (lgn <= 3) sfTxt = "0.9 Sut = " + (0.9 * d.sut).toFixed(1) + " N/mm² (N ≤ 10³)";
      else {
        var lgS = A - (A - Bv) * (lgn - 3) / 3;
        sfTxt = Math.pow(10, lgS).toFixed(2) + " N/mm² (log Sf = " + lgS.toFixed(4) + ")";
        svg.appendChild(el("circle", { cx: X(lgn), cy: Y(lgS), r: 4, class: "dotb" }));
      }
      out.innerHTML = "Life at σ = " + d.s + " N/mm²: <b>" + lifeTxt + "</b><br>Fatigue strength S<sub>f</sub> at N = " + Number(d.n).toLocaleString("en-IN") + ": <b>" + sfTxt + "</b>";
    }
    box.querySelectorAll("input").forEach(function (i) {
      i.addEventListener("input", function () { var v = parseFloat(i.value); if (!isNaN(v) && v > 0) { d[i.getAttribute("data-k")] = v; draw(); } });
    });
    draw();
  }
  function init() { document.querySelectorAll(".sn").forEach(build); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
