// Force landing page: the film plays muted and looped (it has no sound; with reduced motion it waits for a click),
// and the copy buttons.
(function () {
  var film = document.getElementById("film");
  var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (film) {
    if (still) {
      film.controls = true;               // nothing moves until asked
    } else {
      var p = film.play();
      if (p && p.catch) p.catch(function () { film.controls = true; });
    }
  }

  document.querySelectorAll(".copy").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var el = document.getElementById(btn.getAttribute("data-copy"));
      var text = el.textContent.replace(/^\$\s*/, "");
      if (!navigator.clipboard) return;
      navigator.clipboard.writeText(text).then(function () {
        btn.textContent = "Copied";
        setTimeout(function () { btn.textContent = "Copy"; }, 1600);
      }, function () {});
    });
  });
})();
