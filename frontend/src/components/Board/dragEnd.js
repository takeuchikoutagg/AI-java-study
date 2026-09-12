// dnd-kitのDragEndEventとboardの現在状態から、移動先listId・cardId・positionを算出する純粋関数。
// フレームワーク非依存にしておくことで、実際のドラッグ操作をシミュレートせずにロジック単体をテストできる。
export function computeDragMove(event, board) {
  const { active, over } = event
  if (!over || !board) return null

  const activeData = active.data.current
  const overData = over.data.current
  if (!activeData || !overData) return null

  const destList = board.lists.find((list) => list.id === overData.listId)
  const sourceList = board.lists.find((list) => list.id === activeData.listId)
  if (!destList || !sourceList) return null

  const destCards = destList.cards.filter((card) => card.id !== activeData.cardId)
  const overIndex = overData.cardId != null
    ? destCards.findIndex((card) => card.id === overData.cardId)
    : -1
  const position = overIndex === -1 ? destCards.length : overIndex

  const currentIndex = sourceList.cards.findIndex((card) => card.id === activeData.cardId)
  if (sourceList.id === destList.id && currentIndex === position) return null

  return { cardId: activeData.cardId, listId: destList.id, position }
}
