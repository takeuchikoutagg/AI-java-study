import { useEffect, useState } from 'react'
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core'
import { createCard, fetchBoard, moveCard, sortListByPriority, updateCard } from '../../api/board.js'
import TaskListColumn from '../TaskListColumn/TaskListColumn.jsx'
import styles from './Board.module.css'

function Board() {
  const [board, setBoard] = useState(null)
  const [error, setError] = useState(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )

  const loadBoard = () => {
    fetchBoard()
      .then(setBoard)
      .catch((err) => setError(err.message))
  }

  useEffect(() => {
    loadBoard()
  }, [])

  const handleAddCard = async (listId, card) => {
    await createCard(listId, card)
    loadBoard()
  }

  const handleUpdateCard = async (cardId, card) => {
    await updateCard(cardId, card)
    loadBoard()
  }

  const handleSortByPriority = async (listId) => {
    await sortListByPriority(listId)
    loadBoard()
  }

  const handleDragEnd = async (event) => {
    const { active, over } = event
    if (!over) return

    const activeData = active.data.current
    const overData = over.data.current
    if (!activeData || !overData) return

    const destList = board.lists.find((list) => list.id === overData.listId)
    const sourceList = board.lists.find((list) => list.id === activeData.listId)
    if (!destList || !sourceList) return

    const destCards = destList.cards.filter((card) => card.id !== activeData.cardId)
    const overIndex = overData.cardId != null
      ? destCards.findIndex((card) => card.id === overData.cardId)
      : -1
    const position = overIndex === -1 ? destCards.length : overIndex

    const currentIndex = sourceList.cards.findIndex((card) => card.id === activeData.cardId)
    if (sourceList.id === destList.id && currentIndex === position) return

    try {
      await moveCard(activeData.cardId, { listId: destList.id, position })
      loadBoard()
    } catch (err) {
      console.error(err)
    }
  }

  if (error) {
    return <p className={styles.status}>読み込みに失敗しました: {error}</p>
  }

  if (!board) {
    return <p className={styles.status}>読み込み中...</p>
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.boardName}>{board.name}</h1>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className={styles.columns}>
          {board.lists.map((list) => (
            <TaskListColumn
              key={list.id}
              list={list}
              onAddCard={handleAddCard}
              onUpdateCard={handleUpdateCard}
              onSortByPriority={handleSortByPriority}
            />
          ))}
        </div>
      </DndContext>
    </div>
  )
}

export default Board
