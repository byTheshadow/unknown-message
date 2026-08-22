import { cardCategories, fallbackCards } from "./data/cards.js";
import {
  clearConversation,
  getConversation,
  getSettings,
  saveConversation
} from "./utils/storage.js";

const conversationArea = document.querySelector("#conversationArea");
const emptyConversation = document.querySelector("#emptyConversation");
const messageList = document.querySelector("#messageList");

const questionForm = document.querySelector("#questionForm");
const recipientInput = document.querySelector("#recipientInput");
const questionInput = document.querySelector("#questionInput");
const characterCount = document.querySelector("#characterCount");
const sendButton = document.querySelector("#sendButton");

const waitTimeLabel = document.querySelector("#waitTimeLabel");
const waitSettingLink = document.querySelector("#waitSettingLink");
const clearHistoryButton = document.querySelector("#clearHistoryButton");

const exportButton = document.querySelector("#exportButton");
const exportLayer = document.querySelector("#exportLayer");
const exportImage = document.querySelector("#exportImage");
const closeExportButton = document.querySelector("#closeExportButton");
const downloadButton = document.querySelector("#downloadButton");

/*
  每一次信号检查之间的随机间隔：
  0.8 秒 ～ 5.2 秒
*/
const MIN_SIGNAL_CHECK_DELAY = 800;
const MAX_SIGNAL_CHECK_DELAY = 5200;

/*
  每次独立信号检查中，收到回应的随机机会。

  这个数值不是“预设什么时候回复”：
  - 不会在发送时决定未来结果；
  - 每次检查都重新独立随机；
  - 在真正收到前，没有任何普通回复内容存在；
  - 即使连续多次未收到，下一次也不会被人为提高或降低概率。

  后续如要调整等待体验，只调整此值即可。
*/
const SIGNAL_ARRIVAL_CHANCE = 16;

let conversation = getConversation();

let signalCheckTimer = null;
let fallbackTimer = null;
let pendingClockTimer = null;

/*
  使用浏览器安全随机数。

  这里不用 Math.random()，而使用 crypto.getRandomValues()。
  同时采用 rejection sampling，避免取模导致的微小分布偏差。
*/
function randomInteger(min, max) {
  const range = max - min + 1;
  const maxUint32 = 0x100000000;
  const limit = maxUint32 - (maxUint32 % range);

  const randomArray = new Uint32Array(1);
  let randomValue = 0;

  do {
    crypto.getRandomValues(randomArray);
    randomValue = randomArray[0];
  } while (randomValue >= limit);

  return min + (randomValue % range);
}

function chooseRandom(items) {
  return items[randomInteger(0, items.length - 1)];
}

function createId(prefix = "message") {
  const randomPart = crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${randomInteger(100000, 999999)}`;

  return `${prefix}-${randomPart}`;
}

function formatTime(timestamp) {
  const date = new Date(timestamp);

  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(date);
}

function formatWaitTime(seconds) {
  const safeSeconds = Math.max(30, Math.min(900, Number(seconds) || 300));
  const minutes = String(Math.floor(safeSeconds / 60)).padStart(2, "0");
  const remainder = String(safeSeconds % 60).padStart(2, "0");

  return `${minutes}:${remainder}`;
}

function formatRemainingTime(milliseconds) {
  const safeMilliseconds = Math.max(0, milliseconds);
  const totalSeconds = Math.ceil(safeMilliseconds / 1000);

  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");

  return `${minutes}:${seconds}`;
}

function scrollConversationToBottom(smooth = true) {
  window.requestAnimationFrame(() => {
    conversationArea.scrollTo({
      top: conversationArea.scrollHeight,
      behavior: smooth ? "smooth" : "auto"
    });
  });
}

function getEnabledCards() {
  const settings = getSettings();
  const activeCategories = settings.activeCategories;

  const validCategories = Array.isArray(activeCategories)
    ? activeCategories.filter((category) => cardCategories[category])
    : [];

  const categoryNames = validCategories.length
    ? validCategories
    : Object.keys(cardCategories);

  return categoryNames.flatMap((category) => cardCategories[category]);
}

/*
  仅在“普通回应真正抵达的当刻”调用。

  单张字卡、多张字卡均有可能。
  抽取数量、具体字卡都在此时才独立随机产生。

  它不会在用户点击发送时执行，
  不会在等待开始时执行，
  不会提前将结果存入 localStorage。
*/
function createTextCardPayloadAtArrival() {
  const enabledCards = getEnabledCards();
  const cardAmount = randomInteger(1, 3);
  const cards = [];

  for (let index = 0; index < cardAmount; index += 1) {
    cards.push(chooseRandom(enabledCards));
  }

  return {
    type: "text-cards",
    cards
  };
}

/*
  普通回应的内容入口。

  下一步制作塔罗牌与礼物时，在这里随机决定：
  - text-cards
  - tarot
  - gift
  - 组合形式

  重要：无论扩展成什么形式，这个函数始终只能在
  “普通回应已经抵达”后执行，绝不在发送时预生成。
*/
function createReplyAtArrival() {
  return createTextCardPayloadAtArrival();
}

/*
  系统兜底内容。

  仅在等待上限到达，并且本轮从未收到普通回应时调用。
*/
function createFallbackPayloadAtDeadline() {
  return {
    type: "fallback",
    cards: [chooseRandom(fallbackCards)]
  };
}

/*
  发送时创建的 session 只能保存等待窗口本身。

  注意：
  - 没有 normalPayload；
  - 没有 fallbackPayload；
  - 没有 candidateArrivalAt；
  - 没有 normalWillArrive。

  因此发送时，未来收到什么、什么时候收到，
  都不被保存，也没有被程序提前决定。
*/
function createSession(recipient, question) {
  const settings = getSettings();
  const waitSeconds = Math.max(
    30,
    Math.min(900, Number(settings.waitSeconds) || 300)
  );

  const createdAt = Date.now();

  return {
    id: createId("session"),
    recipient,
    question,
    createdAt,
    deadlineAt: createdAt + waitSeconds * 1000,
    status: "waiting"
  };
}

function saveCurrentConversation() {
  saveConversation(conversation);
}

function createQuestionMessage(session) {
  return {
    id: createId("question"),
    role: "question",
    recipient: session.recipient,
    content: session.question,
    createdAt: session.createdAt
  };
}

/*
  source === "normal"：
  此时才调用 createReplyAtArrival()。

  source === "fallback"：
  此时才调用 createFallbackPayloadAtDeadline()。

  两者都没有预先生成。
*/
function createResponseMessage(session, source) {
  const payload = source === "normal"
    ? createReplyAtArrival()
    : createFallbackPayloadAtDeadline();

  return {
    id: createId("response"),
    role: "response",
    recipient: session.recipient,
    source,
    payload,
    createdAt: Date.now()
  };
}

function renderQuestionMessage(message) {
  const element = document.createElement("article");

  element.className = "message-block is-question";
  element.dataset.messageId = message.id;

  element.innerHTML = `
    <div class="message-meta">
      <span class="message-kind">你的问题</span>
      <time class="message-time">${formatTime(message.createdAt)}</time>
    </div>

    <div class="message-bubble">${escapeHtml(message.content)}</div>
  `;

  return element;
}

function renderResponseMessage(message) {
  const element = document.createElement("article");
  const isFallback = message.source === "fallback";

  element.className = "message-block is-response";
  element.dataset.messageId = message.id;

  const cardsMarkup = message.payload.cards
    .map((card) => `<span class="response-card">${escapeHtml(card)}</span>`)
    .join("");

  element.innerHTML = `
    <div class="message-meta">
      <span class="message-kind">
        ${isFallback ? "默认回音" : "收到回复"}
      </span>

      <time class="message-time">${formatTime(message.createdAt)}</time>
    </div>

    <div class="message-bubble">
      <span class="response-recipient">
        FROM / ${escapeHtml(message.recipient)}
      </span>

      <div class="response-card-row">
        ${cardsMarkup}
      </div>
    </div>
  `;

  return element;
}

function renderPendingMessage(session) {
  const element = document.createElement("article");

  element.className = "message-block is-pending";
  element.id = `pending-${session.id}`;

  element.innerHTML = `
    <div class="message-meta">
      <span class="message-kind">等待回应</span>
      <time class="message-time" id="pendingCountdown-${session.id}">
        LIMIT / ${formatRemainingTime(session.deadlineAt - Date.now())}
      </time>
    </div>

    <div class="message-bubble pending-bubble">
      <span class="pending-rings" aria-hidden="true"></span>

      <span class="pending-copy">
        <strong>消息拼贴中</strong>
        <small>CHANNEL REMAINS OPEN</small>
      </span>
    </div>
  `;

  return element;
}

function escapeHtml(value) {
  const element = document.createElement("div");
  element.textContent = String(value);
  return element.innerHTML;
}

function renderConversation() {
  messageList.innerHTML = "";

  const hasMessages = conversation.messages.length > 0;
  emptyConversation.classList.toggle("is-hidden", hasMessages);

  conversation.messages.forEach((message) => {
    const element = message.role === "question"
      ? renderQuestionMessage(message)
      : renderResponseMessage(message);

    messageList.appendChild(element);
  });

  if (conversation.activeSession) {
    messageList.appendChild(renderPendingMessage(conversation.activeSession));
  }

  setComposerState(Boolean(conversation.activeSession));
  scrollConversationToBottom(false);
}

function setComposerState(isLocked) {
  questionForm.classList.toggle("is-locked", isLocked);

  recipientInput.disabled = isLocked;
  questionInput.disabled = isLocked;
  sendButton.disabled = isLocked;

  sendButton.querySelector("span").textContent = isLocked
    ? "等待回应"
    : "发送问题";
}

function clearTransmissionTimers() {
  window.clearTimeout(signalCheckTimer);
  window.clearTimeout(fallbackTimer);
  window.clearInterval(pendingClockTimer);

  signalCheckTimer = null;
  fallbackTimer = null;
  pendingClockTimer = null;
}

function updatePendingCountdown() {
  const activeSession = conversation.activeSession;

  if (!activeSession) {
    return;
  }

  const countdownElement = document.querySelector(
    `#pendingCountdown-${activeSession.id}`
  );

  if (!countdownElement) {
    return;
  }

  const remainingTime = activeSession.deadlineAt - Date.now();

  countdownElement.textContent = `LIMIT / ${formatRemainingTime(remainingTime)}`;
}

/*
  普通回应真正抵达时才进入这里。

  这里才会随机生成回复内容。
  在此之前，activeSession 内没有任何普通回复的数据。
*/
function completeActiveSession(source) {
  const activeSession = conversation.activeSession;

  if (!activeSession) {
    return;
  }

  clearTransmissionTimers();

  const responseMessage = createResponseMessage(activeSession, source);

  conversation.messages.push(responseMessage);
  conversation.activeSession = null;

  saveCurrentConversation();
  renderConversation();

  questionInput.focus();
}

/*
  每次检查均为独立事件。

  它不读取问题内容；
  它不读取提问对象；
  它不对字卡作语义匹配；
  它不依赖先前检查的结果；
  它不持有任何预先准备好的普通回复。
*/
function inspectSignal(sessionId) {
  const activeSession = conversation.activeSession;

  if (!activeSession || activeSession.id !== sessionId) {
    return;
  }

  const now = Date.now();

  /*
    最终时限已到，交给 fallbackTimer 处理兜底。
    即使两个定时器极接近，也不会在截止后生成普通回应。
  */
  if (now >= activeSession.deadlineAt) {
    return;
  }

  /*
    这一次才独立随机判断是否收到回应。
    结果不会提前存储，也不影响下一次检查。
  */
  const signalArrived = randomInteger(1, 100) <= SIGNAL_ARRIVAL_CHANCE;

  if (signalArrived) {
    completeActiveSession("normal");
    return;
  }

  /*
    未收到回应：
    再为下一次检测随机生成 0.8 ～ 5.2 秒间隔。
  */
  const nextDelay = randomInteger(
    MIN_SIGNAL_CHECK_DELAY,
    MAX_SIGNAL_CHECK_DELAY
  );

  const remainingTime = activeSession.deadlineAt - Date.now();

  /*
    若剩余时间不足一次完整检测，
    不再安排跨越 deadline 的普通回应检查。
    等待系统到截止时执行真正的兜底。
  */
  if (nextDelay >= remainingTime) {
    return;
  }

  signalCheckTimer = window.setTimeout(() => {
    inspectSignal(sessionId);
  }, nextDelay);
}

/*
  为当前等待窗口启动两条完全不同职责的流程：

  1. 信号检测流程：
     - 非固定随机间隔；
     - 每次独立随机判断是否收到普通回应；
     - 收到时才生成普通回复。

  2. 最终兜底流程：
     - 只负责等待 deadline；
     - 只有届时仍处于 waiting 才生成兜底回复；
     - 不会预先抽取兜底卡。
*/
function scheduleActiveSession() {
  clearTransmissionTimers();

  const activeSession = conversation.activeSession;

  if (!activeSession) {
    return;
  }

  const now = Date.now();
  const remainingTime = activeSession.deadlineAt - now;

  /*
    用户离开后再回来，若等待上限已经过去，
    此时才执行兜底抽取。
  */
  if (remainingTime <= 0) {
    completeActiveSession("fallback");
    return;
  }

  updatePendingCountdown();

  pendingClockTimer = window.setInterval(() => {
    updatePendingCountdown();
  }, 500);

  fallbackTimer = window.setTimeout(() => {
    const currentSession = conversation.activeSession;

    if (
      currentSession &&
      currentSession.id === activeSession.id &&
      Date.now() >= currentSession.deadlineAt
    ) {
      completeActiveSession("fallback");
    }
  }, remainingTime);

  /*
    首次检测同样不固定。
    发送瞬间不检查，不抽卡，不生成结果。
  */
  const firstCheckDelay = randomInteger(
    MIN_SIGNAL_CHECK_DELAY,
    MAX_SIGNAL_CHECK_DELAY
  );

  if (firstCheckDelay < remainingTime) {
    signalCheckTimer = window.setTimeout(() => {
      inspectSignal(activeSession.id);
    }, firstCheckDelay);
  }
}

function updateWaitTimeLabel() {
  const settings = getSettings();
  waitTimeLabel.textContent = formatWaitTime(settings.waitSeconds);
}

function updateCharacterCount() {
  characterCount.textContent = `${questionInput.value.length} / 160`;
}

function submitQuestion(event) {
  event.preventDefault();

  if (conversation.activeSession) {
    return;
  }

  const recipient = recipientInput.value.trim();
  const question = questionInput.value.trim();

  if (!recipient) {
    recipientInput.focus();
    return;
  }

  if (!question) {
    questionInput.focus();
    return;
  }

  /*
    此刻只创建一个空白等待窗口。
    没有抽取普通回复；
    没有选择回复类型；
    没有决定抵达时间；
    没有生成塔罗、礼物或字卡。
  */
  const session = createSession(recipient, question);

  conversation.messages.push(createQuestionMessage(session));
  conversation.activeSession = session;

  saveCurrentConversation();

  questionInput.value = "";
  updateCharacterCount();

  renderConversation();
  scheduleActiveSession();
}

function clearHistory() {
  const shouldClear = window.confirm(
    "确认清除当前设备中的全部对话记录吗？此操作无法撤销。"
  );

  if (!shouldClear) {
    return;
  }

  clearTransmissionTimers();

  conversation = {
    messages: [],
    activeSession: null
  };

  clearConversation();
  renderConversation();
}

function wrapCanvasText(context, text, maxWidth) {
  const characters = Array.from(text);
  const lines = [];
  let currentLine = "";

  characters.forEach((character) => {
    const candidate = currentLine + character;

    if (context.measureText(candidate).width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = character;
    } else {
      currentLine = candidate;
    }
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

function roundRect(context, x, y, width, height, radius) {
  const safeRadius = Math.min(radius, width / 2, height / 2);

  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.arcTo(x + width, y, x + width, y + height, safeRadius);
  context.arcTo(x + width, y + height, x, y + height, safeRadius);
  context.arcTo(x, y + height, x, y, safeRadius);
  context.arcTo(x, y, x + width, y, safeRadius);
  context.closePath();
}

function createExportImage() {
  const exportMessages = [...conversation.messages];

  if (!exportMessages.length) {
    window.alert("暂无可导出的对话记录。");
    return;
  }

  const canvasWidth = 1080;
  const sidePadding = 76;
  const contentWidth = canvasWidth - sidePadding * 2;
  const lineHeight = 46;

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  context.font = '32px "PingFang SC", "Microsoft YaHei", sans-serif';

  const blocks = exportMessages.map((message) => {
    if (message.role === "question") {
      const lines = wrapCanvasText(
        context,
        message.content,
        contentWidth - 88
      );

      return {
        ...message,
        lines,
        height: 112 + lines.length * lineHeight
      };
    }

    const allCards = message.payload.cards.join("  ·  ");
    const lines = wrapCanvasText(
      context,
      allCards,
      contentWidth - 88
    );

    return {
      ...message,
      lines,
      height: 148 + lines.length * lineHeight
    };
  });

  const totalHeight = 250 + blocks.reduce(
    (height, block) => height + block.height + 30,
    0
  ) + 90;

  canvas.width = canvasWidth;
  canvas.height = totalHeight;

  context.fillStyle = "#f2f2ef";
  context.fillRect(0, 0, canvasWidth, totalHeight);

  const backgroundGradient = context.createRadialGradient(
    canvasWidth / 2,
    100,
    20,
    canvasWidth / 2,
    220,
    800
  );

  backgroundGradient.addColorStop(0, "rgba(255,255,255,0.95)");
  backgroundGradient.addColorStop(1, "rgba(230,230,226,0)");

  context.fillStyle = backgroundGradient;
  context.fillRect(0, 0, canvasWidth, totalHeight);

  context.strokeStyle = "rgba(17,17,17,0.18)";
  context.lineWidth = 1;
  context.strokeRect(34, 34, canvasWidth - 68, totalHeight - 68);

  context.fillStyle = "#111111";
  context.font = '500 54px "PingFang SC", "Microsoft YaHei", sans-serif';
  context.fillText("未读信号", sidePadding, 118);

  context.fillStyle = "rgba(17,17,17,0.52)";
  context.font = '18px "SFMono-Regular", "Courier New", monospace';
  context.fillText(
    "UNKNOWN-MESSAGE / CONVERSATION ARCHIVE",
    sidePadding,
    156
  );

  context.beginPath();
  context.moveTo(sidePadding, 186);
  context.lineTo(canvasWidth - sidePadding, 186);
  context.strokeStyle = "rgba(17,17,17,0.2)";
  context.stroke();

  let currentY = 230;

  blocks.forEach((block) => {
    const isQuestion = block.role === "question";

    const bubbleWidth = isQuestion
      ? Math.min(contentWidth * 0.78, 760)
      : Math.min(contentWidth * 0.84, 810);

    const bubbleX = isQuestion
      ? canvasWidth - sidePadding - bubbleWidth
      : sidePadding;

    const bubbleY = currentY + 28;

    context.fillStyle = isQuestion
      ? "#111111"
      : "rgba(255,255,255,0.62)";

    context.strokeStyle = "rgba(17,17,17,0.18)";
    context.lineWidth = 1;

    roundRect(
      context,
      bubbleX,
      bubbleY,
      bubbleWidth,
      block.height - 25,
      20
    );

    context.fill();

    if (!isQuestion) {
      context.stroke();
    }

    context.fillStyle = "rgba(17,17,17,0.5)";
    context.font = '17px "SFMono-Regular", "Courier New", monospace';

    const label = isQuestion
      ? `你的问题 / ${formatTime(block.createdAt)}`
      : `${block.source === "fallback" ? "默认回音" : "收到回复"} / ${formatTime(block.createdAt)}`;

    context.fillText(label, bubbleX, currentY + 14);

    if (!isQuestion) {
      context.fillStyle = "rgba(17,17,17,0.48)";
      context.font = '17px "SFMono-Regular", "Courier New", monospace';

      context.fillText(
        `FROM / ${block.recipient}`,
        bubbleX + 30,
        bubbleY + 42
      );
    }

    context.fillStyle = isQuestion ? "#f2f2ef" : "#111111";
    context.font = '32px "PingFang SC", "Microsoft YaHei", sans-serif';

    const textStartY = isQuestion
      ? bubbleY + 54
      : bubbleY + 88;

    block.lines.forEach((line, index) => {
      context.fillText(
        line,
        bubbleX + 30,
        textStartY + index * lineHeight
      );
    });

    currentY += block.height + 30;
  });

  context.beginPath();
  context.moveTo(sidePadding, totalHeight - 100);
  context.lineTo(canvasWidth - sidePadding, totalHeight - 100);
  context.strokeStyle = "rgba(17,17,17,0.2)";
  context.stroke();

  context.fillStyle = "rgba(17,17,17,0.5)";
  context.font = '17px "SFMono-Regular", "Courier New", monospace';

  context.fillText(
    "LOCAL RECORD · GENERATED ON DEVICE",
    sidePadding,
    totalHeight - 62
  );

  const imageDataUrl = canvas.toDataURL("image/png");

  exportImage.src = imageDataUrl;
  downloadButton.href = imageDataUrl;

  exportLayer.classList.remove("is-hidden");
}

function closeExport() {
  exportLayer.classList.add("is-hidden");
}

function initialize() {
  updateWaitTimeLabel();
  updateCharacterCount();
  renderConversation();
  scheduleActiveSession();

  questionInput.addEventListener("input", updateCharacterCount);
  questionForm.addEventListener("submit", submitQuestion);

  clearHistoryButton.addEventListener("click", clearHistory);

  exportButton.addEventListener("click", createExportImage);
  closeExportButton.addEventListener("click", closeExport);

  exportLayer.addEventListener("click", (event) => {
    if (event.target.dataset.closeExport === "true") {
      closeExport();
    }
  });

  waitSettingLink.addEventListener("click", () => {
    window.location.href = "./settings.html";
  });

  /*
    当页面进入后台、手机锁屏或切回应用时，
    不重新随机、不重置会话，只按原 deadline 判断。
  */
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      scheduleActiveSession();
    }
  });
}

initialize();
