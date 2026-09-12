import { useEffect, useId, useRef } from 'react'
import styles from './Modal.module.css'

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

function Modal({ title, onClose, children, variant = 'dialog' }) {
  const titleId = useId()
  const dialogRef = useRef(null)

  // マウント時にダイアログ内の最初のフォーカス可能要素へフォーカスを移し、
  // アンマウント時（クローズ時）に元のフォーカス位置へ戻す。
  useEffect(() => {
    const previouslyFocused = document.activeElement
    const focusable = dialogRef.current?.querySelectorAll(FOCUSABLE_SELECTOR)
    if (focusable && focusable.length > 0) {
      focusable[0].focus()
    } else {
      dialogRef.current?.focus()
    }

    return () => {
      previouslyFocused?.focus?.()
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key !== 'Tab') {
        return
      }

      const focusable = dialogRef.current?.querySelectorAll(FOCUSABLE_SELECTOR)
      if (!focusable || focusable.length === 0) {
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    // オーバーレイのクリックによる閉じる操作は、Escapeキーでも同等に行えるため
    // oxlint-disable-next-line jsx_a11y/click-events-have-key-events, jsx_a11y/no-static-element-interactions
    <div className={styles.overlay} onClick={onClose}>
      {/* ダイアログ内クリックのオーバーレイへの伝播を止めるだけで、role属性は付与済みのため */}
      {/* oxlint-disable-next-line jsx_a11y/click-events-have-key-events, jsx_a11y/no-static-element-interactions */}
      <div
        ref={dialogRef}
        className={styles.dialog}
        role={variant === 'alert' ? 'alertdialog' : 'dialog'}
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.header}>
          <h3 id={titleId} className={styles.title}>
            {title}
          </h3>
          <button className={styles.closeButton} onClick={onClose} aria-label="閉じる">
            ×
          </button>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  )
}

export default Modal
