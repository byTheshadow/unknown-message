(() => {
  const loadingScreen = document.querySelector("#loading-screen");
  const homeScreen = document.querySelector("#home-screen");
  const loadingTime = document.querySelector("#loading-time");

  const LOADING_DURATION = 4800;
  const startedAt = Date.now();

  function formatLoadingTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);

    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const minutes = String(
      Math.floor((totalSeconds % 3600) / 60)
    ).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");

    return `${hours}:${minutes}:${seconds}`;
  }

  function updateLoadingTime() {
    const elapsed = Date.now() - startedAt;
    loadingTime.textContent = formatLoadingTime(elapsed);
  }

  const clockTimer = window.setInterval(updateLoadingTime, 100);

  function enterHome() {
    window.clearInterval(clockTimer);

    loadingScreen.classList.add("is-leaving");

    window.setTimeout(() => {
      loadingScreen.hidden = true;
      homeScreen.hidden = false;
      homeScreen.classList.add("is-visible");
    }, 760);
  }

  window.setTimeout(enterHome, LOADING_DURATION);

  document.querySelectorAll("[data-route]").forEach((button) => {
    button.addEventListener("click", () => {
      const routeName = button.dataset.route;

      /*
        下一步会在这里接入页面路由：
        - question: 提问箱
        - settings: 设置
      */
      console.log(`准备进入页面：${routeName}`);
    });
  });
})();
