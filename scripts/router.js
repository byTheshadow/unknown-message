(() => {
  const screenIds = {
    home: "home-screen",
    question: "question-screen",
    transmission: "transmission-screen",
    settings: "settings-screen"
  };

  let currentRoute = "home";
  let isTransitioning = false;

  function getScreen(routeName) {
    const screenId = screenIds[routeName];
    return document.getElementById(screenId);
  }

  function showRoute(routeName) {
    if (!screenIds[routeName]) {
      console.warn(`不存在的页面路由：${routeName}`);
      return;
    }

    if (routeName === currentRoute || isTransitioning) {
      return;
    }

    const currentScreen = getScreen(currentRoute);
    const nextScreen = getScreen(routeName);

    isTransitioning = true;

    if (currentScreen) {
      currentScreen.classList.remove("is-entering");
      currentScreen.classList.add("is-leaving");
    }

    window.setTimeout(() => {
      if (currentScreen) {
        currentScreen.hidden = true;
        currentScreen.classList.remove("is-leaving");
      }

      nextScreen.hidden = false;
      nextScreen.classList.remove("is-leaving");

      /*
        重新赋予 entering 类，确保回到同一页面时动画仍然能播放。
      */
      requestAnimationFrame(() => {
        nextScreen.classList.add("is-entering");
      });

      currentRoute = routeName;
      isTransitioning = false;
    }, 280);
  }

  window.UnknownMessageRouter = {
    showRoute,
    getCurrentRoute: () => currentRoute
  };
})();
