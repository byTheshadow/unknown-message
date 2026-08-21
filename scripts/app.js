(() => {
  const loadingScreen = document.querySelector("#loading-screen");
  const homeScreen = document.querySelector("#home-screen");
  const loadingTime = document.querySelector("#loading-time");

  const questionForm = document.querySelector("#question-form");
  const targetNameInput = document.querySelector("#target-name");
  const questionTextInput = document.querySelector("#question-text");
  const questionCount = document.querySelector("#question-count");
  const formMessage = document.querySelector("#form-message");

  const currentWaitingLabel = document.querySelector("#current-waiting-label");
  const previewTargetName = document.querySelector("#preview-target-name");
  const previewQuestionText = document.querySelector("#preview-question-text");
  const waitCountdown = document.querySelector("#wait-countdown");
  const waitProgress = document.querySelector("#wait-progress");
  const transmissionIndex = document.querySelector("#transmission-index");
  const cancelTransmissionButton = document.querySelector(
    "#cancel-transmission-button"
  );

  const LOADING_DURATION = 4800;
  const startedAt = Date.now();

  let countdownTimer = null;
  let activeQuestion = null;

  function formatDuration(totalSeconds) {
    const safeSeconds = Math.max(0, Math.floor(totalSeconds));
    const minutes = String(Math.floor(safeSeconds / 60)).padStart(2, "0");
    const seconds = String(safeSeconds % 60).padStart(2, "0");

    return `${minutes}:${seconds}`;
  }

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
    loadingTime.textContent = formatLoadingTime(Date.now() - startedAt);
  }

  function getSettings() {
    return window.UnknownMessageStorage.loadSettings();
  }

  function updateWaitingLabel() {
    const { responseWindowSeconds } = getSettings();

    currentWaitingLabel.textContent =
      `WAIT LIMIT / ${formatDuration(responseWindowSeconds)}`;
  }

  function enterHome() {
    loadingScreen.classList.add("is-leaving");

    window.setTimeout(() => {
      loadingScreen.hidden = true;
      homeScreen.hidden = false;
      homeScreen.classList.add("is-visible");
      updateWaitingLabel();
    }, 760);
  }

  function setFormMessage(message = "", isError = false) {
    formMessage.textContent = message;
    formMessage.classList.toggle("is-error", isError);

    if (isError) {
      window.setTimeout(() => {
        formMessage.classList.remove("is-error");
      }, 420);
    }
  }

  function updateQuestionCount() {
    questionCount.textContent = questionTextInput.value.length;
  }

  /*
    当前函数只负责倒计时 UI。
    真正“回复抵达”的机制、纯随机抽取、时间窗内提前抵达、
    超时之后的默认回音逻辑，会在结果页与字卡数据完成后单独接入。
  */
  function startTransmissionCountdown() {
    window.clearInterval(countdownTimer);

    const { responseWindowSeconds } = getSettings();
    const startedAt = Date.now();
    const totalMilliseconds = responseWindowSeconds * 1000;

    function renderCountdown() {
      const elapsedMilliseconds = Date.now() - startedAt;
      const remainingMilliseconds = Math.max(
        0,
        totalMilliseconds - elapsedMilliseconds
      );

      const remainingSeconds = Math.ceil(remainingMilliseconds / 1000);
      const progress = remainingMilliseconds / totalMilliseconds;

      waitCountdown.textContent = formatDuration(remainingSeconds);
      waitProgress.style.transform = `scaleX(${progress})`;

      if (remainingMilliseconds <= 0) {
        window.clearInterval(countdownTimer);

        /*
          这里只结束“等待窗口”的视觉倒计时。
          后续会调用独立的结果处理器，而不是在这里临时拼接字卡。
        */
        console.log("等待窗口结束：后续接入默认回音处理器。");
      }
    }

    renderCountdown();
    countdownTimer = window.setInterval(renderCountdown, 250);
  }

  function stopTransmissionCountdown() {
    window.clearInterval(countdownTimer);
    countdownTimer = null;
  }

  function submitQuestion(event) {
    event.preventDefault();

    const targetName = targetNameInput.value.trim();
    const questionText = questionTextInput.value.trim();

    if (!targetName) {
      setFormMessage("请先填写提问对象。", true);
      targetNameInput.focus();
      return;
    }

    if (!questionText) {
      setFormMessage("请先写下想发送的问题。", true);
      questionTextInput.focus();
      return;
    }

    setFormMessage("");

    activeQuestion = {
      id: `question_${Date.now()}`,
      targetName,
      questionText,
      createdAt: new Date().toISOString()
    };

    window.UnknownMessageStorage.addRecentTarget(targetName);

    previewTargetName.textContent = targetName;
    previewQuestionText.textContent = questionText;

    /*
      目前每一次新问题显示为 01。
      对话记录页完成后，会替换为当前会话内的实际问题编号。
    */
    transmissionIndex.textContent = "01";

    window.UnknownMessageRouter.showRoute("transmission");

    window.setTimeout(() => {
      startTransmissionCountdown();
    }, 320);
  }

  function cancelTransmission() {
    stopTransmissionCountdown();
    window.UnknownMessageRouter.showRoute("question");
  }

  function bindRouteButtons() {
    document.querySelectorAll("[data-route]").forEach((button) => {
      button.addEventListener("click", () => {
        const routeName = button.dataset.route;

        if (routeName === "question") {
          updateWaitingLabel();
        }

        window.UnknownMessageRouter.showRoute(routeName);
      });
    });
  }

  function initialize() {
    const clockTimer = window.setInterval(updateLoadingTime, 100);

    window.setTimeout(() => {
      window.clearInterval(clockTimer);
      enterHome();
    }, LOADING_DURATION);

    questionTextInput.addEventListener("input", updateQuestionCount);
    questionForm.addEventListener("submit", submitQuestion);
    cancelTransmissionButton.addEventListener("click", cancelTransmission);

    bindRouteButtons();
    updateQuestionCount();
    updateWaitingLabel();
  }

  initialize();

  /*
    为后续“真实回复抵达 / 默认回音处理 / 结果页”暴露当前问题。
    后面的模块可以读取它，不需要重新从 DOM 解析内容。
  */
  window.UnknownMessageApp = {
    getActiveQuestion: () => activeQuestion,
    stopTransmissionCountdown
  };
})();
