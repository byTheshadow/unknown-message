(() => {
  "use strict";

  const loadingScreen = document.querySelector("#loadingScreen");
  const homeScreen = document.querySelector("#homeScreen");
  const questionPage = document.querySelector("#questionPage");
  const settingsPage = document.querySelector("#settingsPage");
  const loadingClock = document.querySelector("#loadingClock");

  if (!loadingScreen || !homeScreen) {
    return;
  }

  // ===== 单页面 (SPA) 路由切换控制器 =====
  function navigateTo(targetPage) {
    // 隐藏所有页面视图
    [homeScreen, questionPage, settingsPage].forEach(page => {
      if (page) {
        page.classList.add("is-hidden");
        page.classList.remove("is-entering");
      }
    });

    // 显示目标视图
    if (targetPage === "home" && homeScreen) {
      homeScreen.classList.remove("is-hidden");
      homeScreen.classList.add("is-entering");
    } else if (targetPage === "question" && questionPage) {
      questionPage.classList.remove("is-hidden");
      questionPage.classList.add("is-entering");
    } else if (targetPage === "settings" && settingsPage) {
      settingsPage.classList.remove("is-hidden");
      settingsPage.classList.add("is-entering");
    }
  }

  // 绑定页面切换按钮事件
  function initRouterEvents() {
    // 1. 首页 -> 提问箱
    const btnToQuestion = document.querySelector("#btnToQuestion");
    if (btnToQuestion) {
      btnToQuestion.addEventListener("click", (e) => {
        e.preventDefault();
        navigateTo("question");
      });
    }

    // 2. 首页 -> 设置页
    const btnToSettings = document.querySelector("#btnToSettings");
    if (btnToSettings) {
      btnToSettings.addEventListener("click", (e) => {
        e.preventDefault();
        navigateTo("settings");
      });
    }

    // 3. 提问箱 -> 返回首页
    const btnQuestionBack = document.querySelector("#btnQuestionBack");
    if (btnQuestionBack) {
      btnQuestionBack.addEventListener("click", (e) => {
        e.preventDefault();
        navigateTo("home");
      });
    }

    // 4. 设置页 -> 返回首页
    const btnSettingsBack = document.querySelector("#btnSettingsBack");
    if (btnSettingsBack) {
      btnSettingsBack.addEventListener("click", (e) => {
        e.preventDefault();
        navigateTo("home");
      });
    }

    // 5. 提问箱 -> 设置页（点击回复上限链接）
    const waitSettingLink = document.querySelector("#waitSettingLink");
    if (waitSettingLink) {
      waitSettingLink.addEventListener("click", (e) => {
        e.preventDefault();
        navigateTo("settings");
      });
    }
  }

  // 初始化路由事件监听
  initRouterEvents();

  // ===== 原有 Launch Animation & Session 存储逻辑 =====
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
      return false;
    }
  }

  function markCurrentSessionAsBooted() {
    try {
      sessionStorage.setItem(BOOT_SESSION_KEY, "true");
    } catch {
      /* 忽略存储不可用的情况 */
    }
  }

  if (hasBootedInCurrentSession()) {
    showHomeImmediately();
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
