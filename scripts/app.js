(() => {
  const app = document.querySelector("#app");

  let loadingScreen;
  let homeScreen;
  let questionScreen;
  let transmissionScreen;

  let transmissionTimer = null;

  function initializeScreens() {
    loadingScreen = window.UnknownMessageLoading.createLoadingScreen();
    homeScreen = window.UnknownMessageHome.createHomeScreen();
    questionScreen = window.UnknownMessageQuestion.createQuestionScreen();
    transmissionScreen =
      window.UnknownMessageTransmission.createTransmissionScreen();

    app.append(
      loadingScreen,
      homeScreen,
      questionScreen,
      transmissionScreen
    );
  }

  function getSettings() {
    return window.UnknownMessageStorage.loadSettings();
  }

  function beginLoading() {
    window.UnknownMessageRouter.setInitialScreen(loadingScreen);

    window.setTimeout(() => {
      window.UnknownMessageRouter.showScreen(homeScreen, "home-reveal");
    }, 4700);
  }

  function openQuestionScreen() {
    const settings = getSettings();

    window.UnknownMessageQuestion.updateQuestionScreenSettings(
      questionScreen,
      settings
    );

    window.UnknownMessageRouter.showScreen(questionScreen, "question-unfold");
  }

  function openHomeScreen() {
    stopTransmissionTimer();
    window.UnknownMessageRouter.showScreen(homeScreen, "screen-enter");
  }

  function beginTransmission(questionData) {
    const question = window.UnknownMessageState.setActiveQuestion(questionData);
    const settings = getSettings();

    window.UnknownMessageStorage.addRecentTarget(question.targetName);

    window.UnknownMessageTransmission.populateTransmissionScreen(
      transmissionScreen,
      question,
      settings
    );

    runSendTransition(() => {
      window.UnknownMessageRouter.showScreen(
        transmissionScreen,
        "transmission-arrive"
      );

      window.setTimeout(() => {
        startTransmissionTimer(settings.responseWindowSeconds);
      }, 300);
    });
  }

  function runSendTransition(onFinished) {
    const sheet = questionScreen.querySelector(".question-sheet");
    const overlay = document.createElement("div");

    overlay.className = "send-transition-overlay";
    overlay.innerHTML = `
      <div class="transition-sheet-echo"></div>
      <div class="transition-signal-slot"></div>
      <div class="transition-darkness"></div>
    `;

    document.body.appendChild(overlay);

    /*
      阶段 A：封缄
    */
    sheet.classList.add("is-sealing");
    overlay.classList.add("is-active");

    /*
      阶段 B：纸面折叠、内容编码、收束为光带
    */
    window.setTimeout(() => {
      sheet.classList.add("is-folding");
      overlay.classList.add("is-folding");
    }, 300);

    /*
      阶段 C：光带入槽，整体曝光降低
    */
    window.setTimeout(() => {
      overlay.classList.add("is-consuming");
    }, 920);

    window.setTimeout(() => {
      questionScreen.hidden = true;
      sheet.classList.remove("is-sealing", "is-folding");

      overlay.remove();
      onFinished();
    }, 1480);
  }

  function startTransmissionTimer(totalSeconds) {
    stopTransmissionTimer();

    const startedAt = Date.now();
    const totalMilliseconds = totalSeconds * 1000;

    window.UnknownMessageState.setActiveTransmission({
      startedAt,
      totalSeconds
    });

    function tick() {
      const elapsed = Date.now() - startedAt;
      const remainingMilliseconds = Math.max(
        0,
        totalMilliseconds - elapsed
      );

      const ratio = remainingMilliseconds / totalMilliseconds;
      const remainingSeconds = Math.ceil(remainingMilliseconds / 1000);

      window.UnknownMessageTransmission.updateTransmissionProgress(
        transmissionScreen,
        ratio,
        remainingSeconds
      );

      if (remainingMilliseconds <= 0) {
        stopTransmissionTimer();

        /*
          注意：
          此处只标记“等待窗口结束”。
          后续会接入独立的 fallback handler。
          不会在倒计时到 0 的这里临时生成、拼接或篡改回复。
        */
        window.UnknownMessageTransmission.setTransmissionStatus(
          transmissionScreen,
          "等待窗口已结束"
        );

        console.log(
          "等待窗口结束：后续由独立的默认回音处理器处理。"
        );
      }
    }

    tick();
    transmissionTimer = window.setInterval(tick, 250);
  }

  function stopTransmissionTimer() {
    if (transmissionTimer) {
      window.clearInterval(transmissionTimer);
      transmissionTimer = null;
    }
  }

  function bindAppEvents() {
    app.addEventListener("home:open-question", openQuestionScreen);

    app.addEventListener("home:open-settings", () => {
      /*
        设置页组件完成后从这里进入。
        数据层已在 storage.js 中准备好。
      */
      console.log("待接入设置页。");
    });

    app.addEventListener("question:back", openHomeScreen);

    app.addEventListener("question:submit", (event) => {
      beginTransmission(event.detail);
    });

    app.addEventListener("transmission:cancel", () => {
      stopTransmissionTimer();
      window.UnknownMessageState.clearActiveTransmission();

      window.UnknownMessageRouter.showScreen(
        questionScreen,
        "question-unfold"
      );
    });
  }

  function initialize() {
    initializeScreens();
    bindAppEvents();
    beginLoading();
  }

  initialize();
})();

