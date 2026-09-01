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

export async function moveCard(cardId, { listId, position }) {
  const response = await fetch(`/api/cards/${cardId}/position`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ listId, position }),
  })
  if (!response.ok) {
    throw new Error(`タスクの並べ替えに失敗しました (status: ${response.status})`)
  }
  return response.json()
}

export async function deleteCard(cardId) {
  const response = await fetch(`/api/cards/${cardId}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error(`タスクの削除に失敗しました (status: ${response.status})`)
  }
}

export async function sortListByPriority(listId) {
  const response = await fetch(`/api/lists/${listId}/cards/sort-by-priority`, {
    method: 'PATCH',
  })
  if (!response.ok) {
    throw new Error(`優先度順の並べ替えに失敗しました (status: ${response.status})`)
  }
  return response.json()
}
