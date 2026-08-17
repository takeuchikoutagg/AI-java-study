"use strict";

const STORAGE_KEY = "taskBoardData";
const STORAGE_VERSION = 1;

const PRIORITY_LABEL = { high: "高", medium: "中", low: "低" };

let state = loadState();
let pendingConfirmAction = null;

// ---------- データ層 ----------

function genId(prefix) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function createDefaultState() {
  return {
    version: STORAGE_VERSION,
    board: { id: "board-1", name: "マイボード" },
    lists: [
      { id: genId("list"), boardId: "board-1", name: "未着手" },
      { id: genId("list"), boardId: "board-1", name: "作業中" },
      { id: genId("list"), boardId: "board-1", name: "完了" },
    ],
    cards: [],
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultState();
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== STORAGE_VERSION) return createDefaultState();
    return parsed;
  } catch (e) {
    console.error("localStorageの読み込みに失敗しました", e);
    return createDefaultState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function persist() {
  saveState();
  render();
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[ch]));
}

function formatDueDate(dueDate) {
  if (!dueDate) return "";
  const parts = dueDate.split("-");
  if (parts.length !== 3) return escapeHtml(dueDate);
  const [y, m, d] = parts;
  return `${y}/${m}/${d}`;
}

// ---------- 描画層 ----------

function render() {
  const board = document.getElementById("board");
  board.innerHTML = state.lists.map((list) => renderListColumn(list)).join("");
}

function renderListColumn(list) {
  const cards = state.cards.filter((c) => c.listId === list.id);
  return `
    <section class="list-column" data-list-id="${escapeHtml(list.id)}">
      <header class="list-column__header">
        <h2 class="list-column__title">${escapeHtml(list.name)}</h2>
        <div class="list-column__header-actions">
          <button type="button" class="icon-btn" data-action="sort-priority" data-list-id="${escapeHtml(list.id)}" aria-label="優先度で並べ替え" title="優先度で並べ替え(高→中→低)">⇅</button>
          <button type="button" class="icon-btn" data-action="delete-list" data-list-id="${escapeHtml(list.id)}" aria-label="リストを削除">×</button>
        </div>
      </header>
      <div class="list-column__cards">
        ${cards.length ? cards.map((c) => renderCard(c)).join("") : '<p class="list-column__empty">カードなし</p>'}
      </div>
      <button type="button" class="btn btn--add-card" data-action="open-add-card" data-list-id="${escapeHtml(list.id)}">+ カードを追加</button>
    </section>
  `;
}

function renderCard(card) {
  const priorityClass = card.priority ? ` card--priority-${escapeHtml(card.priority)}` : "";
  const priorityBadge = card.priority
    ? `<span class="card__priority-badge card__priority-badge--${escapeHtml(card.priority)}">${escapeHtml(PRIORITY_LABEL[card.priority])}</span>`
    : "";
  const dueDateHtml = card.dueDate
    ? `<span class="card__due-date">📅 ${formatDueDate(card.dueDate)}</span>`
    : "";

  return `
    <article class="card${priorityClass}" data-card-id="${escapeHtml(card.id)}" draggable="true">
      <p class="card__title">${escapeHtml(card.title)}</p>
      <div class="card__meta">
        ${dueDateHtml}
        ${priorityBadge}
      </div>
      <div class="card__footer">
        <select class="card__move-select" data-action="move-card" data-card-id="${escapeHtml(card.id)}">
          <option value="">移動先を選択…</option>
          ${buildMoveSelectOptions(card.listId)}
        </select>
        <div class="card__actions">
          <button type="button" class="icon-btn" data-action="edit-card" data-card-id="${escapeHtml(card.id)}" aria-label="編集">✎</button>
          <button type="button" class="icon-btn" data-action="delete-card" data-card-id="${escapeHtml(card.id)}" aria-label="削除">🗑</button>
        </div>
      </div>
    </article>
  `;
}

function buildMoveSelectOptions(currentListId) {
  return state.lists
    .filter((l) => l.id !== currentListId)
    .map((l) => `<option value="${escapeHtml(l.id)}">${escapeHtml(l.name)}</option>`)
    .join("");
}

// ---------- リスト操作 ----------

function addList(name) {
  const trimmed = name.trim();
  if (!trimmed) return;
  state.lists.push({ id: genId("list"), boardId: state.board.id, name: trimmed });
  persist();
}

function deleteList(listId) {
  state.lists = state.lists.filter((l) => l.id !== listId);
  state.cards = state.cards.filter((c) => c.listId !== listId);
  persist();
}

const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };

// 指定リスト内のカードを優先度(高→中→低、未設定は最後)で並べ替える。
// 同じ優先度同士は元の相対順を維持する（Array#sortは安定ソート）。
// 他のリストのカードの位置は変えたくないため、対象リストのカードが
// 元々あった配列インデックスだけを使って並べ替え結果を書き戻す。
function sortListByPriority(listId) {
  const rank = (card) => PRIORITY_RANK[card.priority] ?? 3;

  const indices = [];
  const cardsInList = [];
  state.cards.forEach((card, index) => {
    if (card.listId === listId) {
      indices.push(index);
      cardsInList.push(card);
    }
  });

  cardsInList.sort((a, b) => rank(a) - rank(b));
  indices.forEach((index, i) => {
    state.cards[index] = cardsInList[i];
  });

  persist();
}

// ---------- カード操作 ----------

function addCard(listId, { title, dueDate, priority }) {
  const trimmed = title.trim();
  if (!trimmed) return;
  state.cards.push({
    id: genId("card"),
    listId,
    title: trimmed,
    dueDate: dueDate || null,
    priority: priority || null,
  });
  persist();
}

function updateCard(cardId, { title, dueDate, priority }) {
  const card = state.cards.find((c) => c.id === cardId);
  if (!card) return;
  const trimmed = title.trim();
  if (!trimmed) return;
  card.title = trimmed;
  card.dueDate = dueDate || null;
  card.priority = priority || null;
  persist();
}

function deleteCard(cardId) {
  state.cards = state.cards.filter((c) => c.id !== cardId);
  persist();
}

function moveCard(cardId, targetListId) {
  moveCardToPosition(cardId, targetListId, null);
}

// beforeCardId を指定すると、そのカードの直前に挿入する。
// null の場合は移動先リストの末尾に追加する。
// 表示順は state.cards 配列の格納順（同じlistIdのカード同士の相対順）で決まるため、
// 配列全体の中でbeforeCardIdの直前にsplice挿入すれば、目的のリスト内での位置が実現できる。
function moveCardToPosition(cardId, targetListId, beforeCardId) {
  const fromIndex = state.cards.findIndex((c) => c.id === cardId);
  if (fromIndex === -1) return;
  const [card] = state.cards.splice(fromIndex, 1);
  card.listId = targetListId;

  const targetIndex = beforeCardId ? state.cards.findIndex((c) => c.id === beforeCardId) : -1;
  if (targetIndex === -1) {
    state.cards.push(card);
  } else {
    state.cards.splice(targetIndex, 0, card);
  }
  persist();
}

// ---------- モーダル制御 ----------

function openModal(id) {
  document.getElementById(id).showModal();
}

function closeModal(id) {
  document.getElementById(id).close();
}

function openAddListModal() {
  document.getElementById("list-name-input").value = "";
  openModal("list-modal");
  document.getElementById("list-name-input").focus();
}

function openCardModal({ mode, listId, cardId }) {
  const heading = document.getElementById("card-modal-heading");
  const submitBtn = document.getElementById("card-form-submit");
  const titleInput = document.getElementById("card-title-input");
  const dueDateInput = document.getElementById("card-due-date-input");
  const priorityInput = document.getElementById("card-priority-input");

  document.getElementById("card-modal-mode").value = mode;

  if (mode === "add") {
    heading.textContent = "カードを追加";
    submitBtn.textContent = "追加";
    document.getElementById("card-modal-list-id").value = listId;
    document.getElementById("card-modal-card-id").value = "";
    titleInput.value = "";
    dueDateInput.value = "";
    priorityInput.value = "";
  } else {
    const card = state.cards.find((c) => c.id === cardId);
    if (!card) return;
    heading.textContent = "カードを編集";
    submitBtn.textContent = "保存";
    document.getElementById("card-modal-list-id").value = "";
    document.getElementById("card-modal-card-id").value = cardId;
    titleInput.value = card.title;
    dueDateInput.value = card.dueDate || "";
    priorityInput.value = card.priority || "";
  }

  openModal("card-modal");
  titleInput.focus();
}

function confirmDeleteList(listId) {
  const list = state.lists.find((l) => l.id === listId);
  if (!list) return;
  openConfirm(`「${list.name}」を削除します。リスト内のカードもすべて削除されます。よろしいですか？`, () => deleteList(listId));
}

function confirmDeleteCard(cardId) {
  const card = state.cards.find((c) => c.id === cardId);
  if (!card) return;
  openConfirm(`「${card.title}」を削除します。よろしいですか？`, () => deleteCard(cardId));
}

function openConfirm(message, onConfirm) {
  document.getElementById("confirm-modal-message").textContent = message;
  pendingConfirmAction = onConfirm;
  openModal("confirm-modal");
}

// ---------- イベント登録 ----------

document.getElementById("board").addEventListener("click", (event) => {
  const btn = event.target.closest("[data-action]");
  if (!btn) return;
  const action = btn.dataset.action;

  if (action === "open-add-list") openAddListModal();
  if (action === "delete-list") confirmDeleteList(btn.dataset.listId);
  if (action === "sort-priority") sortListByPriority(btn.dataset.listId);
  if (action === "open-add-card") openCardModal({ mode: "add", listId: btn.dataset.listId });
  if (action === "edit-card") openCardModal({ mode: "edit", cardId: btn.dataset.cardId });
  if (action === "delete-card") confirmDeleteCard(btn.dataset.cardId);
});

document.getElementById("board").addEventListener("change", (event) => {
  const select = event.target.closest('[data-action="move-card"]');
  if (!select || !select.value) return;
  moveCard(select.dataset.cardId, select.value);
});

// ---------- ドラッグ&ドロップでのカード移動 ----------

const board = document.getElementById("board");

board.addEventListener("dragstart", (event) => {
  const card = event.target.closest(".card");
  if (!card) return;
  event.dataTransfer.setData("text/plain", card.dataset.cardId);
  event.dataTransfer.effectAllowed = "move";
  card.classList.add("card--dragging");
});

function clearDragOverIndicators() {
  document.querySelectorAll(".list-column__cards--drag-over").forEach((el) => {
    el.classList.remove("list-column__cards--drag-over");
  });
  document.querySelectorAll(".card--drag-over-top, .card--drag-over-bottom").forEach((el) => {
    el.classList.remove("card--drag-over-top", "card--drag-over-bottom");
  });
}

// ドロップ先カードの上半分/下半分どちらにカーソルがあるかで、挿入先を判定する。
// 戻り値は「このカードの直前に挿入する」ためのcardId（末尾に挿入する場合はnull）。
function resolveInsertionBeforeCardId(dropZone, event, draggedCardId) {
  const overCard = event.target.closest(".card");
  if (!overCard || overCard.dataset.cardId === draggedCardId || !dropZone.contains(overCard)) {
    return null;
  }
  const rect = overCard.getBoundingClientRect();
  const isTopHalf = event.clientY - rect.top < rect.height / 2;
  if (isTopHalf) return overCard.dataset.cardId;
  const next = overCard.nextElementSibling;
  return next && next.classList.contains("card") ? next.dataset.cardId : null;
}

board.addEventListener("dragend", (event) => {
  const card = event.target.closest(".card");
  if (card) card.classList.remove("card--dragging");
  clearDragOverIndicators();
});

board.addEventListener("dragover", (event) => {
  const dropZone = event.target.closest(".list-column__cards");
  if (!dropZone) return;
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
  dropZone.classList.add("list-column__cards--drag-over");

  dropZone.querySelectorAll(".card--drag-over-top, .card--drag-over-bottom").forEach((el) => {
    el.classList.remove("card--drag-over-top", "card--drag-over-bottom");
  });
  const overCard = event.target.closest(".card");
  if (overCard) {
    const rect = overCard.getBoundingClientRect();
    const isTopHalf = event.clientY - rect.top < rect.height / 2;
    overCard.classList.toggle("card--drag-over-top", isTopHalf);
    overCard.classList.toggle("card--drag-over-bottom", !isTopHalf);
  }
});

board.addEventListener("dragleave", (event) => {
  const dropZone = event.target.closest(".list-column__cards");
  if (!dropZone) return;
  if (dropZone.contains(event.relatedTarget)) return;
  dropZone.classList.remove("list-column__cards--drag-over");
});

board.addEventListener("drop", (event) => {
  const dropZone = event.target.closest(".list-column__cards");
  if (!dropZone) return;
  event.preventDefault();
  const cardId = event.dataTransfer.getData("text/plain");
  const targetListId = dropZone.closest(".list-column").dataset.listId;
  const beforeCardId = resolveInsertionBeforeCardId(dropZone, event, cardId);
  clearDragOverIndicators();
  moveCardToPosition(cardId, targetListId, beforeCardId);
});

document.querySelector('.app-header [data-action="open-add-list"]').addEventListener("click", openAddListModal);

document.querySelectorAll("[data-action='close-modal']").forEach((btn) => {
  btn.addEventListener("click", () => closeModal(btn.dataset.target));
});

document.getElementById("list-form").addEventListener("submit", (event) => {
  event.preventDefault();
  addList(document.getElementById("list-name-input").value);
  closeModal("list-modal");
});

document.getElementById("card-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const mode = document.getElementById("card-modal-mode").value;
  const payload = {
    title: document.getElementById("card-title-input").value,
    dueDate: document.getElementById("card-due-date-input").value,
    priority: document.getElementById("card-priority-input").value,
  };

  if (mode === "add") {
    addCard(document.getElementById("card-modal-list-id").value, payload);
  } else {
    updateCard(document.getElementById("card-modal-card-id").value, payload);
  }
  closeModal("card-modal");
});

document.getElementById("confirm-modal-ok").addEventListener("click", () => {
  pendingConfirmAction?.();
  pendingConfirmAction = null;
  closeModal("confirm-modal");
});

// dialog外側クリックで閉じる
document.querySelectorAll("dialog.modal").forEach((dialog) => {
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
});

// ---------- 初期化 ----------

render();
