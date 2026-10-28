import Modal from "./Modal";
import Button from "./Button";

export default function ConfirmDialog({
  open,
  title = "Confirm",
  message,
  cancelLabel = "Cancel",
  confirmLabel = "Delete",
  loading = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal
      open={open}
      onClose={loading ? undefined : onCancel}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="light" onClick={onCancel} disabled={loading}>{cancelLabel}</Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
        </>
      }
    >
      <p>{message}</p>
    </Modal>
  );
}
