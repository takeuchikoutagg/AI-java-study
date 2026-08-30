import { useState } from 'react'
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

function TaskCard({ card, onUpdateCard }) {
  const [isEditingPriority, setIsEditingPriority] = useState(false)
  const [priority, setPriority] = useState(card.priority ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const openPriorityModal = () => {
    setPriority(card.priority ?? '')
    setError(null)
    setIsEditingPriority(true)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await onUpdateCard(card.id, {
        title: card.title,
        dueDate: card.dueDate,
        priority: priority || null,
      })
      setIsEditingPriority(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <li className={styles.card}>
      <p className={styles.title}>{card.title}</p>
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
      <button className={styles.editButton} onClick={openPriorityModal}>
        優先度を変更
      </button>

      {isEditingPriority && (
        <Modal title="優先度を変更" onClose={() => setIsEditingPriority(false)}>
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
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => setIsEditingPriority(false)}
              >
                キャンセル
              </button>
            </div>
          </form>
        </Modal>
      )}
    </li>
  )
}

export default TaskCard
