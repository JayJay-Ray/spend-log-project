import { useEffect, useId, useRef } from 'react'
import { X } from 'lucide-react'

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'default',
  closeDisabled = false,
}) {
  const dialogRef = useRef(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const dialog = dialogRef.current

    if (!dialog) {
      return
    }

    if (open && !dialog.open) {
      dialog.showModal()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  function handleCancel(event) {
    event.preventDefault()

    if (!closeDisabled) {
      onClose()
    }
  }

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget && !closeDisabled) {
      onClose()
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className={`modal modal--${size}`}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={handleCancel}
      onClick={handleBackdropClick}
    >
      <div className="modal__surface">
        <div className="modal__header">
          <div>
            <h2 className="modal__title" id={titleId}>
              {title}
            </h2>
            {description && (
              <p className="modal__description" id={descriptionId}>
                {description}
              </p>
            )}
          </div>

          <button
            className="icon-button icon-button--subtle"
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            disabled={closeDisabled}
          >
            <X size={18} />
          </button>
        </div>

        {children && <div className="modal__body">{children}</div>}

        {footer && <div className="modal__footer">{footer}</div>}
      </div>
    </dialog>
  )
}
