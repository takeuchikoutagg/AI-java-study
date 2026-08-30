export async function fetchBoard() {
  const response = await fetch('/api/board')
  if (!response.ok) {
    throw new Error(`ボードの取得に失敗しました (status: ${response.status})`)
  }
  return response.json()
}

export async function createCard(listId, card) {
  const response = await fetch(`/api/lists/${listId}/cards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(card),
  })
  if (!response.ok) {
    throw new Error(`タスクの追加に失敗しました (status: ${response.status})`)
  }
  return response.json()
}

export async function updateCard(cardId, card) {
  const response = await fetch(`/api/cards/${cardId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(card),
  })
  if (!response.ok) {
    throw new Error(`タスクの更新に失敗しました (status: ${response.status})`)
  }
  return response.json()
}
