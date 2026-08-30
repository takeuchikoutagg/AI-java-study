import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Modal from '../Modal/Modal.jsx'
import styles from './TaskCard.module.css'

const PRIORITY_LABEL = {
  HIGH: '高',
  MEDIUM: '中',
  LOW: '低',
}

const PRIORITY_CLASS = {
  HIGH: styles.priorityHigh,
  MEDIUM: styles.priorityMedium,
  LOW: styles.priorityLow,
}

function TaskCard({ card, listId, onUpdateCard }) {
  const [editingField, setEditingField] = useState(null)
  const [priority, setPriority] = useState(card.priority ?? '')
  const [dueDate, setDueDate] = useState(card.dueDate ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `card-${card.id}`,
    data: { listId, cardId: card.id },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const openPriorityModal = () => {
    setPriority(card.priority ?? '')
    setError(null)
    setEditingField('priority')
  }

  const openDueDateModal = () => {
    setDueDate(card.dueDate ?? '')
    setError(null)
    setEditingField('dueDate')
  }

  const closeModal = () => setEditingField(null)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await onUpdateCard(card.id, {
        title: card.title,
        dueDate: editingField === 'dueDate' ? dueDate || null : card.dueDate,
        priority: editingField === 'priority' ? priority || null : card.priority,
      })
      closeModal()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <li ref={setNodeRef} style={style} className={styles.card}>
      <div className={styles.cardHeader}>
        <p className={styles.title}>{card.title}</p>
        <button
          type="button"
          className={styles.dragHandle}
          aria-label="ドラッグして並べ替え"
          {...attributes}
          {...listeners}
        >
          ⠿
        </button>
      </div>
      {(card.dueDate || card.priority) && (
        <div className={styles.meta}>
          {card.dueDate && <span className={styles.dueDate}>{card.dueDate}</span>}
          {card.priority && (
            <span className={`${styles.priority} ${PRIORITY_CLASS[card.priority]}`}>
              {PRIORITY_LABEL[card.priority]}
            </span>
          )}
        </div>
      )}
      <div className={styles.editButtons}>
        <button className={styles.editButton} onClick={openPriorityModal}>
          優先度を変更
        </button>
        <button className={styles.editButton} onClick={openDueDateModal}>
          期限を変更
        </button>
      </div>

      {editingField === 'priority' && (
        <Modal title="優先度を変更" onClose={closeModal}>
          <form className={styles.editForm} onSubmit={handleSubmit}>
            <select
              className={styles.select}
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
              autoFocus
            >
              <option value="">優先度なし</option>
              <option value="HIGH">高</option>
              <option value="MEDIUM">中</option>
              <option value="LOW">低</option>
            </select>
            {error && <p className={styles.error}>{error}</p>}
            <div className={styles.actions}>
              <button type="submit" className={styles.submitButton} disabled={submitting}>
                保存
              </button>
              <button type="button" className={styles.cancelButton} onClick={closeModal}>
                キャンセル
              </button>
            </div>
          </form>
        </Modal>
      )}

      {editingField === 'dueDate' && (
        <Modal title="期限を変更" onClose={closeModal}>
          <form className={styles.editForm} onSubmit={handleSubmit}>
            <input
              className={styles.select}
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              autoFocus
            />
            {error && <p className={styles.error}>{error}</p>}
            <div className={styles.actions}>
              <button type="submit" className={styles.submitButton} disabled={submitting}>
                保存
              </button>
              <button type="button" className={styles.cancelButton} onClick={closeModal}>
                キャンセル
              </button>
              {dueDate && (
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setDueDate('')}
                >
                  クリア
                </button>
              )}
            </div>
          </form>
        </Modal>
      )}
    </li>
  )
}

export default TaskCard
