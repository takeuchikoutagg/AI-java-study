import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as boardApi from '../../api/board.js'
import Board from './Board.jsx'

vi.mock('../../api/board.js')

function buildBoardData() {
  return {
    id: 1,
    name: 'マイボード',
    lists: [
      {
        id: 1,
        name: '未着手',
        cards: [{ id: 10, title: 'タスクA', dueDate: null, priority: 'HIGH' }],
      },
      {
        id: 2,
        name: '作業中',
        cards: [],
      },
    ],
  }
}

describe('Board', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('ロード中はローディング表示、取得後はボード名・リスト・カードを表示する', async () => {
    boardApi.fetchBoard.mockResolvedValue(buildBoardData())

    render(<Board />)

    expect(screen.getByText('読み込み中...')).toBeInTheDocument()

    expect(await screen.findByText('マイボード')).toBeInTheDocument()
    expect(screen.getByText('未着手')).toBeInTheDocument()
    expect(screen.getByText('タスクA')).toBeInTheDocument()
  })

  it('取得に失敗した場合はエラーメッセージを表示する', async () => {
    boardApi.fetchBoard.mockRejectedValue(new Error('ボードの取得に失敗しました (status: 500)'))

    render(<Board />)

    expect(await screen.findByText(/読み込みに失敗しました/)).toBeInTheDocument()
  })

  it('タスクを追加するとcreateCardを呼び出し、ボードを再取得する', async () => {
    const user = userEvent.setup()
    boardApi.fetchBoard.mockResolvedValue(buildBoardData())
    boardApi.createCard.mockResolvedValue({
      id: 11,
      title: '新規タスク',
      dueDate: null,
      priority: null,
      sortOrder: 1,
    })

    render(<Board />)
    await screen.findByText('マイボード')

    const firstColumn = screen.getByText('未着手').closest('section')
    await user.click(within(firstColumn).getByRole('button', { name: '+ タスクを追加' }))
    await user.type(screen.getByPlaceholderText('タスクのタイトル'), '新規タスク')
    await user.click(screen.getByRole('button', { name: '追加' }))

    await waitFor(() => {
      expect(boardApi.createCard).toHaveBeenCalledWith(1, {
        title: '新規タスク',
        dueDate: null,
        priority: null,
      })
    })
    expect(boardApi.fetchBoard).toHaveBeenCalledTimes(2)
  })

  it('タスクを削除するとdeleteCardを呼び出す', async () => {
    const user = userEvent.setup()
    boardApi.fetchBoard.mockResolvedValue(buildBoardData())
    boardApi.deleteCard.mockResolvedValue(undefined)

    render(<Board />)
    await screen.findByText('タスクA')

    await user.click(screen.getByRole('button', { name: '削除' }))
    await user.click(screen.getByRole('button', { name: '削除する' }))

    await waitFor(() => {
      expect(boardApi.deleteCard).toHaveBeenCalledWith(10)
    })
  })

  it('優先度順並べ替えが失敗した場合、リスト内にエラーメッセージを表示する', async () => {
    const user = userEvent.setup()
    boardApi.fetchBoard.mockResolvedValue(buildBoardData())
    boardApi.sortListByPriority.mockRejectedValue(
      new Error('優先度順の並べ替えに失敗しました (status: 500)'),
    )

    render(<Board />)
    await screen.findByText('タスクA')

    await user.click(screen.getAllByRole('button', { name: '優先度順に並べ替え' })[0])

    expect(await screen.findByText(/優先度順の並べ替えに失敗しました/)).toBeInTheDocument()
  })
})
