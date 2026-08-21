(() => {
  const STORAGE_KEY = "unknown-message-settings-v1";

  const DEFAULT_SETTINGS = {
    /*
      回复窗口最大时长。
      设置页后续提供：30 秒、1 分钟、3 分钟、5 分钟、10 分钟、15 分钟。
    */
    responseWindowSeconds: 300,

    /*
      当前启用的字卡分类。
      分类不会影响“性格”或回答倾向；
      只是用户允许在拼接时使用的字卡素材范围。
    */
    enabledCategories: ["默认"],

    /*
      用户创建的分类与字卡：
      [
        {
          id: "category_xxx",
          name: "代词",
          cards: ["我", "你", "我们"]
        }
      ]
    */
    customCategories: [],

    /*
      曾使用过的提问对象。
      用于提问页后续的本地快捷选择。
    */
    recentTargets: [],

    /*
      用户可保存的对话记录。
      具体的数据结构在“结果展示页”完成时定义。
    */
    savedConversations: []
  };

  function cloneDefaultSettings() {
    return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
  }

  function loadSettings() {
    try {
      const storedValue = window.localStorage.getItem(STORAGE_KEY);

      if (!storedValue) {
        return cloneDefaultSettings();
      }

      const parsedValue = JSON.parse(storedValue);

      return {
        ...cloneDefaultSettings(),
        ...parsedValue
      };
    } catch (error) {
      console.warn("无法读取本地设置，将使用默认配置。", error);
      return cloneDefaultSettings();
    }
  }

  function saveSettings(nextSettings) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSettings));
      return true;
    } catch (error) {
      console.warn("无法保存本地设置。", error);
      return false;
    }
  }

  function updateSettings(partialSettings) {
    const currentSettings = loadSettings();

    const nextSettings = {
      ...currentSettings,
      ...partialSettings
    };

    saveSettings(nextSettings);

    return nextSettings;
  }

  function addRecentTarget(targetName) {
    const cleanedName = String(targetName || "").trim();

    if (!cleanedName) {
      return loadSettings().recentTargets;
    }

    const settings = loadSettings();

    const nextTargets = [
      cleanedName,
      ...settings.recentTargets.filter((item) => item !== cleanedName)
    ].slice(0, 12);

    updateSettings({
      recentTargets: nextTargets
    });

    return nextTargets;
  }

  window.UnknownMessageStorage = {
    DEFAULT_SETTINGS,
    loadSettings,
    saveSettings,
    updateSettings,
    addRecentTarget
  };
})();
