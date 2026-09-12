import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import Modal from './Modal.jsx'

describe('Modal', () => {
  it('タイトルと中身を表示する', () => {
    render(
      <Modal title="テストモーダル" onClose={() => {}}>
        <p>中身</p>
      </Modal>,
    )

    expect(screen.getByText('テストモーダル')).toBeInTheDocument()
    expect(screen.getByText('中身')).toBeInTheDocument()
  })

  it('デフォルトではrole="dialog"を持つ', () => {
    render(
      <Modal title="テストモーダル" onClose={() => {}}>
        <p>中身</p>
      </Modal>,
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('variant="alert"の場合はrole="alertdialog"を持つ', () => {
    render(
      <Modal title="削除確認" variant="alert" onClose={() => {}}>
        <p>本当に削除しますか？</p>
      </Modal>,
    )

    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
  })

  it('Escapeキーでoncloseが呼ばれる', () => {
    const onClose = vi.fn()
    render(
      <Modal title="テストモーダル" onClose={onClose}>
        <p>中身</p>
      </Modal>,
    )

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('オーバーレイ（背景）のクリックでoncloseが呼ばれる', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <Modal title="テストモーダル" onClose={onClose}>
        <p>中身</p>
      </Modal>,
    )

    await user.click(screen.getByRole('dialog').parentElement)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('ダイアログ内部のクリックではoncloseが呼ばれない', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <Modal title="テストモーダル" onClose={onClose}>
        <p>中身をクリック</p>
      </Modal>,
    )

    await user.click(screen.getByText('中身をクリック'))

    expect(onClose).not.toHaveBeenCalled()
  })

  it('閉じるボタンのクリックでoncloseが呼ばれる', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <Modal title="テストモーダル" onClose={onClose}>
        <p>中身</p>
      </Modal>,
    )

    await user.click(screen.getByLabelText('閉じる'))

    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
