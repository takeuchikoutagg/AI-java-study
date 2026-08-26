export async function fetchBoard() {
  const response = await fetch('/api/board')
  if (!response.ok) {
    throw new Error(`ボードの取得に失敗しました (status: ${response.status})`)
  }
  return response.json()
}
