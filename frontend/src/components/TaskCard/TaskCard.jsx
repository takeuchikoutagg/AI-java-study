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

function TaskCard({ card }) {
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
    </li>
  )
}

export default TaskCard
