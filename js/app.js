(() => {
  "use strict";

  const loadingScreen = document.querySelector("#loadingScreen");
  const homeScreen = document.querySelector("#homeScreen");
  const loadingClock = document.querySelector("#loadingClock");

  if (!loadingScreen || !homeScreen) {
    return;
  }

  /*
    使用 sessionStorage：
    - 本次 WebView / 浏览器会话第一次进入：播放加载动画；
    - 从提问箱或设置页返回主页：直接进入主页；
    - WebView / 浏览器会话被完全关闭后：下次重新进入会再次播放。

    不使用 localStorage，避免用户以后每一次重新打开应用都永久跳过启动动画。
  */
  const BOOT_SESSION_KEY = "unknown-message.booted-in-session";

  function showHomeImmediately() {
    loadingScreen.classList.add("is-hidden");
    homeScreen.classList.remove("is-hidden");
    homeScreen.classList.add("is-entering");
  }

  function hasBootedInCurrentSession() {
    try {
      return sessionStorage.getItem(BOOT_SESSION_KEY) === "true";
    } catch {
      /*
        如果沙箱不支持 sessionStorage：
        保持原本加载逻辑，不影响正常使用。
      */
      return false;
    }
  }

  function markCurrentSessionAsBooted() {
    try {
      sessionStorage.setItem(BOOT_SESSION_KEY, "true");
    } catch {
      /* 忽略存储不可用的情况。 */
    }
  }

  /*
    从提问箱 / 设置页回到 index.html 时，不再播放 loading。
  */
  if (hasBootedInCurrentSession()) {
    showHomeImmediately();
    return;
  }

  const startTime = performance.now();
  const loadingDuration = 4200;

  function formatClock(milliseconds) {
    const elapsed = Math.floor(milliseconds / 1000);

    const hours = String(Math.floor(elapsed / 3600)).padStart(2, "0");
    const minutes = String(
      Math.floor((elapsed % 3600) / 60)
    ).padStart(2, "0");
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
    /*
      在加载完成的一刻记录本会话已启动。
      后续页面跳转回主页将直接展示 homeScreen。
    */
    markCurrentSessionAsBooted();

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
