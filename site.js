// Force landing page: the cockpit (click anything in it), the film (plays muted while it is
// on screen; with reduced motion only when asked), and the copy buttons.
(function () {
  var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // --- the cockpit: seven real screens; the screen is a grid of cells, so a click is read as (row, column) and
  // answered the way Force answers it: a session opens, a count opens the session it counts, the rest explains itself
  var screen = document.querySelector(".screen");
  var wrap = document.querySelector(".term-wrap");
  if (screen && wrap) {
    var ORDER = ["shell", "api", "billing-fix", "docs-site", "infra", "mobile", "migration-2024"];
    var SAY = {
      "shell": "A plain shell sits in the list too, with the agents.",
      "api": "api is idle: the agent finished and you have read what it said.",
      "billing-fix": "billing-fix is waiting for your permission. You answer it right here.",
      "docs-site": "docs-site finished while you were elsewhere, so it is your turn.",
      "infra": "infra has been idle for 42 minutes.",
      "mobile": "mobile is running its test suite. It keeps going with the window closed.",
      "migration-2024": "Nobody has touched migration-2024 for 30 hours, so it is marked stale.",
      "new": "+ new starts another session. From a shell, force new NAME does the same.",
      "archived": "Archived sessions wait here with their conversations, out of the list.",
      "host": "devbox is this machine. force host add NAME puts another one here, one click away.",
      "limits": "Your five-hour and weekly limits: how much is used, and when each resets.",
      "menu": "Ctrl+Space opens Force's menu: x restarts a session, a archives it.",
      "quit": "Quit closes the window. The sessions keep running; type force to come back.",
      "sidebar": "Hides the sidebar when you want the whole width for the agent."
    };
    var PILL = { "rgb(240, 100, 94)": "billing-fix", "rgb(167, 212, 173)": "docs-site", "rgb(215, 175, 95)": "mobile" };
    var ICON = { "": "sidebar", "": "menu", "": "quit" };
    var hint = document.querySelector(".hint");
    var ring = screen.querySelector(".ring");
    var call = screen.querySelector(".call");
    var current = "api";

    var shown = function () { return screen.querySelector('.term[data-view="' + current + '"]'); };
    var metrics = function () {
      var r = shown().getBoundingClientRect();
      return { x: r.left, y: r.top, cw: r.width / 150, lh: r.height / 40 };
    };
    var cellChar = function (row, col) {
      var line = shown().textContent.split("\n")[row] || "";
      return Array.from(line)[col] || " ";
    };
    var colorAt = function (m, row, col) {
      var el = document.elementFromPoint(m.x + (col + .5) * m.cw, m.y + (row + .5) * m.lh);
      return el && shown().contains(el) ? getComputedStyle(el).color : "";
    };
    // what the cell at (row, col) does, and the cells it covers: {go|say, r, c, w, h}
    var target = function (m, row, col) {
      if (col >= 1 && col < 29 && row >= 3 && row <= 16) {
        var k = (row - 3) >> 1;
        return { go: ORDER[k], r: 3 + 2 * k, c: 1, w: 28, h: 2 };
      }
      if (row === 18 && col >= 1 && col < 29) return col < 15 ? { say: "new", r: 18, c: 1, w: 13, h: 1 } : { say: "archived", r: 18, c: 15, w: 14, h: 1 };
      if (row === 35 && col >= 1 && col < 29) return { say: "host", r: 35, c: 1, w: 28, h: 1 };
      if ((row === 37 || row === 38) && col >= 1 && col < 29) return { say: "limits", r: 37, c: 1, w: 28, h: 2 };
      if (row === 1 && col >= 30) {
        var who = PILL[colorAt(m, row, col)];
        if (who) {   // the pill: the run of cells in its colour around the click
          var c0 = col, c1 = col, col0 = colorAt(m, row, col);
          while (c0 > 30 && colorAt(m, row, c0 - 1) === col0) c0--;
          while (c1 < 149 && colorAt(m, row, c1 + 1) === col0) c1++;
          return { go: who, r: 1, c: c0, w: c1 - c0 + 1, h: 1 };
        }
        for (var d = -1; d <= 1; d++) {
          var what = ICON[cellChar(row, col + d)];
          if (what) return { say: what, r: 1, c: col + d - 1, w: 3, h: 1 };
        }
      }
      return null;
    };
    var place = function (t) {
      if (!t) { ring.classList.remove("on"); return; }
      ring.style.top = "calc(" + t.r + " * var(--lh))"; ring.style.left = "calc(" + t.c + " * var(--cw))";
      ring.style.width = "calc(" + t.w + " * var(--cw))"; ring.style.height = "calc(" + t.h + " * var(--lh))";
      ring.classList.add("on");
    };
    var show = function (name) {
      current = name;
      screen.dataset.screen = name;
      screen.querySelectorAll(".term").forEach(function (t) { t.hidden = t.dataset.view !== name; });
      if (name === "billing-fix") call.classList.add("done");
    };
    var act = function (t) {
      if (!t) return;
      if (t.go) { show(t.go); hint.textContent = SAY[t.go]; }
      else hint.textContent = SAY[t.say];
    };
    var at = function (e) {
      var m = metrics();
      var col = Math.floor((e.clientX - m.x) / m.cw), row = Math.floor((e.clientY - m.y) / m.lh);
      return row >= 0 && row < 40 && col >= 0 && col < 150 ? target(m, row, col) : null;
    };
    screen.addEventListener("mousemove", function (e) {
      var t = at(e);
      screen.classList.toggle("pointing", !!t);
      place(t);
    });
    screen.addEventListener("mouseleave", function () { screen.classList.remove("pointing"); place(null); });
    screen.addEventListener("click", function (e) { act(at(e)); });
    wrap.addEventListener("keydown", function (e) {
      var k = ORDER.indexOf(current), n = e.key === "ArrowDown" ? k + 1 : e.key === "ArrowUp" ? k - 1 : -1;
      if (n < 0 || n >= ORDER.length || (e.key !== "ArrowDown" && e.key !== "ArrowUp")) return;
      e.preventDefault();
      act({ go: ORDER[n] });
      place({ r: 3 + 2 * n, c: 1, w: 28, h: 2 });
    });
  }

  // --- the film
  var film = document.getElementById("film-video");
  var btn = document.querySelector(".play");
  if (film && btn) {
    var wanted = !still;           // the visitor's choice; the observer only plays while it is in view
    var sync = function () {
      var paused = film.paused;
      btn.classList.toggle("paused", paused);
      btn.setAttribute("aria-label", paused ? "Play the film" : "Pause the film");
    };
    var play = function () { var p = film.play(); if (p && p.catch) p.catch(function () { wanted = false; sync(); }); };
    film.addEventListener("play", sync);
    film.addEventListener("pause", sync);
    btn.addEventListener("click", function () {
      wanted = film.paused;
      if (wanted) play(); else film.pause();
    });
    film.addEventListener("click", function () { btn.click(); });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting && wanted) { film.preload = "auto"; play(); }
          else if (!e.isIntersecting) film.pause();
        });
      }, { threshold: 0.35 }).observe(film);
    } else if (wanted) play();
    sync();
  }

  // --- copy buttons
  document.querySelectorAll(".copy").forEach(function (b) {
    b.addEventListener("click", function () {
      var el = document.getElementById(b.getAttribute("data-copy"));
      var text = el.textContent.replace(/^\$\s*/, "");
      if (!navigator.clipboard) return;
      navigator.clipboard.writeText(text).then(function () {
        b.textContent = "Copied";
        setTimeout(function () { b.textContent = "Copy"; }, 1600);
      }, function () {});
    });
  });
})();
