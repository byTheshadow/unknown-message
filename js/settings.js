import { cardCategories } from "./data/cards.js";
import {
  getSettings,
  saveSettings
} from "./utils/storage.js";

const waitSecondsRange = document.querySelector("#waitSecondsRange");
const waitSecondsOutput = document.querySelector("#waitSecondsOutput");

const categoryToggleList = document.querySelector("#categoryToggleList");
const activeCategoryCount = document.querySelector("#activeCategoryCount");

const customCategoryList = document.querySelector("#customCategoryList");
const createCategoryButton = document.querySelector("#createCategoryButton");
const openImportButton = document.querySelector("#openImportButton");

const categoryDialogLayer = document.querySelector("#categoryDialogLayer");
const categoryForm = document.querySelector("#categoryForm");
const categoryDialogKicker = document.querySelector("#categoryDialogKicker");
const categoryDialogTitle = document.querySelector("#categoryDialogTitle");
const categoryDialogNote = document.querySelector("#categoryDialogNote");
const categoryNameInput = document.querySelector("#categoryNameInput");

const cardDialogLayer = document.querySelector("#cardDialogLayer");
const cardForm = document.querySelector("#cardForm");
const cardContentInput = document.querySelector("#cardContentInput");
const cardDialogNote = document.querySelector("#cardDialogNote");

const importDialogLayer = document.querySelector("#importDialogLayer");
const importForm = document.querySelector("#importForm");
const importCategorySelect = document.querySelector("#importCategorySelect");
const importTextarea = document.querySelector("#importTextarea");
const importResult = document.querySelector("#importResult");

let settings = getSettings();

let editingCategoryName = null;

let editingCard = {
  categoryName: null,
  originalCard: null
};

function escapeHtml(value) {
  const element = document.createElement("div");

  element.textContent = String(value ?? "");

  return element.innerHTML;
}

function formatWaitTime(seconds) {
  const safeSeconds = Math.max(
    30,
    Math.min(900, Number(seconds) || 300)
  );

  const minutes = String(Math.floor(safeSeconds / 60)).padStart(2, "0");
  const remainder = String(safeSeconds % 60).padStart(2, "0");

  return `${minutes}:${remainder}`;
}

function getBuiltInCategoryNames() {
  return Object.keys(cardCategories);
}

function getCustomCategoryNames() {
  return Object.keys(settings.customCategories || {});
}

function getAllCategoryNames() {
  return [
    ...getBuiltInCategoryNames(),
    ...getCustomCategoryNames()
  ];
}

function getAllCards() {
  const builtInCards = Object.values(cardCategories).flat();

  const customCards = Object.values(settings.customCategories || {})
    .flat()
    .map((card) => String(card || "").trim());

  return new Set(
    [...builtInCards, ...customCards]
      .map((card) => String(card || "").trim())
      .filter(Boolean)
  );
}

function ensureActiveCategoriesAreValid() {
  const validNames = new Set(getAllCategoryNames());

  settings.activeCategories = [
    ...new Set(
      (settings.activeCategories || []).filter((name) =>
        validNames.has(name)
      )
    )
  ];
}

function saveCurrentSettings() {
  ensureActiveCategoriesAreValid();
  saveSettings(settings);
}

function updateWaitRangeVisual() {
  const minimum = Number(waitSecondsRange.min);
  const maximum = Number(waitSecondsRange.max);
  const current = Number(waitSecondsRange.value);

  const progress = ((current - minimum) / (maximum - minimum)) * 100;

  waitSecondsRange.style.setProperty(
    "--range-progress",
    `${progress}%`
  );

  waitSecondsOutput.textContent = formatWaitTime(current);
}

function renderWaitControl() {
  waitSecondsRange.value = String(settings.waitSeconds);
  updateWaitRangeVisual();
}

function renderActiveCategoryCount() {
  activeCategoryCount.textContent =
    `${settings.activeCategories.length} 已启用`;
}

function renderCategoryToggles() {
  const activeSet = new Set(settings.activeCategories);

  categoryToggleList.innerHTML = getAllCategoryNames()
    .map((name) => {
      const isBuiltIn = Object.prototype.hasOwnProperty.call(
        cardCategories,
        name
      );

      const cards = isBuiltIn
        ? cardCategories[name]
        : settings.customCategories[name] || [];

      return `
        <label class="category-toggle-row">
          <span class="category-toggle-name">
            <strong>${escapeHtml(name)}</strong>
            <span>
              ${isBuiltIn ? "BUILT-IN" : "CUSTOM"} / ${cards.length} CARDS
            </span>
          </span>

          <span class="toggle-control">
            <input
              type="checkbox"
              value="${escapeHtml(name)}"
              ${activeSet.has(name) ? "checked" : ""}
              aria-label="启用分类 ${escapeHtml(name)}"
            />
            <span class="toggle-track"></span>
          </span>
        </label>
      `;
    })
    .join("");

  renderActiveCategoryCount();
}

function renderCustomCategories() {
  const categoryNames = getCustomCategoryNames();

  if (!categoryNames.length) {
    customCategoryList.innerHTML = `
      <div class="empty-custom-categories">
        还没有自定义分类。可以先新建一个分类，再导入字卡。
      </div>
    `;

    return;
  }

  customCategoryList.innerHTML = categoryNames
    .map((categoryName) => {
      const cards = settings.customCategories[categoryName] || [];

      const cardRows = cards.length
        ? cards
          .map((card) => `
            <div class="custom-card-row">
              <span class="custom-card-copy">
                ${escapeHtml(card)}
              </span>

              <div class="custom-card-actions">
                <button
                  class="card-mini-button"
                  type="button"
                  data-edit-card-category="${escapeHtml(categoryName)}"
                  data-edit-card-value="${escapeHtml(card)}"
                >
                  编辑
                </button>

                <button
                  class="card-mini-button is-danger"
                  type="button"
                  data-delete-card-category="${escapeHtml(categoryName)}"
                  data-delete-card-value="${escapeHtml(card)}"
                >
                  删除
                </button>
              </div>
            </div>
          `)
          .join("")
        : `
          <div class="empty-custom-cards">
            当前分类还没有字卡。
          </div>
        `;

      return `
        <article class="custom-category-card">
          <header class="custom-category-header">
            <div class="custom-category-title">
              <strong>${escapeHtml(categoryName)}</strong>
              <span>${cards.length} CARDS / CUSTOM CATEGORY</span>
            </div>

            <div class="custom-category-actions">
              <button
                class="category-mini-button"
                type="button"
                data-rename-category="${escapeHtml(categoryName)}"
              >
                改名
              </button>

              <button
                class="category-mini-button is-danger"
                type="button"
                data-delete-category="${escapeHtml(categoryName)}"
              >
                删除分类
              </button>
            </div>
          </header>

          <div class="custom-card-list">
            ${cardRows}
          </div>
        </article>
      `;
    })
    .join("");
}

function renderImportCategoryOptions() {
  const categoryNames = getCustomCategoryNames();

  importCategorySelect.innerHTML = categoryNames.length
    ? categoryNames
      .map(
        (name) =>
          `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`
      )
      .join("")
    : `<option value="">请先新建一个自定义分类</option>`;

  importCategorySelect.disabled = !categoryNames.length;
}

function renderAll() {
  ensureActiveCategoriesAreValid();

  renderWaitControl();
  renderCategoryToggles();
  renderCustomCategories();
  renderImportCategoryOptions();
}

function openCategoryDialog(categoryName = null) {
  editingCategoryName = categoryName;

  const isEditing = Boolean(categoryName);

  categoryDialogKicker.textContent = isEditing
    ? "RENAME CATEGORY"
    : "CREATE CATEGORY";

  categoryDialogTitle.textContent = isEditing
    ? "修改分类名称"
    : "新建分类";

  categoryDialogNote.textContent = isEditing
    ? "修改后，分类中的字卡会完整保留。"
    : "分类名称不能与现有内置分类或自定义分类重复。";

  categoryNameInput.value = categoryName || "";

  categoryDialogLayer.classList.remove("is-hidden");

  window.setTimeout(() => {
    categoryNameInput.focus();
    categoryNameInput.select();
  }, 30);
}

function closeCategoryDialog() {
  categoryDialogLayer.classList.add("is-hidden");
  categoryForm.reset();

  editingCategoryName = null;
}

function openCardDialog(categoryName, card) {
  editingCard = {
    categoryName,
    originalCard: card
  };

  cardContentInput.value = card;

  cardDialogNote.textContent =
    "保存时会自动清理首尾空格；内容不能与已有内置或自定义字卡重复。";

  cardDialogLayer.classList.remove("is-hidden");

  window.setTimeout(() => {
    cardContentInput.focus();
    cardContentInput.select();
  }, 30);
}

function closeCardDialog() {
  cardDialogLayer.classList.add("is-hidden");
  cardForm.reset();

  editingCard = {
    categoryName: null,
    originalCard: null
  };
}

function openImportDialog() {
  const categoryNames = getCustomCategoryNames();

  /*
    尚未创建分类时，不展示无法选择导入目标的弹窗，
    直接引导用户先创建分类。
  */
  if (!categoryNames.length) {
    openCategoryDialog();
    return;
  }

  renderImportCategoryOptions();

  importTextarea.value = "";
  importResult.textContent = "";

  importDialogLayer.classList.remove("is-hidden");

  window.setTimeout(() => {
    importTextarea.focus();
  }, 30);
}

function closeImportDialog() {
  importDialogLayer.classList.add("is-hidden");
  importForm.reset();

  importResult.textContent = "";
}

function createOrRenameCategory(event) {
  event.preventDefault();

  const nextName = categoryNameInput.value.trim();

  if (!nextName) {
    categoryDialogNote.textContent = "请填写分类名称。";
    categoryNameInput.focus();
    return;
  }

  const builtInNames = new Set(getBuiltInCategoryNames());
  const customNames = new Set(getCustomCategoryNames());

  const isSameName = editingCategoryName === nextName;

  if (
    builtInNames.has(nextName) ||
    (customNames.has(nextName) && !isSameName)
  ) {
    categoryDialogNote.textContent =
      "该分类名称已经存在，请使用其他名称。";

    categoryNameInput.focus();
    return;
  }

  if (editingCategoryName) {
    const cards = settings.customCategories[editingCategoryName] || [];

    delete settings.customCategories[editingCategoryName];

    settings.customCategories[nextName] = cards;

    settings.activeCategories = settings.activeCategories.map((name) =>
      name === editingCategoryName ? nextName : name
    );
  } else {
    settings.customCategories[nextName] = [];
  }

  saveCurrentSettings();
  renderAll();
  closeCategoryDialog();
}

function deleteCategory(categoryName) {
  const cards = settings.customCategories[categoryName] || [];

  const shouldDelete = window.confirm(
    `确认删除分类“${categoryName}”吗？该分类下的 ${cards.length} 张字卡也会一并删除。`
  );

  if (!shouldDelete) {
    return;
  }

  delete settings.customCategories[categoryName];

  settings.activeCategories = settings.activeCategories.filter(
    (name) => name !== categoryName
  );

  saveCurrentSettings();
  renderAll();
}

function saveEditedCard(event) {
  event.preventDefault();

  const categoryName = editingCard.categoryName;
  const originalCard = editingCard.originalCard;
  const nextCard = cardContentInput.value.trim();

  if (!categoryName || !originalCard) {
    closeCardDialog();
    return;
  }

  if (!nextCard) {
    cardDialogNote.textContent = "字卡内容不能为空。";
    cardContentInput.focus();
    return;
  }

  /*
    编辑成新内容时，做全局去重：
    内置字卡、其他自定义分类、当前分类其他字卡均不可重复。
  */
  if (nextCard !== originalCard) {
    const allCards = getAllCards();

    if (allCards.has(nextCard)) {
      cardDialogNote.textContent =
        "该字卡内容已经存在，无法重复保存。";

      cardContentInput.focus();
      return;
    }
  }

  const cards = settings.customCategories[categoryName];

  if (!Array.isArray(cards)) {
    closeCardDialog();
    return;
  }

  const cardIndex = cards.indexOf(originalCard);

  if (cardIndex < 0) {
    closeCardDialog();
    return;
  }

  cards[cardIndex] = nextCard;

  saveCurrentSettings();
  renderAll();
  closeCardDialog();
}

function deleteCard(categoryName, card) {
  const shouldDelete = window.confirm(`确认删除字卡“${card}”吗？`);

  if (!shouldDelete) {
    return;
  }

  const cards = settings.customCategories[categoryName];

  if (!Array.isArray(cards)) {
    return;
  }

  settings.customCategories[categoryName] = cards.filter(
    (item) => item !== card
  );

  saveCurrentSettings();
  renderAll();
}

function importCards(event) {
  event.preventDefault();

  const categoryName = importCategorySelect.value;

  if (!categoryName || !settings.customCategories[categoryName]) {
    importResult.textContent = "请先选择有效的自定义分类。";
    return;
  }

  /*
    一行一张：
    - 清理每行首尾空格；
    - 过滤空行；
    - 先对本次输入自身去重；
    - 再与全部内置、自定义字卡做全局去重。
  */
  const inputCards = importTextarea.value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const uniqueInputCards = [...new Set(inputCards)];
  const existingCards = getAllCards();

  const acceptedCards = uniqueInputCards.filter(
    (card) => !existingCards.has(card)
  );

  if (!acceptedCards.length) {
    importResult.textContent = inputCards.length
      ? "没有新增内容：输入的字卡均已存在或重复。"
      : "没有检测到可导入的字卡内容。";

    return;
  }

  settings.customCategories[categoryName].push(...acceptedCards);

  saveCurrentSettings();
  renderAll();

  importTextarea.value = "";

  const skippedCount = Math.max(
    0,
    inputCards.length - acceptedCards.length
  );

  importResult.textContent =
    `成功导入 ${acceptedCards.length} 张字卡；` +
    `跳过 ${skippedCount} 行重复或无效内容。`;
}

function initialize() {
  renderAll();

  waitSecondsRange.addEventListener("input", () => {
    settings.waitSeconds = Number(waitSecondsRange.value);
    updateWaitRangeVisual();
  });

  waitSecondsRange.addEventListener("change", () => {
    settings.waitSeconds = Number(waitSecondsRange.value);
    saveCurrentSettings();
  });

  categoryToggleList.addEventListener("change", (event) => {
    const input = event.target;

    if (!(input instanceof HTMLInputElement) || input.type !== "checkbox") {
      return;
    }

    const categoryName = input.value;

    if (input.checked) {
      settings.activeCategories = [
        ...new Set([
          ...settings.activeCategories,
          categoryName
        ])
      ];
    } else {
      settings.activeCategories = settings.activeCategories.filter(
        (name) => name !== categoryName
      );
    }

    saveCurrentSettings();
    renderActiveCategoryCount();
  });

  createCategoryButton.addEventListener("click", () => {
    openCategoryDialog();
  });

  openImportButton.addEventListener("click", openImportDialog);

  categoryForm.addEventListener("submit", createOrRenameCategory);
  cardForm.addEventListener("submit", saveEditedCard);
  importForm.addEventListener("submit", importCards);

  customCategoryList.addEventListener("click", (event) => {
    const renameButton = event.target.closest("[data-rename-category]");
    const deleteCategoryButton = event.target.closest(
      "[data-delete-category]"
    );

    const editCardButton = event.target.closest(
      "[data-edit-card-category]"
    );

    const deleteCardButton = event.target.closest(
      "[data-delete-card-category]"
    );

    if (renameButton) {
      openCategoryDialog(renameButton.dataset.renameCategory);
      return;
    }

    if (deleteCategoryButton) {
      deleteCategory(deleteCategoryButton.dataset.deleteCategory);
      return;
    }

    if (editCardButton) {
      openCardDialog(
        editCardButton.dataset.editCardCategory,
        editCardButton.dataset.editCardValue
      );
      return;
    }

    if (deleteCardButton) {
      deleteCard(
        deleteCardButton.dataset.deleteCardCategory,
        deleteCardButton.dataset.deleteCardValue
      );
    }
  });

  categoryDialogLayer.addEventListener("click", (event) => {
    if (event.target.dataset.closeCategoryDialog === "true") {
      closeCategoryDialog();
    }
  });

  cardDialogLayer.addEventListener("click", (event) => {
    if (event.target.dataset.closeCardDialog === "true") {
      closeCardDialog();
    }
  });

  importDialogLayer.addEventListener("click", (event) => {
    if (event.target.dataset.closeImportDialog === "true") {
      closeImportDialog();
    }
  });
}

// 导出刷新函数，供 SPA 切页时调用
export function refreshSettingsPage() {
  settings = getSettings();
  renderAll();
}

// 保持原本的初始化调用
initialize();

