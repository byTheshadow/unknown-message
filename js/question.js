(function () {
  "use strict";

  const form = document.querySelector("#question-form");
  const targetInput = document.querySelector("#target-name");
  const questionInput = document.querySelector("#question-content");
  const counter = document.querySelector("#question-counter");
  const message = document.querySelector("#form-message");
  const historyWrapper = document.querySelector("#target-history");
  const historyList = document.querySelector("#target-history-list");
  const durationPreview = document.querySelector("#duration-preview");

  const data = window.UnreadSignal.getData();

  durationPreview.textContent = `MAX WAIT / ${window.UnreadSignal.formatDuration(
    data.settings.durationSeconds
  )}`;

  function renderHistory() {
    const currentData = window.UnreadSignal.getData();
    const targets = currentData.recentTargets || [];

    historyList.innerHTML = "";

    if (targets.length === 0) {
      historyWrapper.hidden = true;
      return;
    }

    historyWrapper.hidden = false;

    targets.forEach((target) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "target-chip";
      button.textContent = target;

      button.addEventListener("click", () => {
        targetInput.value = target;
        targetInput.focus();
      });

      historyList.appendChild(button);
    });
  }

  function updateCounter() {
    counter.textContent = `${questionInput.value.length} / 120`;
  }

  questionInput.addEventListener("input", updateCounter);

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const targetName = targetInput.value.trim();
    const questionContent = questionInput.value.trim();

    message.textContent = "";
    message.classList.remove("is-error");

    if (!targetName) {
      message.textContent = "请先填写提问对象。";
      message.classList.add("is-error");
      targetInput.focus();
      return;
    }

    if (!questionContent) {
      message.textContent = "请先写下你的问题。";
      message.classList.add("is-error");
      questionInput.focus();
      return;
    }

    window.UnreadSignal.addRecentTarget(targetName);

    /*
      这里只保存本次问题草稿。
      下一步建立 waiting.html 后，
      将由该页面读取 pendingQuestion 并开启等待流程。
    */
    sessionStorage.setItem(
      "unread-signal-pending-question",
      JSON.stringify({
        targetName,
        questionContent,
        createdAt: Date.now()
      })
    );

    window.location.href = "./index.html";
  });

  renderHistory();
  updateCounter();
})();
