/* Mechanical Design course: lesson runtime.
   Components (all driven by markup, so lessons stay plain HTML):
     a.bk[data-p]        link to a page of Bhandari (book page number)
     a.ppt[data-p]       link to a page of the course slides
     a.qb[data-p]        link to a page of the question bank
     a.tut               link to tutorial sheet 2
                         (those four are plain page citations on the published site: the PDFs stay offline)
     .local-only         shown only when opened from this computer, not on the published site
     a.lesson[data-l]    link to another lesson by id ("0007")
     a.ref[data-r]       link to a reference sheet by file name
     .mcq[data-correct]  multiple-choice question (1-based correct option)
     .num[data-answer]   numeric answer checker (data-tol = % tolerance, data-unit)
     ol.steps            worked-example steps revealed one at a time
     .calc               live calculator: inputs[data-v] + output[data-expr]
   Also: breadcrumbs, prev/next nav, theme toggle, progress (localStorage), KaTeX. */
(function () {
  "use strict";

  var script = document.currentScript;
  var assetsURL = script ? script.src.replace(/[^\/]*$/, "") : "../assets/";
  var rootURL = assetsURL.replace(/assets\/$/, "");
  var C = window.COURSE || { lessons: [], units: [], references: [] };
  // The source PDFs are never published (see the repo's .gitignore), so they only exist when running from this folder.
  var isLocal = location.protocol === "file:" || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);

  // ---------- storage (never required for the page to work) ----------
  function load(key, dflt) {
    try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : dflt; } catch (e) { return dflt; }
  }
  function save(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* ignore */ }
  }

  // ---------- theme ----------
  var theme = load("md-theme", "auto");
  function applyTheme() {
    if (theme === "auto") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", theme);
  }
  applyTheme();

  function enc(file) { return encodeURI(file).replace(/\(/g, "%28").replace(/\)/g, "%29").replace(/,/g, "%2C"); }

  // ---------- where am I ----------
  var here = location.pathname.split("/").pop();
  var lessonIdx = -1;
  for (var i = 0; i < C.lessons.length; i++) if (C.lessons[i].file === here) lessonIdx = i;
  var lesson = lessonIdx >= 0 ? C.lessons[lessonIdx] : null;
  var progress = load("md-progress", {});

  function lessonURL(l) { return rootURL + "lessons/" + l.file; }
  function isBuilt(l) { return !C.builtUpTo || l.id <= C.builtUpTo; }
  function findLesson(id) { for (var i = 0; i < C.lessons.length; i++) if (C.lessons[i].id === id) return C.lessons[i]; return null; }
  // The portal home's course card counts this list.
  function syncPortal() {
    save("portal:md:done", Object.keys(progress).filter(function (id) { return progress[id].done; }));
  }

  // ---------- links ----------
  function pdfLink(a, url, text) {
    if (!a.textContent.trim()) a.textContent = text;
    if (!isLocal) { a.classList.add("cite"); return; }
    a.href = url;
    a.target = "_blank"; a.rel = "noopener";
  }
  function wireLinks() {
    document.querySelectorAll("a.bk").forEach(function (a) {
      var p = parseInt(a.getAttribute("data-p"), 10);
      pdfLink(a, rootURL + enc(C.book) + "#page=" + (p + (C.bookOffset || 24)), "Bhandari p. " + p);
      if (isLocal) a.title = "Open Bhandari at book page " + p;
    });
    document.querySelectorAll("a.ppt").forEach(function (a) {
      var p = a.getAttribute("data-p");
      pdfLink(a, rootURL + enc(C.slides) + "#page=" + p, "course slides p. " + p);
    });
    document.querySelectorAll("a.qb").forEach(function (a) {
      var p = a.getAttribute("data-p");
      pdfLink(a, rootURL + enc(C.qbank) + (p ? "#page=" + p : ""), "question bank" + (p ? " p. " + p : ""));
    });
    document.querySelectorAll("a.tut").forEach(function (a) {
      pdfLink(a, rootURL + enc(C.tut), "Tutorial sheet 2");
    });
    if (!isLocal) document.querySelectorAll(".local-only").forEach(function (el) { el.hidden = true; });
    document.querySelectorAll("a.lesson").forEach(function (a) {
      var l = findLesson(a.getAttribute("data-l"));
      if (!l) return;
      a.href = lessonURL(l);
      if (!a.textContent.trim()) a.textContent = "Lesson " + parseInt(l.id, 10) + ": " + l.title;
    });
    document.querySelectorAll("a.ref").forEach(function (a) {
      var f = a.getAttribute("data-r");
      a.href = rootURL + "reference/" + f;
      if (!a.textContent.trim()) {
        var r = (C.references || []).filter(function (x) { return x.file === f; })[0];
        a.textContent = r ? r.title : f;
      }
    });
  }

  // ---------- header + footer ----------
  function chrome() {
    var page = document.querySelector(".page");
    if (!page) return;
    var crumbs = document.createElement("nav");
    crumbs.className = "crumbs";
    var html = '<a href="' + rootURL + '../index.html">Study Portal</a><a href="' + rootURL + 'index.html">' + (C.title || "Course") + "</a>";
    if (lesson) {
      var unit = C.units[lesson.unit - 1];
      html += "<span>Unit " + lesson.unit + (unit ? " · " + unit.title : "") + "</span>";
      html += "<span>Lesson " + parseInt(lesson.id, 10) + " of " + C.lessons.length + "</span>";
      if (unit && unit.ref) html += '<a href="' + rootURL + "reference/" + unit.ref + '">Unit ' + lesson.unit + " formula sheet</a>";
    } else if (/reference/.test(location.pathname)) {
      html += "<span>Reference</span>";
    }
    html += '<button class="theme-toggle" type="button" aria-label="Change colour theme"></button>';
    crumbs.innerHTML = html;
    page.insertBefore(crumbs, page.firstChild);
    var tbtn = crumbs.querySelector(".theme-toggle");
    function label() { tbtn.textContent = theme === "auto" ? "Theme: auto" : theme === "dark" ? "Theme: dark" : "Theme: light"; }
    label();
    tbtn.addEventListener("click", function () {
      theme = theme === "auto" ? "light" : theme === "light" ? "dark" : "auto";
      save("md-theme", theme); applyTheme(); label();
    });

    if (!lesson) return;
    // complete button
    var row = document.createElement("div");
    row.className = "complete-row";
    var done = progress[lesson.id] && progress[lesson.id].done;
    row.innerHTML = '<button class="btn' + (done ? " ghost" : "") + '" type="button">' + (done ? "✓ Marked complete" : "Mark lesson complete") + '</button><span class="muted score"></span>';
    page.appendChild(row);
    var btn = row.querySelector("button");
    btn.addEventListener("click", function () {
      var p = progress[lesson.id] || {};
      p.done = !p.done; p.when = new Date().toISOString().slice(0, 10);
      progress[lesson.id] = p; save("md-progress", progress); syncPortal();
      btn.textContent = p.done ? "✓ Marked complete" : "Mark lesson complete";
      btn.classList.toggle("ghost", !!p.done);
    });
    updateScore();

    var nav = document.createElement("nav");
    nav.className = "lesson-nav";
    var prev = C.lessons[lessonIdx - 1], next = C.lessons[lessonIdx + 1];
    if (next && !isBuilt(next)) next = null;
    nav.innerHTML =
      (prev ? '<a class="prev" href="' + lessonURL(prev) + '"><small>← Previous</small>' + prev.title + "</a>" : "<span></span>") +
      (next ? '<a class="next" href="' + lessonURL(next) + '"><small>Next →</small>' + next.title + "</a>" : '<a class="next" href="' + rootURL + 'index.html"><small>Finished →</small>Back to the course map</a>');
    page.appendChild(nav);
  }

  // ---------- scoring ----------
  var score = { right: 0, tried: 0, total: 0 };
  function updateScore() {
    var el = document.querySelector(".complete-row .score");
    if (!el) return;
    if (score.total) el.textContent = "First-try score this visit: " + score.right + " / " + score.tried + " answered (of " + score.total + ")";
    if (lesson && score.tried) {
      var p = progress[lesson.id] || {};
      p.best = Math.max(p.best || 0, Math.round(100 * score.right / score.total));
      progress[lesson.id] = p; save("md-progress", progress);
    }
  }

  // ---------- MCQ ----------
  function mcqs() {
    var n = 0;
    document.querySelectorAll(".mcq").forEach(function (box) {
      n++; score.total++;
      var correct = parseInt(box.getAttribute("data-correct"), 10);
      var q = box.querySelector(".q");
      if (q && !q.querySelector(".qno")) q.insertAdjacentHTML("afterbegin", '<span class="qno">Question ' + n + "</span>");
      var items = box.querySelectorAll("ol.opts > li");
      var verdict = document.createElement("div");
      verdict.className = "verdict";
      var why = box.querySelector(".why");
      if (why) box.insertBefore(verdict, why); else box.appendChild(verdict);
      items.forEach(function (li, k) {
        li.setAttribute("tabindex", "0");
        li.setAttribute("role", "button");
        function pick() {
          if (box.classList.contains("answered")) return;
          box.classList.add("answered");
          var ok = (k + 1) === correct;
          items[correct - 1].classList.add("right");
          if (!ok) li.classList.add("wrong");
          verdict.className = "verdict " + (ok ? "ok" : "no");
          verdict.textContent = ok ? "Correct." : "Not quite. The right answer is " + String.fromCharCode(64 + correct) + ".";
          score.tried++; if (ok) score.right++;
          updateScore();
        }
        li.addEventListener("click", pick);
        li.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); } });
      });
    });
  }

  // ---------- numeric ----------
  function parseNum(s) { return parseFloat(String(s).replace(/,/g, "").replace(/\s/g, "")); }
  function nums() {
    var n = 0;
    document.querySelectorAll(".num").forEach(function (box) {
      n++; score.total++;
      var ans = parseFloat(box.getAttribute("data-answer"));
      var tol = parseFloat(box.getAttribute("data-tol") || "2");
      var unit = box.getAttribute("data-unit") || "";
      var q = box.querySelector(".q");
      if (q && !q.querySelector(".qno")) q.insertAdjacentHTML("afterbegin", '<span class="qno">Calculate</span>');
      var entry = document.createElement("div");
      entry.className = "entry";
      entry.innerHTML = '<input type="text" inputmode="decimal" aria-label="Your answer" placeholder="your answer"> <span>' + unit + '</span> <button class="btn" type="button">Check</button>';
      var fb = document.createElement("div");
      fb.className = "fb";
      var sol = box.querySelector("details.sol");
      if (sol) { box.insertBefore(entry, sol); box.insertBefore(fb, sol); }
      else { box.appendChild(entry); box.appendChild(fb); }
      if (sol && !sol.querySelector("summary")) sol.insertAdjacentHTML("afterbegin", "<summary>Worked solution (try first)</summary>");
      var input = entry.querySelector("input"), btn = entry.querySelector("button");
      var tries = 0;
      function check() {
        var v = parseNum(input.value);
        if (isNaN(v)) { fb.className = "fb no"; fb.textContent = "Type a number first."; return; }
        tries++;
        var err = ans === 0 ? Math.abs(v) : Math.abs(v - ans) / Math.abs(ans) * 100;
        var ok = err <= tol;
        if (tries === 1) { score.tried++; if (ok) score.right++; updateScore(); }
        if (ok) {
          fb.className = "fb ok";
          fb.textContent = "✓ Correct. Expected about " + fmt(ans) + " " + unit + (err > 0.05 ? " (you are " + err.toFixed(1) + "% off, within rounding)" : "") + ".";
          box.classList.add("solved");
        } else {
          fb.className = "fb no";
          var dir = v > ans ? "too high" : "too low";
          fb.textContent = "✗ Not yet: " + dir + " by " + err.toFixed(0) + "%. " + (tries >= 2 ? "Open the worked solution and find the step where you went off." : "Recheck units and the formula, then try again.");
          if (tries >= 2 && sol) sol.open = true;
        }
      }
      btn.addEventListener("click", check);
      input.addEventListener("keydown", function (e) { if (e.key === "Enter") check(); });
    });
  }
  function fmt(x) {
    var a = Math.abs(x);
    if (a >= 1000) return x.toLocaleString("en-IN", { maximumFractionDigits: 0 });
    if (a >= 100) return x.toFixed(1);
    if (a >= 10) return x.toFixed(2);
    return x.toPrecision(3);
  }

  // ---------- step reveal ----------
  function steps() {
    document.querySelectorAll("ol.steps").forEach(function (ol) {
      var items = Array.prototype.slice.call(ol.children);
      if (items.length < 2) return;
      items.forEach(function (li, k) { if (k > 0) li.classList.add("hidden"); });
      var ctl = document.createElement("div");
      ctl.className = "step-ctl";
      ctl.innerHTML = '<button class="btn" type="button"></button><button class="btn ghost" type="button">Show all steps</button>';
      ol.parentNode.insertBefore(ctl, ol.nextSibling);
      var nextBtn = ctl.children[0], allBtn = ctl.children[1];
      function left() { return ol.querySelectorAll("li.hidden").length; }
      function label() {
        var l = left();
        if (!l) { ctl.style.display = "none"; return; }
        nextBtn.textContent = "Predict, then show next step (" + l + " left)";
      }
      label();
      nextBtn.addEventListener("click", function () { var h = ol.querySelector("li.hidden"); if (h) h.classList.remove("hidden"); label(); });
      allBtn.addEventListener("click", function () { ol.querySelectorAll("li.hidden").forEach(function (li) { li.classList.remove("hidden"); }); label(); });
    });
  }

  // ---------- calculators ----------
  var MATHFN = "var rad=function(d){return d*Math.PI/180}, deg=function(r){return r*180/Math.PI}," +
    "sin=Math.sin,cos=Math.cos,tan=Math.tan,asin=Math.asin,acos=Math.acos,atan=Math.atan,atan2=Math.atan2," +
    "sqrt=Math.sqrt,cbrt=Math.cbrt,pow=Math.pow,exp=Math.exp,ln=Math.log,log10=Math.log10,abs=Math.abs," +
    "min=Math.min,max=Math.max,PI=Math.PI,pi=Math.PI,e=Math.E;";
  function calcs() {
    document.querySelectorAll(".calc").forEach(function (box) {
      var inputs = box.querySelectorAll("input[data-v]");
      var outs = box.querySelectorAll("output[data-expr]");
      var names = Array.prototype.map.call(inputs, function (i) { return i.getAttribute("data-v"); });
      var fns = Array.prototype.map.call(outs, function (o) {
        try { return new Function(names.join(","), MATHFN + "return (" + o.getAttribute("data-expr") + ");"); }
        catch (e) { return function () { return NaN; }; }
      });
      function run() {
        var vals = Array.prototype.map.call(inputs, function (i) { return parseNum(i.value); });
        outs.forEach(function (o, k) {
          var v; try { v = fns[k].apply(null, vals); } catch (e) { v = NaN; }
          var dp = o.getAttribute("data-dp");
          var txt;
          if (typeof v === "string") txt = v;
          else if (typeof v === "boolean") txt = v ? (o.getAttribute("data-true") || "yes") : (o.getAttribute("data-false") || "no");
          else if (!isFinite(v)) txt = "—";
          else txt = dp !== null ? v.toFixed(parseInt(dp, 10)) : fmt(v);
          o.innerHTML = (o.getAttribute("data-label") || "") + " <b>" + txt + "</b> " + (o.getAttribute("data-unit") || "");
        });
      }
      inputs.forEach(function (i) { i.addEventListener("input", run); });
      run();
    });
  }

  // ---------- printing: show everything ----------
  window.addEventListener("beforeprint", function () {
    document.querySelectorAll("details").forEach(function (d) { d.setAttribute("data-was", d.open ? "1" : "0"); d.open = true; });
  });
  window.addEventListener("afterprint", function () {
    document.querySelectorAll("details[data-was]").forEach(function (d) { d.open = d.getAttribute("data-was") === "1"; });
  });

  // ---------- KaTeX ----------
  function katex() {
    var css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css";
    document.head.appendChild(css);
    var s1 = document.createElement("script");
    s1.src = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js";
    s1.onload = function () {
      var s2 = document.createElement("script");
      s2.src = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js";
      s2.onload = function () {
        if (window.renderMathInElement) {
          window.renderMathInElement(document.body, {
            delimiters: [
              { left: "\\[", right: "\\]", display: true },
              { left: "\\(", right: "\\)", display: false }
            ],
            throwOnError: false,
            ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code", "input"]
          });
        }
      };
      document.head.appendChild(s2);
    };
    document.head.appendChild(s1);
  }

  // ---------- index page: fill the syllabus map ----------
  function indexPage() {
    var host = document.getElementById("course-map");
    if (!host) return;
    var html = "";
    C.units.forEach(function (u) {
      html += '<section class="unit-card"><p class="kicker">Unit ' + u.n + "</p><h3>" + u.title + "</h3>";
      html += '<p class="syl">' + u.syllabus + "</p><ol class=\"lessons\">";
      C.lessons.filter(function (l) { return l.unit === u.n; }).forEach(function (l) {
        var p = progress[l.id];
        if (!isBuilt(l)) {
          html += '<li><span class="lno">' + l.id + '</span><span class="muted">' + l.title + '</span><span class="pg">planned</span></li>';
          return;
        }
        html += '<li><span class="lno">' + l.id + '</span><a href="' + lessonURL(l) + '">' + l.title + "</a>" +
          (p && p.done ? '<span class="done">✓ done' + (p.best ? " · " + p.best + "%" : "") + "</span>" : "") +
          (l.pages ? '<span class="pg">Bh. pp. ' + l.pages + "</span>" : "") + "</li>";
      });
      html += "</ol>";
      var refEntry = (C.references || []).filter(function (r) { return r.file === u.ref; })[0];
      if (u.ref && !(refEntry && refEntry.planned)) html += '<p class="small" style="margin:10px 0 0"><a href="reference/' + u.ref + '">Unit ' + u.n + " formula and procedure sheet →</a></p>";
      html += "</section>";
    });
    host.innerHTML = html;
    var count = C.lessons.filter(function (l) { return progress[l.id] && progress[l.id].done; }).length;
    var built = C.lessons.filter(isBuilt).length;
    var pc = document.getElementById("progress-count");
    if (pc) pc.textContent = count + " of " + built + " written lessons marked complete (" + (C.lessons.length - built) + " more planned)";
    var refs = document.getElementById("ref-list");
    if (refs) refs.innerHTML = (C.references || []).filter(function (r) { return !r.planned; }).map(function (r) {
      return '<li><a href="reference/' + r.file + '">' + r.title + "</a></li>";
    }).join("");
  }

  function init() {
    syncPortal();
    wireLinks();
    chrome();
    mcqs();
    nums();
    steps();
    calcs();
    indexPage();
    katex();
    updateScore();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
