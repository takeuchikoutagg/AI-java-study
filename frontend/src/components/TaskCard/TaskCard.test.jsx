import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import TaskCard from './TaskCard.jsx'

function buildCard(overrides = {}) {
  return {
    id: 1,
    title: 'タスクA',
    dueDate: null,
    priority: null,
    ...overrides,
  }
}

describe('TaskCard', () => {
  it('タイトル・期限・優先度を表示する', () => {
    const card = buildCard({ dueDate: '2026-09-01', priority: 'HIGH' })
    render(<TaskCard card={card} listId={1} onUpdateCard={vi.fn()} onDeleteCard={vi.fn()} />)

    expect(screen.getByText('タスクA')).toBeInTheDocument()
    expect(screen.getByText('2026-09-01')).toBeInTheDocument()
    expect(screen.getByText('高')).toBeInTheDocument()
  })

  it('優先度を変更して保存するとonUpdateCardが呼ばれる', async () => {
    const user = userEvent.setup()
    const onUpdateCard = vi.fn().mockResolvedValue(undefined)
    const card = buildCard({ priority: 'LOW' })
    render(<TaskCard card={card} listId={1} onUpdateCard={onUpdateCard} onDeleteCard={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: '優先度を変更' }))
    await user.selectOptions(screen.getByRole('combobox'), 'HIGH')
    await user.click(screen.getByRole('button', { name: '保存' }))

    expect(onUpdateCard).toHaveBeenCalledWith(1, {
      title: 'タスクA',
      dueDate: null,
      priority: 'HIGH',
    })
  })

  it('削除確認モーダルで「削除する」を押すとonDeleteCardが呼ばれる', async () => {
    const user = userEvent.setup()
    const onDeleteCard = vi.fn().mockResolvedValue(undefined)
    const card = buildCard()
    render(<TaskCard card={card} listId={1} onUpdateCard={vi.fn()} onDeleteCard={onDeleteCard} />)

    await user.click(screen.getByRole('button', { name: '削除' }))
    await user.click(screen.getByRole('button', { name: '削除する' }))

    expect(onDeleteCard).toHaveBeenCalledWith(1)
  })

  it('優先度変更モーダルを開いたままcard propの優先度が変わると表示が追従する（stale-prop-syncバグの回帰テスト）', async () => {
    const user = userEvent.setup()
    const card = buildCard({ priority: 'HIGH' })
    const { rerender } = render(
      <TaskCard card={card} listId={1} onUpdateCard={vi.fn()} onDeleteCard={vi.fn()} />,
    )

    await user.click(screen.getByRole('button', { name: '優先度を変更' }))
    expect(screen.getByRole('combobox')).toHaveValue('HIGH')

    // モーダルを開いたまま、裏でboardが再取得されてcard propが更新されたことを模す
    const updatedCard = buildCard({ priority: 'LOW' })
    rerender(<TaskCard card={updatedCard} listId={1} onUpdateCard={vi.fn()} onDeleteCard={vi.fn()} />)

    expect(screen.getByRole('combobox')).toHaveValue('LOW')
  })

  it('期限変更モーダルを開いたままcard propの期限が変わると表示が追従する', async () => {
    const user = userEvent.setup()
    const card = buildCard({ dueDate: '2026-09-01' })
    const { rerender } = render(
      <TaskCard card={card} listId={1} onUpdateCard={vi.fn()} onDeleteCard={vi.fn()} />,
    )

    await user.click(screen.getByRole('button', { name: '期限を変更' }))
    const dateInput = screen.getByDisplayValue('2026-09-01')
    expect(dateInput).toBeInTheDocument()

    const updatedCard = buildCard({ dueDate: '2026-09-10' })
    rerender(<TaskCard card={updatedCard} listId={1} onUpdateCard={vi.fn()} onDeleteCard={vi.fn()} />)

    expect(screen.getByDisplayValue('2026-09-10')).toBeInTheDocument()
  })
})
