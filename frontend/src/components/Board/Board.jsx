import { useCallback, useEffect, useState } from 'react'
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core'
import {
  createCard,
  deleteCard,
  deleteList,
  fetchBoard,
  moveCard,
  sortListByPriority,
  updateCard,
} from '../../api/board.js'
import TaskListColumn from '../TaskListColumn/TaskListColumn.jsx'
import { computeDragMove } from './dragEnd.js'
import styles from './Board.module.css'

function Board() {
  const [board, setBoard] = useState(null)
  const [error, setError] = useState(null)
  const [actionError, setActionError] = useState(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )

  const loadBoard = useCallback(() => {
    fetchBoard()
      .then(setBoard)
      .catch((err) => setError(err.message))
  }, [])

  useEffect(() => {
    loadBoard()
  }, [loadBoard])

  const handleAddCard = async (listId, card) => {
    await createCard(listId, card)
    loadBoard()
  }

  const handleUpdateCard = async (cardId, card) => {
    await updateCard(cardId, card)
    loadBoard()
  }

  const handleDeleteCard = async (cardId) => {
    await deleteCard(cardId)
    loadBoard()
  }

  const handleDeleteList = async (listId) => {
    await deleteList(listId)
    loadBoard()
  }

  const handleSortByPriority = async (listId) => {
    await sortListByPriority(listId)
    loadBoard()
  }

  const handleDragEnd = async (event) => {
    const move = computeDragMove(event, board)
    if (!move) return

    setActionError(null)
    try {
      await moveCard(move.cardId, { listId: move.listId, position: move.position })
      loadBoard()
    } catch (err) {
      setActionError(err.message)
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
      {actionError && (
        <p className={styles.actionError}>
          {actionError}
          <button
            type="button"
            className={styles.actionErrorClose}
            onClick={() => setActionError(null)}
            aria-label="閉じる"
          >
            ×
          </button>
        </p>
      )}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className={styles.columns}>
          {board.lists.map((list) => (
            <TaskListColumn
              key={list.id}
              list={list}
              onAddCard={handleAddCard}
              onUpdateCard={handleUpdateCard}
              onDeleteCard={handleDeleteCard}
              onDeleteList={handleDeleteList}
              onSortByPriority={handleSortByPriority}
            />
          ))}
        </div>
      </DndContext>
    </div>
  )
}

export default Board
