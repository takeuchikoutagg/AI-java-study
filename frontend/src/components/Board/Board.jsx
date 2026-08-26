import { useEffect, useState } from 'react'
import { fetchBoard } from '../../api/board.js'
import TaskListColumn from '../TaskListColumn/TaskListColumn.jsx'
import styles from './Board.module.css'

function Board() {
  const [board, setBoard] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchBoard()
      .then(setBoard)
      .catch((err) => setError(err.message))
  }, [])

  if (error) {
    return <p className={styles.status}>読み込みに失敗しました: {error}</p>
  }

  if (!board) {
    return <p className={styles.status}>読み込み中...</p>
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.boardName}>{board.name}</h1>
      <div className={styles.columns}>
        {board.lists.map((list) => (
          <TaskListColumn key={list.id} list={list} />
        ))}
      </div>
    </div>
  )
}

export default Board
