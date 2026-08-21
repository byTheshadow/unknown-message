(() => {
  function createTransmissionScreen() {
    const screen = document.createElement("main");

    screen.id = "transmission-screen";
    screen.className = "screen transmission-screen";
    screen.hidden = true;

    screen.innerHTML = `
      <div class="transmission-background" aria-hidden="true">
        <div class="transmission-veil veil-one"></div>
        <div class="transmission-veil veil-two"></div>
        <div class="transmission-grain"></div>
      </div>

      <header class="page-header transmission-header">
        <button
          class="round-icon-button transmission-close-button"
          type="button"
          data-action="cancel-transmission"
          aria-label="结束等待"
        >
          <img src="./assets/icons/close.svg" alt="" />
        </button>

        <div class="page-brand">
          <span class="page-brand-cn">未读信号</span>
          <span class="page-brand-en">OUTGOING MESSAGE</span>
        </div>

        <span class="page-number" id="transmission-number">01</span>
      </header>

      <section class="transmission-layout">
        <div class="signal-space" aria-hidden="true">
          <span class="mist-ring mist-ring-one"></span>
          <span class="mist-ring mist-ring-two"></span>
          <span class="mist-ring mist-ring-three"></span>

          <span class="signal-point">
            <i></i>
          </span>

          <span class="signal-fragment fragment-one"></span>
          <span class="signal-fragment fragment-two"></span>
          <span class="signal-fragment fragment-three"></span>
        </div>

        <div class="transmission-title-block">
          <p class="micro-label">DELIVERY CONFIRMED</p>
          <h1>已送达</h1>
          <p id="transmission-status-text">等待回复中</p>
        </div>

        <article class="delivered-question-card">
          <div class="delivered-card-meta">
            <span>TO</span>
            <span id="delivered-target-name">—</span>
          </div>

          <div class="delivered-card-rule"></div>

          <p id="delivered-question-text" class="delivered-question-text">—</p>
        </article>

        <section class="reply-window" aria-label="回复等待时间">
          <div class="reply-window-top">
            <span>REPLY WINDOW</span>
            <strong id="reply-countdown">05:00</strong>
          </div>

          <div
            id="reply-tick-track"
            class="reply-tick-track"
            aria-hidden="true"
          ></div>

          <p>回复可能在此时间内的任意时刻抵达</p>
        </section>
      </section>

      <footer class="page-footer transmission-footer">
        <span id="transmission-channel-state">CHANNEL / OPEN</span>
        <span>PLEASE KEEP OPEN</span>
      </footer>
    `;

    screen
      .querySelector('[data-action="cancel-transmission"]')
      .addEventListener("click", () => {
        screen.dispatchEvent(
          new CustomEvent("transmission:cancel", {
            bubbles: true
          })
        );
      });

    return screen;
  }

  function createTicks(screen, totalSeconds) {
    const track = screen.querySelector("#reply-tick-track");

    /*
      刻度数量只负责视觉表达，避免 15 分钟生成 900 个 DOM 节点。
      30 至 15 分钟始终控制在 30~72 个刻度之间。
    */
    const tickCount = Math.min(72, Math.max(30, Math.ceil(totalSeconds / 10)));

    track.innerHTML = "";

    for (let index = 0; index < tickCount; index += 1) {
      const tick = document.createElement("i");
      tick.className = "reply-tick";
      track.appendChild(tick);
    }

    return track.querySelectorAll(".reply-tick");
  }

  function populateTransmissionScreen(screen, question, settings) {
    screen.querySelector("#delivered-target-name").textContent =
      question.targetName;

    screen.querySelector("#delivered-question-text").textContent =
      question.questionText;

    screen.querySelector("#reply-countdown").textContent =
      window.UnknownMessageTime.formatDuration(settings.responseWindowSeconds);

    createTicks(screen, settings.responseWindowSeconds);
  }

  function updateTransmissionProgress(screen, ratio, remainingSeconds) {
    const countdown = screen.querySelector("#reply-countdown");
    const ticks = screen.querySelectorAll(".reply-tick");

    countdown.textContent =
      window.UnknownMessageTime.formatDuration(remainingSeconds);

    const completedTicks = Math.floor((1 - ratio) * ticks.length);

    ticks.forEach((tick, index) => {
      tick.classList.toggle("is-dimmed", index < completedTicks);
    });
  }

  function setTransmissionStatus(screen, text) {
    screen.querySelector("#transmission-status-text").textContent = text;
  }

  window.UnknownMessageTransmission = {
    createTransmissionScreen,
    populateTransmissionScreen,
    updateTransmissionProgress,
    setTransmissionStatus
  };
})();
