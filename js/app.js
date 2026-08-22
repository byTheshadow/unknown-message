(function () {
  "use strict";

  const STORAGE_KEY = "unread-signal-data-v1";

  const DEFAULT_DATA = {
    settings: {
      durationSeconds: 300,
      categories: [
        { id: "pronouns", name: "代词", enabled: true, builtIn: true },
        { id: "actions", name: "动作", enabled: true, builtIn: true },
        { id: "objects", name: "物品", enabled: true, builtIn: true },
        { id: "time-space", name: "时间与地点", enabled: true, builtIn: true }
      ]
    },
    recentTargets: []
  };

  function cloneDefaultData() {
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  }

  function getData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);

      if (!raw) {
        return cloneDefaultData();
      }

      const saved = JSON.parse(raw);

      return {
        ...cloneDefaultData(),
        ...saved,
        settings: {
          ...cloneDefaultData().settings,
          ...(saved.settings || {})
        }
      };
    } catch (error) {
      return cloneDefaultData();
    }
  }

  function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function formatDuration(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  function addRecentTarget(name) {
    const cleanName = String(name || "").trim();

    if (!cleanName) return;

    const data = getData();

    data.recentTargets = [
      cleanName,
      ...data.recentTargets.filter((item) => item !== cleanName)
    ].slice(0, 6);

    saveData(data);
  }

  window.UnreadSignal = {
    getData,
    saveData,
    formatDuration,
    addRecentTarget
  };
})();
