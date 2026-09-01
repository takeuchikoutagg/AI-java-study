import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import Modal from '../Modal/Modal.jsx'
import TaskCard from '../TaskCard/TaskCard.jsx'
import styles from './TaskListColumn.module.css'

function TaskListColumn({ list, onAddCard, onUpdateCard, onDeleteCard, onSortByPriority }) {
  const { setNodeRef } = useDroppable({
    id: `list-${list.id}`,
    data: { listId: list.id },
  })
  const [isAdding, setIsAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [sorting, setSorting] = useState(false)

  const handleSortByPriority = async () => {
    setSorting(true)
    try {
      await onSortByPriority(list.id)
    } catch (err) {
      console.error(err)
    } finally {
      setSorting(false)
    }
  }

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
      <div className={styles.header}>
        <h2 className={styles.title}>{list.name}</h2>
        <button
          className={styles.sortButton}
          onClick={handleSortByPriority}
          disabled={sorting || list.cards.length === 0}
        >
          優先度順に並べ替え
        </button>
      </div>
      <SortableContext
        items={list.cards.map((card) => `card-${card.id}`)}
        strategy={verticalListSortingStrategy}
      >
        <ul ref={setNodeRef} className={styles.cards}>
          {list.cards.map((card) => (
            <TaskCard
              key={card.id}
              card={card}
              listId={list.id}
              onUpdateCard={onUpdateCard}
              onDeleteCard={onDeleteCard}
            />
          ))}
        </ul>
      </SortableContext>

      <button className={styles.addButton} onClick={() => setIsAdding(true)}>
        + タスクを追加
      </button>

      {isAdding && (
        <Modal title="タスクを追加" onClose={resetForm}>
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
        </Modal>
      )}
    </section>
  )
}

export default TaskListColumn
