const SETTINGS_KEY = "unknown-message.settings";
const CONVERSATION_KEY = "unknown-message.conversation";

/*
  后续 settings.html 会写入：
  {
    waitSeconds: 30 ~ 900,
    activeCategories: ["代词", "动作", "时间", "物品"]
  }
*/

export const defaultSettings = {
  waitSeconds: 300,
  activeCategories: ["代词", "动作", "时间", "物品"]
};

export function getSettings() {
  try {
    const rawValue = localStorage.getItem(SETTINGS_KEY);

    if (!rawValue) {
      return { ...defaultSettings };
    }

    const parsedValue = JSON.parse(rawValue);

    return {
      ...defaultSettings,
      ...parsedValue
    };
  } catch {
    return { ...defaultSettings };
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
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
  localStorage.setItem(CONVERSATION_KEY, JSON.stringify(conversation));
}

export function clearConversation() {
  localStorage.removeItem(CONVERSATION_KEY);
}
