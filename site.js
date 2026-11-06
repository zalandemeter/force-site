// Force landing page: the cockpit's two screens (click a session in the sidebar), the film (plays muted while it is
// on screen; with reduced motion only when asked), and the copy buttons.
(function () {
  var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // --- the cockpit: api and billing-fix, switched from the sidebar or the header's count
  var screen = document.querySelector(".screen");
  if (screen) {
    var show = function (view) {
      screen.dataset.screen = view;
      screen.querySelectorAll(".term").forEach(function (t) { t.hidden = t.dataset.view !== view; });
      document.querySelectorAll(".hint [data-when]").forEach(function (s) { s.hidden = s.dataset.when !== view; });
      screen.querySelectorAll(".hit").forEach(function (h) {
        h.setAttribute("aria-pressed", String(h.dataset.go === view));
      });
      if (view === "billing") {
        var call = screen.querySelector(".hit.call");
        if (call) call.classList.add("seen");
      }
    };
    screen.querySelectorAll(".hit").forEach(function (h) {
      h.addEventListener("click", function () { show(h.dataset.go); });
    });
    show("api");
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
