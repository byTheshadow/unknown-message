(function () {
  "use strict";

  const loadingScreen = document.querySelector("#loading-screen");
  const homeScreen = document.querySelector("#home-screen");
  const clock = document.querySelector("#loading-clock");

  const startedAt = Date.now();

  function updateClock() {
    const elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000);
    clock.textContent = window.UnreadSignal.formatDuration(elapsedSeconds);
  }

  updateClock();

  const clockTimer = window.setInterval(updateClock, 1000);

  window.setTimeout(() => {
    window.clearInterval(clockTimer);

    loadingScreen.classList.add("is-finished");
    homeScreen.classList.remove("is-hidden");
  }, 3200);
})();
