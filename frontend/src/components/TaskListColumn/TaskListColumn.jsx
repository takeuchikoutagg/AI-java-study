import TaskCard from '../TaskCard/TaskCard.jsx'
import styles from './TaskListColumn.module.css'

function TaskListColumn({ list }) {
  return (
    <section className={styles.column}>
      <h2 className={styles.title}>{list.name}</h2>
      <ul className={styles.cards}>
        {list.cards.map((card) => (
          <TaskCard key={card.id} card={card} />
        ))}
      </ul>
    </section>
  )
}

export default TaskListColumn
