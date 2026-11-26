import { LoaderCircle } from 'lucide-react'
import Modal from './ui/Modal.jsx'

export default function ConfirmDialog({
  open,
  title,
  description,
  children,
  confirmLabel = 'Confirm',
  pending = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      closeDisabled={pending}
      size="small"
      title={title}
      description={description}
      footer={
        <>
          <button
            className="btn btn--ghost"
            type="button"
            onClick={onCancel}
            disabled={pending}
          >
            Cancel
          </button>
          <button
            className="btn btn--danger"
            type="button"
            onClick={onConfirm}
            disabled={pending}
          >
            {pending && <LoaderCircle className="spin" size={16} />}
            {pending ? 'Deleting…' : confirmLabel}
          </button>
        </>
      }
    >
      {children}
    </Modal>
  )
}
