(function () {
  "use strict";

  const range = document.querySelector("#duration-range");
  const durationValue = document.querySelector("#duration-value");
  const categoryList = document.querySelector("#category-list");
  const enabledCount = document.querySelector("#enabled-count");

  const dialog = document.querySelector("#category-dialog");
  const addButton = document.querySelector("#add-category-button");
  const cancelButton = document.querySelector("#cancel-category-button");
  const categoryForm = document.querySelector("#category-form");
  const categoryNameInput = document.querySelector("#new-category-name");

  function updateRangeUI() {
    const min = Number(range.min);
    const max = Number(range.max);
    const value = Number(range.value);
    const progress = ((value - min) / (max - min)) * 100;

    range.style.setProperty("--range-progress", `${progress}%`);
    durationValue.textContent = window.UnreadSignal.formatDuration(value);
  }

  function saveDuration() {
    const data = window.UnreadSignal.getData();
    data.settings.durationSeconds = Number(range.value);
    window.UnreadSignal.saveData(data);
  }

  function renderCategories() {
    const data = window.UnreadSignal.getData();
    const categories = data.settings.categories || [];

    categoryList.innerHTML = "";

    categories.forEach((category) => {
      const row = document.createElement("div");
      row.className = "category-row";

      const info = document.createElement("div");
      info.className = "category-info";

      const name = document.createElement("span");
      name.className = "category-name";
      name.textContent = category.name;

      const meta = document.createElement("span");
      meta.className = "category-meta";
      meta.textContent = category.builtIn ? "BUILT-IN CATEGORY" : "CUSTOM CATEGORY";

      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = `category-switch${category.enabled ? " is-active" : ""}`;
      toggle.setAttribute("aria-label", `切换 ${category.name} 分类`);
      toggle.setAttribute("aria-pressed", String(category.enabled));

      toggle.addEventListener("click", () => {
        const latestData = window.UnreadSignal.getData();
        const selected = latestData.settings.categories.find(
          (item) => item.id === category.id
        );

        if (!selected) return;

        selected.enabled = !selected.enabled;
        window.UnreadSignal.saveData(latestData);
        renderCategories();
      });

      info.append(name, meta);
      row.append(info, toggle);
      categoryList.appendChild(row);
    });

    const count = categories.filter((category) => category.enabled).length;
    enabledCount.textContent = `${count} 已启用`;
  }

  range.addEventListener("input", () => {
    updateRangeUI();
    saveDuration();
  });

  addButton.addEventListener("click", () => {
    categoryNameInput.value = "";
    dialog.showModal();
    categoryNameInput.focus();
  });

  cancelButton.addEventListener("click", () => {
    dialog.close();
  });

  categoryForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = categoryNameInput.value.trim();

    if (!name) {
      categoryNameInput.focus();
      return;
    }

    const data = window.UnreadSignal.getData();

    data.settings.categories.push({
      id: `custom-${Date.now()}`,
      name,
      enabled: true,
      builtIn: false
    });

    window.UnreadSignal.saveData(data);
    dialog.close();
    renderCategories();
  });

  const data = window.UnreadSignal.getData();

  range.value = data.settings.durationSeconds;
  updateRangeUI();
  renderCategories();
})();
