const STORAGE_KEY = "task-board-data";
const LIST_IDS = ["todo", "doing", "done"];

function loadBoard() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    return JSON.parse(saved);
  }
  return { todo: [], doing: [], done: [] };
}

function saveBoard(board) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(board));
}

let board = loadBoard();

function render() {
  for (const listId of LIST_IDS) {
    const container = document.getElementById(`cards-${listId}`);
    container.innerHTML = "";

    for (const card of board[listId]) {
      const cardEl = document.createElement("div");
      cardEl.className = "card";

      const textEl = document.createElement("span");
      textEl.className = "card-text";
      textEl.textContent = card.text;

      const deleteButton = document.createElement("button");
      deleteButton.className = "delete-button";
      deleteButton.textContent = "×";
      deleteButton.addEventListener("click", () => {
        board[listId] = board[listId].filter((c) => c.id !== card.id);
        saveBoard(board);
        render();
      });

      cardEl.append(textEl, deleteButton);
      container.append(cardEl);
    }
  }
}

document.querySelectorAll(".add-card-form").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const listId = form.dataset.listId;
    const input = form.querySelector("input");
    const text = input.value.trim();
    if (!text) return;

    board[listId].push({ id: crypto.randomUUID(), text });
    saveBoard(board);
    input.value = "";
    render();
  });
});

render();
