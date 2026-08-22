const SETTINGS_KEY = "unknown-message.settings";
const CONVERSATION_KEY = "unknown-message.conversation";

export const defaultSettings = {
  waitSeconds: 300,
  activeCategories: ["代词", "动作", "时间", "物品"],
  customCategories: {}
};

function normalizeCustomCategories(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.entries(value).reduce((result, [name, cards]) => {
    const safeName = String(name || "").trim();

    if (!safeName || !Array.isArray(cards)) {
      return result;
    }

    result[safeName] = [
      ...new Set(
        cards
          .map((card) => String(card || "").trim())
          .filter(Boolean)
      )
    ];

    return result;
  }, {});
}

function normalizeSettings(settings = {}) {
  const waitSeconds = Math.max(
    30,
    Math.min(900, Number(settings.waitSeconds) || defaultSettings.waitSeconds)
  );

  const activeCategories = Array.isArray(settings.activeCategories)
    ? [
      ...new Set(
        settings.activeCategories
          .map((category) => String(category || "").trim())
          .filter(Boolean)
      )
    ]
    : [...defaultSettings.activeCategories];

  return {
    ...defaultSettings,
    ...settings,
    waitSeconds,
    activeCategories,
    customCategories: normalizeCustomCategories(settings.customCategories)
  };
}

export function getSettings() {
  try {
    const rawValue = localStorage.getItem(SETTINGS_KEY);

    if (!rawValue) {
      return normalizeSettings(defaultSettings);
    }

    return normalizeSettings(JSON.parse(rawValue));
  } catch {
    return normalizeSettings(defaultSettings);
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify(normalizeSettings(settings))
    );
  } catch {
    /*
      localStorage 不可用时不阻断当前页面交互。
    */
  }
}

export function getConversation() {
  try {
    const rawValue = localStorage.getItem(CONVERSATION_KEY);

    if (!rawValue) {
      return {
        messages: [],
        activeSession: null
      };
    }

    const parsedValue = JSON.parse(rawValue);

    return {
      messages: Array.isArray(parsedValue.messages)
        ? parsedValue.messages
        : [],
      activeSession: parsedValue.activeSession || null
    };
  } catch {
    return {
      messages: [],
      activeSession: null
    };
  }
}

export function saveConversation(conversation) {
  try {
    localStorage.setItem(CONVERSATION_KEY, JSON.stringify(conversation));
  } catch {
    /*
      localStorage 不可用时不阻断当前传讯流程。
    */
  }
}

export function clearConversation() {
  try {
    localStorage.removeItem(CONVERSATION_KEY);
  } catch {
    /*
      不阻断页面。
    */
  }
}
