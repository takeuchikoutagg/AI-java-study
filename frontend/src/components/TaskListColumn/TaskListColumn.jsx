import { useState } from 'react'
import TaskCard from '../TaskCard/TaskCard.jsx'
import styles from './TaskListColumn.module.css'

function TaskListColumn({ list, onAddCard, onUpdateCard }) {
  const [isAdding, setIsAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const resetForm = () => {
    setTitle('')
    setDueDate('')
    setPriority('')
    setError(null)
    setIsAdding(false)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!title.trim()) {
      setError('タイトルを入力してください')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      await onAddCard(list.id, {
        title: title.trim(),
        dueDate: dueDate || null,
        priority: priority || null,
      })
      resetForm()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className={styles.column}>
      <h2 className={styles.title}>{list.name}</h2>
      <ul className={styles.cards}>
        {list.cards.map((card) => (
          <TaskCard key={card.id} card={card} onUpdateCard={onUpdateCard} />
        ))}
      </ul>

      {isAdding ? (
        <form className={styles.addForm} onSubmit={handleSubmit}>
          <input
            className={styles.input}
            type="text"
            placeholder="タスクのタイトル"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            autoFocus
          />
          <input
            className={styles.input}
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
          />
          <select
            className={styles.input}
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
          >
            <option value="">優先度なし</option>
            <option value="HIGH">高</option>
            <option value="MEDIUM">中</option>
            <option value="LOW">低</option>
          </select>
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.actions}>
            <button type="submit" className={styles.submitButton} disabled={submitting}>
              追加
            </button>
            <button type="button" className={styles.cancelButton} onClick={resetForm}>
              キャンセル
            </button>
          </div>
        </form>
      ) : (
        <button className={styles.addButton} onClick={() => setIsAdding(true)}>
          + タスクを追加
        </button>
      )}
    </section>
  )
}

export default TaskListColumn
