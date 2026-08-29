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
    throw new Error(`カードの追加に失敗しました (status: ${response.status})`)
  }
  return response.json()
}
