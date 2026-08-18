import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import styles from './App.module.css'

function SortableItem({ id }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }
  return (
    <li ref={setNodeRef} style={style} {...attributes} {...listeners} className={styles.item}>
      {id}
    </li>
  )
}

function App() {
  const [items, setItems] = useState(['カード1', 'カード2', 'カード3'])
  const sensors = useSensors(useSensor(PointerSensor))

  function handleDragEnd(event) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setItems((prev) => {
        const oldIndex = prev.indexOf(active.id)
        const newIndex = prev.indexOf(over.id)
        return arrayMove(prev, oldIndex, newIndex)
      })
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>タスク管理アプリ（React版・準備中）</h1>
      <p className={styles.hint}>
        dnd-kitの動作確認用サンプルです。下のカードをドラッグして並べ替えられます。
      </p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <ul className={styles.list}>
            {items.map((id) => (
              <SortableItem key={id} id={id} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  )
}

export default App
