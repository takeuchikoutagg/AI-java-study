async function request(path, options, errorMessage) {
  const response = await fetch(path, options)
  if (!response.ok) {
    throw new Error(`${errorMessage} (status: ${response.status})`)
  }
  return response.status === 204 ? undefined : response.json()
}

export function fetchBoard() {
  return request('/api/board', undefined, 'ボードの取得に失敗しました')
}

export function createCard(listId, card) {
  return request(
    `/api/lists/${listId}/cards`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(card),
    },
    'タスクの追加に失敗しました',
  )
}

export function updateCard(cardId, card) {
  return request(
    `/api/cards/${cardId}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(card),
    },
    'タスクの更新に失敗しました',
  )
}

export function moveCard(cardId, { listId, position }) {
  return request(
    `/api/cards/${cardId}/position`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listId, position }),
    },
    'タスクの並べ替えに失敗しました',
  )
}

export function deleteCard(cardId) {
  return request(`/api/cards/${cardId}`, { method: 'DELETE' }, 'タスクの削除に失敗しました')
}

export function createList(name) {
  return request(
    '/api/lists',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    },
    'リストの追加に失敗しました',
  )
}

export function deleteList(listId) {
  return request(`/api/lists/${listId}`, { method: 'DELETE' }, 'リストの削除に失敗しました')
}

export function sortListByPriority(listId) {
  return request(
    `/api/lists/${listId}/cards/sort-by-priority`,
    { method: 'PATCH' },
    '優先度順の並べ替えに失敗しました',
  )
}
