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

const importDialogLayer = document.querySelector("#importDialogLayer");
const importForm = document.querySelector("#importForm");
const importCategorySelect = document.querySelector("#importCategorySelect");
const importTextarea = document.querySelector("#importTextarea");
const importResult = document.querySelector("#importResult");

let settings = getSettings();
let editingCategoryName = null;

function escapeHtml(value) {
  const element = document.createElement("div");
  element.textContent = String(value ?? "");
  return element.innerHTML;
}

function formatWaitTime(seconds) {
  const safeSeconds = Math.max(30, Math.min(900, Number(seconds) || 300));
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

function getAllCardValues() {
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

function saveCurrentSettings() {
  saveSettings(settings);
}

function ensureActiveCategoriesAreValid() {
  const validNames = new Set(getAllCategoryNames());

  settings.activeCategories = [
    ...new Set(
      (settings.activeCategories || []).filter((name) => validNames.has(name))
    )
  ];
}

function updateWaitRangeVisual() {
  const minimum = Number(waitSecondsRange.min);
  const maximum = Number(waitSecondsRange.max);
  const current = Number(waitSecondsRange.value);

  const progress = ((current - minimum) / (maximum - minimum)) * 100;

  waitSecondsRange.style.setProperty("--range-progress", `${progress}%`);
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
  const names = getCustomCategoryNames();

  if (!names.length) {
    customCategoryList.innerHTML = `
      <div class="empty-custom-categories">
        还没有自定义分类。可以先新建一个分类，再导入字卡。
      </div>
    `;

    return;
  }

  customCategoryList.innerHTML = names
    .map((name) => {
      const cards = settings.customCategories[name] || [];

      return `
        <article class="custom-category-card">
          <header class="custom-category-header">
            <div class="custom-category-title">
              <strong>${escapeHtml(name)}</strong>
              <span>${cards.length} CARDS / CUSTOM CATEGORY</span>
            </div>

            <div class="custom-category-actions">
              <button
                class="category-mini-button"
                type="button"
                data-rename-category="${escapeHtml(name)}"
              >
                改名
              </button>

              <button
                class="category-mini-button is-danger"
                type="button"
                data-delete-category="${escapeHtml(name)}"
              >
                删除
              </button>
            </div>
          </header>

          <div class="custom-card-chips">
            ${
              cards.length
                ? cards
                  .map(
                    (card) =>
                      `<span class="custom-card-chip">${escapeHtml(card)}</span>`
                  )
                  .join("")
                : `<span class="custom-card-chip">当前分类还没有字卡</span>`
            }
          </div>
        </article>
      `;
    })
    .join("");
}

function renderImportCategoryOptions() {
  const customNames = getCustomCategoryNames();

  importCategorySelect.innerHTML = customNames.length
    ? customNames
      .map(
        (name) =>
          `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`
      )
      .join("")
    : `<option value="">请先新建一个自定义分类</option>`;

  importCategorySelect.disabled = !customNames.length;
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

function openImportDialog() {
  const customNames = getCustomCategoryNames();

  if (!customNames.length) {
    openCategoryDialog();
    return;
  }

  importTextarea.value = "";
  importResult.textContent = "";
  renderImportCategoryOptions();
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
    categoryNameInput.focus();
    return;
  }

  const builtInNames = new Set(getBuiltInCategoryNames());
  const customNames = new Set(getCustomCategoryNames());

  const isSameName = editingCategoryName === nextName;
  const conflictsWithBuiltIn = builtInNames.has(nextName);
  const conflictsWithCustom = customNames.has(nextName) && !isSameName;

  if (conflictsWithBuiltIn || conflictsWithCustom) {
    categoryDialogNote.textContent = "该名称已经存在，请使用另一个分类名称。";
    categoryNameInput.focus();
    return;
  }

  if (editingCategoryName) {
    const originalCards = settings.customCategories[editingCategoryName] || [];

    delete settings.customCategories[editingCategoryName];
    settings.customCategories[nextName] = originalCards;

    settings.activeCategories = settings.activeCategories.map((name) =>
      name === editingCategoryName ? nextName : name
    );
  } else {
    settings.customCategories[nextName] = [];
  }

  ensureActiveCategoriesAreValid();
  saveCurrentSettings();
  renderAll();
  closeCategoryDialog();
}

function deleteCategory(categoryName) {
  const cards = settings.customCategories[categoryName] || [];

  const confirmed = window.confirm(
    `确认删除分类“${categoryName}”吗？该分类下的 ${cards.length} 张字卡也会一并删除。`
  );

  if (!confirmed) {
    return;
  }

  delete settings.customCategories[categoryName];

  settings.activeCategories = settings.activeCategories.filter(
    (name) => name !== categoryName
  );

  saveCurrentSettings();
  renderAll();
}

function importCards(event) {
  event.preventDefault();

  const categoryName = importCategorySelect.value;
  const rawText = importTextarea.value;

  if (!categoryName || !settings.customCategories[categoryName]) {
    importResult.textContent = "请先选择一个有效的自定义分类。";
    return;
  }

  const existingCards = getAllCardValues();

  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const uniqueIncomingCards = [
    ...new Set(lines)
  ];

  const acceptedCards = uniqueIncomingCards.filter(
    (card) => !existingCards.has(card)
  );

  if (!acceptedCards.length) {
    importResult.textContent = lines.length
      ? "没有新增内容：输入的字卡均已存在或重复。"
      : "没有检测到可导入的字卡内容。";

    return;
  }

  settings.customCategories[categoryName].push(...acceptedCards);

  saveCurrentSettings();
  renderAll();

  importTextarea.value = "";
  importResult.textContent =
    `已成功导入 ${acceptedCards.length} 张字卡；` +
    `跳过 ${Math.max(0, lines.length - acceptedCards.length)} 行重复或无效内容。`;
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
        ...new Set([...settings.activeCategories, categoryName])
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
  importForm.addEventListener("submit", importCards);

  customCategoryList.addEventListener("click", (event) => {
    const renameButton = event.target.closest("[data-rename-category]");
    const deleteButton = event.target.closest("[data-delete-category]");

    if (renameButton) {
      openCategoryDialog(renameButton.dataset.renameCategory);
    }

    if (deleteButton) {
      deleteCategory(deleteButton.dataset.deleteCategory);
    }
  });

  categoryDialogLayer.addEventListener("click", (event) => {
    if (event.target.dataset.closeCategoryDialog === "true") {
      closeCategoryDialog();
    }
  });

  importDialogLayer.addEventListener("click", (event) => {
    if (event.target.dataset.closeImportDialog === "true") {
      closeImportDialog();
    }
  });
}

initialize();
