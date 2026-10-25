/* Study Portal: shared interactive components.
   - .quiz       multiple choice with instant feedback
   - .numeric    numerical answer checked against data-answer ± data-tol (relative)
   - .recall     write-then-reveal retrieval practice with self-rating
   - lesson "mark as done" + per-device progress (localStorage, optional)
   - course pages: ticks + progress bar for completed lessons
   - KaTeX auto-render if loaded
   Markup contract is documented in each course's NOTES.md. */
(function () {
  "use strict";

  var store = {
    get: function (k, d) {
      try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; }
    },
    set: function (k, v) {
      try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable: fine */ }
    }
  };

  var body = document.body;
  var course = body.getAttribute("data-course") || "";
  var lesson = body.getAttribute("data-lesson") || "";
  var doneKey = "portal:" + course + ":done";
  var rateKey = "portal:" + course + ":recall";

  /* ---------- quizzes ---------- */
  var quizzes = Array.prototype.slice.call(document.querySelectorAll(".quiz"));
  var score = { right: 0, answered: 0, total: quizzes.length };
  var board = null;

  function updateBoard() {
    if (!board) return;
    board.textContent = "Quiz: " + score.right + " / " + score.answered + " correct" +
      (score.answered < score.total ? "  ·  " + (score.total - score.answered) + " left" : "  ·  done");
  }

  quizzes.forEach(function (quiz) {
    var items = Array.prototype.slice.call(quiz.querySelectorAll("ol.opts > li"));
    var fb = document.createElement("div");
    fb.className = "feedback";
    var why = quiz.querySelector(".why");
    items.forEach(function (li) {
      var correct = li.hasAttribute("data-correct");
      var b = document.createElement("button");
      b.type = "button";
      b.className = "opt";
      b.innerHTML = li.innerHTML;
      li.innerHTML = "";
      li.appendChild(b);
      b.addEventListener("click", function () {
        if (quiz.classList.contains("answered")) return;
        quiz.classList.add("answered");
        score.answered++;
        items.forEach(function (other) {
          var ob = other.querySelector("button");
          ob.disabled = true;
          if (other.hasAttribute("data-correct")) ob.classList.add("correct");
        });
        if (correct) {
          score.right++;
          fb.textContent = "Correct.";
          fb.className = "feedback good";
        } else {
          b.classList.add("wrong");
          fb.textContent = "Not quite. The right answer is highlighted in green.";
          fb.className = "feedback bad";
        }
        updateBoard();
      });
    });
    var ol = quiz.querySelector("ol.opts");
    ol.parentNode.insertBefore(fb, why || ol.nextSibling);
  });

  if (quizzes.length) {
    board = document.createElement("div");
    board.className = "scoreboard";
    var anchor = document.querySelector("[data-scoreboard]") || quizzes[quizzes.length - 1];
    anchor.parentNode.insertBefore(board, anchor.nextSibling);
    updateBoard();
  }

  /* ---------- numeric answers ---------- */
  function parseNum(s) {
    s = String(s).trim().replace(/,/g, "").replace(/\s+/g, "")
      .replace(/[×x]10\^?/i, "e").replace(/\*10\^/, "e");
    var n = Number(s);
    return isFinite(n) ? n : NaN;
  }

  Array.prototype.slice.call(document.querySelectorAll(".numeric")).forEach(function (box) {
    var answer = parseFloat(box.getAttribute("data-answer"));
    var tol = parseFloat(box.getAttribute("data-tol") || "0.03");
    var unit = box.getAttribute("data-unit") || "";
    var tries = 0;
    var row = document.createElement("div");
    row.className = "row";
    var input = document.createElement("input");
    input.type = "text";
    input.inputMode = "decimal";
    input.placeholder = "your answer";
    input.setAttribute("aria-label", "Your answer" + (unit ? " in " + unit : ""));
    var u = document.createElement("span");
    u.className = "unit";
    u.textContent = unit;
    var check = document.createElement("button");
    check.type = "button";
    check.className = "btn";
    check.textContent = "Check";
    var show = document.createElement("button");
    show.type = "button";
    show.className = "btn ghost";
    show.textContent = "Show solution";
    var fb = document.createElement("div");
    fb.className = "feedback";
    row.appendChild(input);
    row.appendChild(u);
    row.appendChild(check);
    row.appendChild(show);
    var sol = box.querySelector(".solution");
    box.insertBefore(row, sol);
    box.insertBefore(fb, sol);

    function reveal() { box.classList.add("revealed"); }
    function doCheck() {
      var v = parseNum(input.value);
      if (isNaN(v)) { fb.textContent = "Enter a number (e.g. 29.3 or 1.6e6)."; fb.className = "feedback bad"; return; }
      tries++;
      var ok = answer === 0 ? Math.abs(v) < 1e-12 : Math.abs(v - answer) / Math.abs(answer) <= tol;
      if (ok) {
        fb.textContent = "Correct. Compare your working with the solution.";
        fb.className = "feedback good";
        reveal();
      } else {
        var ratio = v / answer;
        var hint = "";
        if (ratio > 0 && (Math.abs(Math.log10(ratio) - Math.round(Math.log10(ratio))) < 0.02) && Math.round(Math.log10(ratio)) !== 0) {
          hint = " Your digits look right but the power of ten is off. Check unit conversions.";
        } else {
          hint = v > answer ? " Too high." : " Too low.";
        }
        fb.textContent = "Not yet." + hint + (tries >= 2 ? " The solution is open below." : " Try once more.");
        fb.className = "feedback bad";
        if (tries >= 2) reveal();
      }
    }
    check.addEventListener("click", doCheck);
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") doCheck(); });
    show.addEventListener("click", reveal);
  });

  /* ---------- recall (write, then reveal) ---------- */
  var ratings = store.get(rateKey, {});
  Array.prototype.slice.call(document.querySelectorAll(".recall")).forEach(function (box, i) {
    var id = box.getAttribute("data-id") || (lesson + "-r" + i);
    var model = box.querySelector(".model");
    var ta = document.createElement("textarea");
    ta.placeholder = box.getAttribute("data-placeholder") || "Write your answer from memory first: keywords, bullet points or a rough sketch description. Then reveal.";
    var row = document.createElement("div");
    row.className = "row";
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn";
    btn.textContent = "Reveal model answer";
    row.appendChild(btn);
    var rate = document.createElement("div");
    rate.className = "rate";
    rate.innerHTML = "<span>How did you do?</span>";
    ["Nailed it", "Partly", "Missed it"].forEach(function (label) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = label;
      if (ratings[id] === label) b.classList.add("on");
      b.addEventListener("click", function () {
        Array.prototype.forEach.call(rate.querySelectorAll("button"), function (x) { x.classList.remove("on"); });
        b.classList.add("on");
        ratings[id] = label;
        store.set(rateKey, ratings);
      });
      rate.appendChild(b);
    });
    box.insertBefore(ta, model);
    box.insertBefore(row, model);
    box.appendChild(rate);
    btn.addEventListener("click", function () {
      box.classList.add("revealed");
      btn.disabled = true;
    });
  });

  /* ---------- lesson done ---------- */
  var done = store.get(doneKey, []);
  var slot = document.querySelector("[data-done-slot]");
  if (slot && lesson) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "btn";
    function paint() {
      var isDone = done.indexOf(lesson) !== -1;
      b.textContent = isDone ? "✓ Lesson done (tap to undo)" : "Mark lesson as done";
      b.classList.toggle("isdone", isDone);
    }
    b.addEventListener("click", function () {
      var k = done.indexOf(lesson);
      if (k === -1) done.push(lesson); else done.splice(k, 1);
      store.set(doneKey, done);
      paint();
    });
    paint();
    slot.appendChild(b);
  }

  /* ---------- course page ticks ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll("[data-lesson-link]"));
  if (links.length) {
    var count = 0;
    links.forEach(function (li) {
      if (done.indexOf(li.getAttribute("data-lesson-link")) !== -1) { li.classList.add("is-done"); count++; }
    });
    var bar = document.querySelector("[data-progress]");
    if (bar) {
      bar.querySelector("div").style.width = Math.round(100 * count / links.length) + "%";
      var label = document.querySelector("[data-progress-label]");
      if (label) label.textContent = count + " of " + links.length + " lessons done on this device";
    }
  }

  /* ---------- portal: per-course progress labels ---------- */
  Array.prototype.slice.call(document.querySelectorAll("[data-course-progress]")).forEach(function (el) {
    var c = el.getAttribute("data-course-progress");
    var total = parseInt(el.getAttribute("data-total") || "0", 10);
    var d = store.get("portal:" + c + ":done", []).length;
    if (total) el.textContent = d + " / " + total + " lessons done";
  });

  /* ---------- figures: tap to open the full-size sketch ---------- */
  Array.prototype.slice.call(document.querySelectorAll("figure .sheet img")).forEach(function (img) {
    if (img.parentNode.tagName === "A") return;
    var a = document.createElement("a");
    a.href = img.getAttribute("src");
    a.className = "zoom";
    a.target = "_blank";
    a.rel = "noopener";
    img.parentNode.insertBefore(a, img);
    a.appendChild(img);
  });

  /* ---------- KaTeX ---------- */
  function renderMath() {
    if (window.renderMathInElement) {
      window.renderMathInElement(document.body, {
        delimiters: [
          { left: "\\[", right: "\\]", display: true },
          { left: "\\(", right: "\\)", display: false }
        ],
        throwOnError: false
      });
    }
  }
  if (document.readyState === "complete") renderMath();
  else window.addEventListener("load", renderMath);
})();
