import * as cardData from "./data/cards.js";
import {
  clearConversation,
  getConversation,
  getSettings,
  saveConversation
} from "./utils/storage.js";

const {
  cardCategories,
  fallbackCards,
  tarotCards = [],
  giftItems = []
} = cardData;

const questionPage = document.querySelector("#questionPage");
const conversationArea = document.querySelector("#conversationArea");
const emptyConversation = document.querySelector("#emptyConversation");
const messageList = document.querySelector("#messageList");

const questionForm = document.querySelector("#questionForm");
const recipientInput = document.querySelector("#recipientInput");
const questionInput = document.querySelector("#questionInput");
const characterCount = document.querySelector("#characterCount");
const sendButton = document.querySelector("#sendButton");

const responseCategoryOptions = document.querySelector(
  "#responseCategoryOptions"
);
const responseCategoryWarning = document.querySelector(
  "#responseCategoryWarning"
);
const selectAllCategoriesButton = document.querySelector(
  "#selectAllCategoriesButton"
);

const waitTimeLabel = document.querySelector("#waitTimeLabel");
const waitSettingLink = document.querySelector("#waitSettingLink");
const clearHistoryButton = document.querySelector("#clearHistoryButton");

const exportButton = document.querySelector("#exportButton");
const exportLayer = document.querySelector("#exportLayer");
const exportImage = document.querySelector("#exportImage");
const closeExportButton = document.querySelector("#closeExportButton");
const downloadButton = document.querySelector("#downloadButton");

const MIN_SIGNAL_CHECK_DELAY = 800;
const MAX_SIGNAL_CHECK_DELAY = 5200;

/*
  每次独立信号检查中，收到回应的随机机会。

  注意：
  这不是预设抵达时间；
  不是发送时预抽结果；
  只是每一次真实随机检测时的独立概率。
*/
const SIGNAL_ARRIVAL_CHANCE = 16;

const RECIPIENT_DRAFT_KEY = "unknown-message.recipient-draft";


const WAITING_LINES = [
  "讯息已离开此刻",
  "正在穿过安静的频段",
  "远处仍有微弱回声",
  "有些片段尚未显现",
  "请让这段空白继续停留",
  "传讯窗口仍然开启",
  "有些回答正在路上",
  "风经过时，线路依然安静",
  "未命名的内容正在靠近",
  "这一刻还没有结束"
];

let conversation = getConversation();

let signalCheckTimer = null;
let fallbackTimer = null;
let pendingClockTimer = null;
let receiveAnimationTimer = null;

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
  if (!Array.isArray(items) || !items.length) {
    return null;
  }

  return items[randomInteger(0, items.length - 1)];
}

function secureShuffle(items) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const targetIndex = randomInteger(0, index);

    [shuffled[index], shuffled[targetIndex]] = [
      shuffled[targetIndex],
      shuffled[index]
    ];
  }

  return shuffled;
}

function createId(prefix = "message") {
  const randomPart = crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${randomInteger(100000, 999999)}`;

  return `${prefix}-${randomPart}`;
}

function escapeHtml(value) {
  const element = document.createElement("div");
  element.textContent = String(value ?? "");
  return element.innerHTML;
}

function formatTime(timestamp) {
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(new Date(timestamp));
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
function getRecipientDraft() {
  try {
    return localStorage.getItem(RECIPIENT_DRAFT_KEY) || "";
  } catch {
    return "";
  }
}

function saveRecipientDraft(value) {
  try {
    const safeValue = String(value || "").trim();

    if (safeValue) {
      localStorage.setItem(RECIPIENT_DRAFT_KEY, safeValue);
    } else {
      localStorage.removeItem(RECIPIENT_DRAFT_KEY);
    }
  } catch {
    /*
      小红书沙箱中如 localStorage 暂不可用，忽略即可。
      不影响核心传讯流程。
    */
  }
}

function restoreRecipientDraft() {
  const draftValue = getRecipientDraft();

  if (draftValue && !recipientInput.value.trim()) {
    recipientInput.value = draftValue;
  }
}


function scrollConversationToBottom(smooth = true) {
  window.requestAnimationFrame(() => {
    conversationArea.scrollTo({
      top: conversationArea.scrollHeight,
      behavior: smooth ? "smooth" : "auto"
    });
  });
}

function getAllCardCategories() {
  const settings = getSettings();

  const customCategories =
    settings.customCategories &&
    typeof settings.customCategories === "object" &&
    !Array.isArray(settings.customCategories)
      ? settings.customCategories
      : {};

  return {
    ...cardCategories,
    ...customCategories
  };
}

function getEnabledCards(activeCategories = []) {
  const allCategories = getAllCardCategories();

  const validCategories = Array.isArray(activeCategories)
    ? activeCategories.filter(
      (category) =>
        Array.isArray(allCategories[category]) &&
        allCategories[category].length
    )
    : [];

  return validCategories.flatMap((category) => allCategories[category]);
}


/*
  不设定固定的 1~3、1~5 数量上限。

  信号抵达后，先从当前已启用的全部词条中随机决定数量，
  再安全随机、无重复地抽取相应数量。

  因此数量只受用户实际开启的字卡池规模影响。
*/


function createRandomCardsAtArrival(activeCategories) {
  const enabledCards = getEnabledCards(activeCategories);

  if (!enabledCards.length) {
    return [];
  }

  const amount = randomInteger(1, enabledCards.length);

  return secureShuffle(enabledCards).slice(0, amount);
}

function createTextCardPayloadAtArrival(activeCategories) {
  return {
    type: "text-cards",
    cards: createRandomCardsAtArrival(activeCategories),
    tarot: null,
    gift: null
  };
}

function createTarotPayloadAtArrival(activeCategories) {
  return {
    type: "tarot",
    cards: createRandomCardsAtArrival(activeCategories),
    tarot: chooseRandom(tarotCards),
    gift: null
  };
}

function createGiftPayloadAtArrival(activeCategories) {
  return {
    type: "gift",
    cards: createRandomCardsAtArrival(activeCategories),
    tarot: null,
    gift: chooseRandom(giftItems)
  };
}

function createComboPayloadAtArrival(activeCategories) {
  return {
    type: "combo",
    cards: createRandomCardsAtArrival(activeCategories),
    tarot: chooseRandom(tarotCards),
    gift: chooseRandom(giftItems)
  };
}

function createReplyAtArrival(activeCategories) {
  const hasTextCards = getEnabledCards(activeCategories).length > 0;

  const availableCreators = [];

  if (hasTextCards) {
    availableCreators.push(() =>
      createTextCardPayloadAtArrival(activeCategories)
    );
  }

  if (tarotCards.length) {
    availableCreators.push(() =>
      createTarotPayloadAtArrival(activeCategories)
    );
  }

  if (giftItems.length) {
    availableCreators.push(() =>
      createGiftPayloadAtArrival(activeCategories)
    );
  }

  if (tarotCards.length && giftItems.length) {
    availableCreators.push(() =>
      createComboPayloadAtArrival(activeCategories)
    );
  }

  /*
    正常情况下 UI 已确保至少选中一个分类。
    此处仍保留防御性兜底，避免历史 Session 或异常数据造成报错。
  */
  if (!availableCreators.length) {
    return {
      type: "text-cards",
      cards: [],
      tarot: null,
      gift: null
    };
  }

  return chooseRandom(availableCreators)();
}

function createFallbackPayloadAtDeadline() {
  return {
    type: "fallback",
    cards: [chooseRandom(fallbackCards)],
    tarot: null,
    gift: null
  };
}

function createSession(recipient, question, activeCategories) {
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
    activeCategories: [...new Set(activeCategories)],
    createdAt,
    deadlineAt: createdAt + waitSeconds * 1000,
    status: "waiting"
  };
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

function createResponseMessage(session, source) {
  return {
    id: createId("response"),
    role: "response",
    recipient: session.recipient,
    source,
    payload: source === "normal"
      ? createReplyAtArrival(session.activeCategories || [])
      : createFallbackPayloadAtDeadline(),
    createdAt: Date.now()
  };
}


function createCardsMarkup(cards = []) {
  if (!cards.length) {
    return "";
  }

  return `
    <div class="response-card-row">
      ${cards
        .map((card) => `<span class="response-card">${escapeHtml(card)}</span>`)
        .join("")}
    </div>
  `;
}

function createTarotMarkup(tarot) {
  if (!tarot) {
    return "";
  }

  return `
    <section class="tarot-reply-card">
      <div class="tarot-card-frame">
        <span class="tarot-card-number">ARCANA</span>
        <div class="tarot-card-art" aria-hidden="true">
          ${tarot.svg}
        </div>
        <span class="tarot-card-number tarot-card-bottom">
          ${escapeHtml(tarot.englishName || tarot.id)}
        </span>
      </div>

      <div class="tarot-copy">
        <span>一张意象卡</span>
        <strong>${escapeHtml(tarot.name)}</strong>
        <p>${escapeHtml(tarot.meaning)}</p>
      </div>
    </section>
  `;
}

function createGiftMarkup(gift) {
  if (!gift) {
    return "";
  }

  return `
    <section class="gift-reply-card">
      <div class="gift-art" aria-hidden="true">
        ${gift.svg}
      </div>

      <div class="gift-copy">
        <span>有一样东西被送来</span>
        <strong>${escapeHtml(gift.name)}</strong>
      </div>
    </section>
  `;
}

function renderQuestionMessage(message) {
  const element = document.createElement("article");

  element.className = "message-block is-question";
  element.dataset.messageId = message.id;

  element.innerHTML = `
    <div class="message-meta">
      <span class="message-kind">你留下的问题</span>
      <time class="message-time">${formatTime(message.createdAt)}</time>
    </div>

    <div class="question-message-card">
      <span class="question-message-to">TO / ${escapeHtml(message.recipient)}</span>
      <p>${escapeHtml(message.content)}</p>
    </div>
  `;

  return element;
}

function renderResponseMessage(message) {
  const element = document.createElement("article");
  const payload = message.payload || {};
  const isFallback = message.source === "fallback";

  element.className = "message-block is-response";
  element.dataset.messageId = message.id;

  element.innerHTML = `
    <div class="message-meta">
      <span class="message-kind">${isFallback ? "留在原地的回音" : "一段回讯抵达"}</span>
      <time class="message-time">${formatTime(message.createdAt)}</time>
    </div>

    <section class="received-message-card">
      <div class="received-card-header">
        <span class="received-mark"></span>
        <span>${isFallback ? "THE CHANNEL GREW QUIET" : "FROM / " + escapeHtml(message.recipient)}</span>
      </div>

      <div class="received-card-content">
        ${createTarotMarkup(payload.tarot)}
        ${createGiftMarkup(payload.gift)}
        ${createCardsMarkup(payload.cards)}
      </div>

      <div class="received-card-footer">
        <span>${isFallback ? "未收到完整内容" : "内容已显现"}</span>
        <span>${escapeHtml(payload.type || "text-cards")}</span>
      </div>
    </section>
  `;

  return element;
}

function renderPendingMessage(session) {
  const element = document.createElement("article");

  element.className = "message-block is-pending";
  element.id = `pending-${session.id}`;

  const waitingMarkup = WAITING_LINES
    .map((line) => `<span>${escapeHtml(line)}</span>`)
    .join("");

  element.innerHTML = `
    <section class="signal-observatory">
      <div class="signal-observatory-top">
        <span class="signal-live-dot"></span>
        <span>传讯窗口仍然开启</span>
        <time id="pendingCountdown-${session.id}">
          LIMIT / ${formatRemainingTime(session.deadlineAt - Date.now())}
        </time>
      </div>

      <div class="signal-core-wrap" aria-hidden="true">
        <span class="signal-orbit signal-orbit-one"></span>
        <span class="signal-orbit signal-orbit-two"></span>
        <span class="signal-orbit signal-orbit-three"></span>

        <div class="signal-core">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <div class="signal-copy">
        <span>正在等待远处的回讯</span>
        <strong>让这一刻暂时不要结束</strong>
      </div>

      <div class="signal-wave" aria-hidden="true">
        <svg viewBox="0 0 360 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 24H34L46 15L59 34L73 8L89 39L103 24H135L148 19L162 29L178 24H214L228 12L243 37L258 17L273 29L286 24H360"
            stroke="currentColor"
            stroke-width="1"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>

      <div class="signal-line-window" aria-hidden="true">
        <div class="signal-line-track">
          ${waitingMarkup}
          ${waitingMarkup}
        </div>
      </div>
    </section>
  `;

  return element;
}

function renderConversation() {
  messageList.innerHTML = "";

  const hasMessages = conversation.messages.length > 0;
  const hasActiveSession = Boolean(conversation.activeSession);

  emptyConversation.classList.toggle(
    "is-hidden",
    hasMessages || hasActiveSession
  );

  questionPage.classList.toggle(
    "is-pristine",
    !hasMessages && !hasActiveSession
  );

  questionPage.classList.toggle("is-waiting", hasActiveSession);

  conversation.messages.forEach((message) => {
    const element = message.role === "question"
      ? renderQuestionMessage(message)
      : renderResponseMessage(message);

    messageList.appendChild(element);
  });

  if (conversation.activeSession) {
    messageList.appendChild(renderPendingMessage(conversation.activeSession));
  }

  setComposerState(hasActiveSession);
  scrollConversationToBottom(false);
}

function setComposerState(isLocked) {
  questionForm.classList.toggle("is-locked", isLocked);

  recipientInput.disabled = isLocked;
  questionInput.disabled = isLocked;
  sendButton.disabled = isLocked;

  sendButton.querySelector("span").textContent = isLocked
    ? "CHANNEL OPEN"
    : "OPEN CHANNEL";
}

function saveCurrentConversation() {
  saveConversation(conversation);
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

  countdownElement.textContent =
    `LIMIT / ${formatRemainingTime(activeSession.deadlineAt - Date.now())}`;
}

/*
  信号抵达的时刻：
  1. 立刻停止等待计时；
  2. 立刻随机生成普通回复；
  3. 立刻写入本地记录；
  4. 再播放回讯显现的视觉过渡。

  因此视觉延迟不等于内容预生成；
  payload 依然只会在抵达的当刻产生。
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

  const responseElement = document.querySelector(
    `[data-message-id="${responseMessage.id}"]`
  );

  if (responseElement && source === "normal") {
    responseElement.classList.add("is-receiving");

    receiveAnimationTimer = window.setTimeout(() => {
      responseElement.classList.remove("is-receiving");
      scrollConversationToBottom(true);
      questionInput.focus();
    }, 1050);
  } else {
    scrollConversationToBottom(true);
    questionInput.focus();
  }
}

function inspectSignal(sessionId) {
  const activeSession = conversation.activeSession;

  if (!activeSession || activeSession.id !== sessionId) {
    return;
  }

  if (Date.now() >= activeSession.deadlineAt) {
    return;
  }

  const signalArrived =
    randomInteger(1, 100) <= SIGNAL_ARRIVAL_CHANCE;

  if (signalArrived) {
    completeActiveSession("normal");
    return;
  }

  const nextDelay = randomInteger(
    MIN_SIGNAL_CHECK_DELAY,
    MAX_SIGNAL_CHECK_DELAY
  );

  const remainingTime = activeSession.deadlineAt - Date.now();

  if (nextDelay >= remainingTime) {
    return;
  }

  signalCheckTimer = window.setTimeout(() => {
    inspectSignal(sessionId);
  }, nextDelay);
}

function scheduleActiveSession() {
  clearTransmissionTimers();

  const activeSession = conversation.activeSession;

  if (!activeSession) {
    return;
  }

  const remainingTime = activeSession.deadlineAt - Date.now();

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
  waitTimeLabel.textContent = formatWaitTime(getSettings().waitSeconds);
}

function updateCharacterCount() {
  characterCount.textContent = `${questionInput.value.length} / 160`;
}
function getQuestionCategoryNames() {
  const allCategories = getAllCardCategories();

  return Object.keys(allCategories).filter(
    (category) =>
      Array.isArray(allCategories[category]) &&
      allCategories[category].length
  );
}

function getSelectedResponseCategories() {
  return [...responseCategoryOptions.querySelectorAll("input:checked")]
    .map((input) => input.value);
}

function updateResponseCategoryState() {
  const selectedCategories = getSelectedResponseCategories();
  const allCategories = getQuestionCategoryNames();

  responseCategoryWarning.classList.toggle(
    "is-hidden",
    selectedCategories.length > 0
  );

  selectAllCategoriesButton.textContent =
    selectedCategories.length === allCategories.length
      ? "清除"
      : "全选";
}

function renderResponseCategoryOptions() {
  const settings = getSettings();
  const categoryNames = getQuestionCategoryNames();

  const activeSet = new Set(
    Array.isArray(settings.activeCategories)
      ? settings.activeCategories
      : []
  );

  responseCategoryOptions.innerHTML = categoryNames
    .map((category) => `
      <label class="response-category-option">
        <input
          type="checkbox"
          value="${escapeHtml(category)}"
          ${activeSet.has(category) ? "checked" : ""}
        />
        <span>${escapeHtml(category)}</span>
      </label>
    `)
    .join("");

  updateResponseCategoryState();
}


function submitQuestion(event) {
  event.preventDefault();

  if (conversation.activeSession) {
    return;
  }

  const recipient = recipientInput.value.trim();
  const question = questionInput.value.trim();

    const selectedCategories = getSelectedResponseCategories();

  if (!selectedCategories.length) {
    responseCategoryWarning.classList.remove("is-hidden");
    responseCategoryOptions.scrollIntoView({
      behavior: "smooth",
      block: "nearest"
    });
    return;
  }


  if (!recipient) {
    recipientInput.focus();
    return;
  }

  if (!question) {
    questionInput.focus();
    return;
  }

  /*
    发送时只产生空白 session：
    不抽字卡、不选塔罗、不选礼物、不定回复类型、不定到达时间。
  */
  saveRecipientDraft(recipient);

  const session = createSession(
    recipient,
    question,
    selectedCategories
  );


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
  window.clearTimeout(receiveAnimationTimer);

  conversation = {
    messages: [],
    activeSession: null
  };

  clearConversation();
  renderConversation();
}

/* Canvas 长图 */

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

function wrapCanvasText(context, text, maxWidth) {
  const characters = Array.from(String(text || ""));
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

function getResponseExportLines(message, context, maxWidth) {
  const payload = message.payload || {};
  const lines = [];

  if (payload.tarot) {
    lines.push(`意象卡 · ${payload.tarot.name}`);

    if (payload.tarot.meaning) {
      lines.push(
        ...wrapCanvasText(context, payload.tarot.meaning, maxWidth)
      );
    }
  }

  if (payload.gift) {
    lines.push(`送来了一样东西 · ${payload.gift.name}`);
  }

  if (Array.isArray(payload.cards) && payload.cards.length) {
    lines.push(
      ...wrapCanvasText(context, payload.cards.join("  ·  "), maxWidth)
    );
  }

  return lines.length ? lines : ["没有可显示的内容"];
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
    const lines = message.role === "question"
      ? wrapCanvasText(context, message.content, contentWidth - 92)
      : getResponseExportLines(message, context, contentWidth - 92);

    const topSpace = message.role === "question" ? 124 : 160;

    return {
      ...message,
      lines,
      height: topSpace + lines.length * lineHeight
    };
  });

  const totalHeight = 260 + blocks.reduce(
    (height, block) => height + block.height + 34,
    0
  ) + 110;

  canvas.width = canvasWidth;
  canvas.height = totalHeight;

  context.fillStyle = "#f2f2ef";
  context.fillRect(0, 0, canvasWidth, totalHeight);

  const backgroundGradient = context.createRadialGradient(
    canvasWidth / 2,
    90,
    20,
    canvasWidth / 2,
    180,
    860
  );

  backgroundGradient.addColorStop(0, "rgba(255,255,255,0.96)");
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
    "UNKNOWN-MESSAGE / A RECORD OF WHAT RETURNED",
    sidePadding,
    156
  );

  context.beginPath();
  context.moveTo(sidePadding, 190);
  context.lineTo(canvasWidth - sidePadding, 190);
  context.strokeStyle = "rgba(17,17,17,0.2)";
  context.stroke();

  let currentY = 232;

  blocks.forEach((block) => {
    const isQuestion = block.role === "question";
    const bubbleWidth = isQuestion
      ? Math.min(contentWidth * 0.76, 760)
      : Math.min(contentWidth * 0.9, 860);

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
      block.height - 20,
      isQuestion ? 18 : 8
    );

    context.fill();

    if (!isQuestion) {
      context.stroke();
    }

    context.fillStyle = "rgba(17,17,17,0.5)";
    context.font = '17px "SFMono-Regular", "Courier New", monospace';

    const label = isQuestion
      ? `你的问题 / ${formatTime(block.createdAt)}`
      : `${block.source === "fallback" ? "留在原地的回音" : "一段回讯抵达"} / ${formatTime(block.createdAt)}`;

    context.fillText(label, bubbleX, currentY + 14);

    if (isQuestion) {
      context.fillStyle = "rgba(242,242,239,0.62)";
      context.font = '17px "SFMono-Regular", "Courier New", monospace';
      context.fillText(
        `TO / ${block.recipient}`,
        bubbleX + 30,
        bubbleY + 42
      );
    } else {
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

    const textStartY = bubbleY + (isQuestion ? 88 : 88);

    block.lines.forEach((line, index) => {
      context.fillText(
        line,
        bubbleX + 30,
        textStartY + index * lineHeight
      );
    });

    currentY += block.height + 34;
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
  restoreRecipientDraft();
  updateWaitTimeLabel();
  updateCharacterCount();
  renderResponseCategoryOptions();
  renderConversation();
  scheduleActiveSession();

  recipientInput.addEventListener("input", () => {
    saveRecipientDraft(recipientInput.value);
  });

  questionInput.addEventListener("input", updateCharacterCount);
    responseCategoryOptions.addEventListener("change", () => {
    updateResponseCategoryState();
  });

  selectAllCategoriesButton.addEventListener("click", () => {
    const inputs = [
      ...responseCategoryOptions.querySelectorAll('input[type="checkbox"]')
    ];

    const hasUnselectedCategory = inputs.some((input) => !input.checked);

    inputs.forEach((input) => {
      input.checked = hasUnselectedCategory;
    });

    updateResponseCategoryState();
  });

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

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      scheduleActiveSession();
    }
  });
}

initialize();
