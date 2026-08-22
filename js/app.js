(() => {
  "use strict";

  const loadingScreen = document.querySelector("#loadingScreen");
  const homeScreen = document.querySelector("#homeScreen");
  const loadingClock = document.querySelector("#loadingClock");

  if (!loadingScreen || !homeScreen) {
    return;
  }

  const startTime = performance.now();
  const loadingDuration = 4200;

  function formatClock(milliseconds) {
    const elapsed = Math.floor(milliseconds / 1000);

    const hours = String(Math.floor(elapsed / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((elapsed % 3600) / 60)).padStart(2, "0");
    const seconds = String(elapsed % 60).padStart(2, "0");

    return `${hours}:${minutes}:${seconds}`;
  }

  function updateLoadingClock(now) {
    if (loadingClock) {
      loadingClock.textContent = formatClock(now - startTime);
    }

    if (now - startTime < loadingDuration) {
      window.requestAnimationFrame(updateLoadingClock);
    }
  }

  function enterHome() {
    loadingScreen.classList.add("is-leaving");

    window.setTimeout(() => {
      loadingScreen.classList.add("is-hidden");
      homeScreen.classList.remove("is-hidden");
      homeScreen.classList.add("is-entering");
    }, 800);
  }

  window.requestAnimationFrame(updateLoadingClock);
  window.setTimeout(enterHome, loadingDuration);
})();
