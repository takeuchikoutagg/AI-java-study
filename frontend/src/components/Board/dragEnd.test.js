import { describe, expect, it } from 'vitest'
import { computeDragMove } from './dragEnd.js'

function buildBoard() {
  return {
    id: 1,
    name: 'マイボード',
    lists: [
      {
        id: 1,
        name: '未着手',
        cards: [
          { id: 10, title: 'A' },
          { id: 11, title: 'B' },
          { id: 12, title: 'C' },
        ],
      },
      {
        id: 2,
        name: '作業中',
        cards: [{ id: 20, title: 'X' }],
      },
    ],
  }
}

function dragEvent({ activeListId, cardId, overListId, overCardId }) {
  return {
    active: { data: { current: { listId: activeListId, cardId } } },
    over: overListId == null
      ? null
      : { data: { current: { listId: overListId, cardId: overCardId ?? null } } },
  }
}

describe('computeDragMove', () => {
  it('同一リスト内で並べ替える場合、移動先の位置を返す', () => {
    const board = buildBoard()
    const event = dragEvent({ activeListId: 1, cardId: 12, overListId: 1, overCardId: 10 })

    const result = computeDragMove(event, board)

    expect(result).toEqual({ cardId: 12, listId: 1, position: 0 })
  })

  it('別リストのカードの上にドロップした場合、そのカードの位置に移動する', () => {
    const board = buildBoard()
    const event = dragEvent({ activeListId: 1, cardId: 11, overListId: 2, overCardId: 20 })

    const result = computeDragMove(event, board)

    expect(result).toEqual({ cardId: 11, listId: 2, position: 0 })
  })

  it('リストの空白部分（カードなし）にドロップした場合、末尾に追加する', () => {
    const board = buildBoard()
    const event = dragEvent({ activeListId: 1, cardId: 10, overListId: 2, overCardId: null })

    const result = computeDragMove(event, board)

    expect(result).toEqual({ cardId: 10, listId: 2, position: 1 })
  })

  it('同一リスト内で位置が変わらない場合はnullを返す（no-op）', () => {
    const board = buildBoard()
    // カード10（position 0）を、直後のカード11の位置にドロップ＝実質移動なし
    const event = dragEvent({ activeListId: 1, cardId: 10, overListId: 1, overCardId: 11 })

    const result = computeDragMove(event, board)

    expect(result).toBeNull()
  })

  it('overがない場合はnullを返す', () => {
    const board = buildBoard()
    const event = { active: { data: { current: { listId: 1, cardId: 10 } } }, over: null }

    expect(computeDragMove(event, board)).toBeNull()
  })

  it('boardが未取得の場合はnullを返す', () => {
    const event = dragEvent({ activeListId: 1, cardId: 10, overListId: 1, overCardId: 11 })

    expect(computeDragMove(event, null)).toBeNull()
  })
})
