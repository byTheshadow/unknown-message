(() => {
  function createQuestionScreen() {
    const screen = document.createElement("main");

    screen.id = "question-screen";
    screen.className = "screen question-screen";
    screen.hidden = true;

    screen.innerHTML = `
      <div class="question-atmosphere" aria-hidden="true">
        <div class="question-glow question-glow-one"></div>
        <div class="question-glow question-glow-two"></div>
        <div class="question-orbit-line orbit-line-one"></div>
        <div class="question-orbit-line orbit-line-two"></div>
      </div>

      <header class="page-header question-header">
        <button
          class="round-icon-button"
          type="button"
          data-action="back-home"
          aria-label="返回主页"
        >
          <img src="./assets/icons/close.svg" alt="" />
        </button>

        <div class="page-brand">
          <span class="page-brand-cn">未读信号</span>
          <span class="page-brand-en">QUESTION BOX</span>
        </div>

        <span class="page-number" aria-hidden="true">01</span>
      </header>

      <section class="question-layout">
        <div class="question-title-block">
          <p class="micro-label">OPEN A QUESTION</p>
          <h1>提问箱</h1>
          <p class="question-title-note">
            留下一个名字，和一句想被听见的话。
          </p>
        </div>

        <form id="question-form" class="question-sheet" novalidate>
          <div class="sheet-topline" aria-hidden="true">
            <span>OUTGOING / DRAFT</span>
            <span id="sheet-date-label">LOCAL</span>
          </div>

          <label class="recipient-area" for="target-name">
            <span class="field-kicker">TO</span>

            <span class="recipient-input-wrap">
              <input
                id="target-name"
                name="targetName"
                type="text"
                maxlength="24"
                autocomplete="off"
                placeholder="输入提问对象"
                required
              />
              <span class="recipient-cursor" aria-hidden="true"></span>
            </span>
          </label>

          <div class="sheet-divider" aria-hidden="true"></div>

          <label class="message-area" for="question-text">
            <span class="field-kicker">MESSAGE</span>

            <textarea
              id="question-text"
              name="questionText"
              maxlength="200"
              rows="5"
              placeholder="在这里写下问题"
              required
            ></textarea>

            <span class="question-count">
              <span id="question-count">0</span> / 200
            </span>
          </label>

          <p
            id="question-form-message"
            class="question-form-message"
            role="status"
            aria-live="polite"
          ></p>

          <div class="sheet-bottom">
            <span class="sheet-status">NOT YET SENT</span>

            <button
              id="seal-send-button"
              class="seal-send-button"
              type="submit"
              aria-label="发送问题"
              disabled
            >
              <span class="seal-send-ring" aria-hidden="true"></span>
              <img src="./assets/icons/seal-send.svg" alt="" />
            </button>
          </div>
        </form>
      </section>

      <footer class="page-footer question-footer">
        <span>LOCAL DRAFT / PRIVATE</span>
        <span id="question-wait-limit">REPLY WINDOW / 05:00</span>
      </footer>
    `;

    bindQuestionEvents(screen);

    return screen;
  }

  function bindQuestionEvents(screen) {
    const form = screen.querySelector("#question-form");
    const targetInput = screen.querySelector("#target-name");
    const messageInput = screen.querySelector("#question-text");
    const count = screen.querySelector("#question-count");
    const sendButton = screen.querySelector("#seal-send-button");
    const message = screen.querySelector("#question-form-message");

    function updateSendState() {
      const hasTarget = targetInput.value.trim().length > 0;
      const hasMessage = messageInput.value.trim().length > 0;

      sendButton.disabled = !(hasTarget && hasMessage);
      count.textContent = messageInput.value.length;

      if (hasTarget || hasMessage) {
        message.textContent = "";
        message.classList.remove("is-error");
      }
    }

    targetInput.addEventListener("input", updateSendState);
    messageInput.addEventListener("input", updateSendState);

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const targetName = targetInput.value.trim();
      const questionText = messageInput.value.trim();

      if (!targetName || !questionText) {
        message.textContent = "请完整写下提问对象与问题。";
        message.classList.remove("is-error");

        requestAnimationFrame(() => {
          message.classList.add("is-error");
        });

        if (!targetName) {
          targetInput.focus();
        } else {
          messageInput.focus();
        }

        return;
      }

      screen.dispatchEvent(
        new CustomEvent("question:submit", {
          bubbles: true,
          detail: {
            targetName,
            questionText
          }
        })
      );
    });

    screen
      .querySelector('[data-action="back-home"]')
      .addEventListener("click", () => {
        screen.dispatchEvent(
          new CustomEvent("question:back", {
            bubbles: true
          })
        );
      });
  }

  function updateQuestionScreenSettings(screen, settings) {
    const label = screen.querySelector("#question-wait-limit");

    label.textContent =
      `REPLY WINDOW / ${window.UnknownMessageTime.formatDuration(
        settings.responseWindowSeconds
      )}`;
  }

  function resetQuestionScreen(screen) {
    const form = screen.querySelector("#question-form");
    const count = screen.querySelector("#question-count");
    const sendButton = screen.querySelector("#seal-send-button");
    const message = screen.querySelector("#question-form-message");

    form.reset();
    count.textContent = "0";
    sendButton.disabled = true;
    message.textContent = "";
    message.classList.remove("is-error");
  }

  window.UnknownMessageQuestion = {
    createQuestionScreen,
    updateQuestionScreenSettings,
    resetQuestionScreen
  };
})();
