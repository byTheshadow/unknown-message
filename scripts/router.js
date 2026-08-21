(() => {
  let currentScreen = null;
  let isNavigating = false;

  function showScreen(nextScreen, animationName = "screen-enter") {
    if (!nextScreen || nextScreen === currentScreen || isNavigating) {
      return;
    }

    isNavigating = true;

    if (!currentScreen) {
      nextScreen.hidden = false;
      nextScreen.classList.add(animationName);

      requestAnimationFrame(() => {
        nextScreen.classList.remove(animationName);
      });

      currentScreen = nextScreen;
      isNavigating = false;
      return;
    }

    currentScreen.classList.add("screen-exit");

    window.setTimeout(() => {
      currentScreen.hidden = true;
      currentScreen.classList.remove("screen-exit");

      nextScreen.hidden = false;
      nextScreen.classList.add(animationName);

      requestAnimationFrame(() => {
        nextScreen.classList.remove(animationName);
      });

      currentScreen = nextScreen;
      isNavigating = false;
    }, 260);
  }

  function setInitialScreen(screen) {
    currentScreen = screen;
    screen.hidden = false;
  }

  window.UnknownMessageRouter = {
    showScreen,
    setInitialScreen,
    getCurrentScreen: () => currentScreen
  };
})();
