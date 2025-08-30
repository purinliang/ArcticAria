import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

/**
 * A generic and reusable confirmation dialog component.
 * @param {object} props
 * @param {boolean} props.open - Controls the visibility of the dialog.
 * @param {function} props.onClose - Function to call when the dialog is closed.
 * @param {function} props.onConfirm - Function to call when the user confirms the action.
 * @param {string} props.title - The title text for the dialog.
 * @param {string} props.contentText - The main content text for the dialog.
 * @param {string} [props.cancelText='Cancel'] - The text for the cancel button.
 * @param {string} [props.confirmText='Confirm'] - The text for the confirm button.
 */
export default function ConfirmationDialog({
  open,
  onClose,
  onConfirm,
  title,
  contentText,
  cancelText = "Cancel",
  confirmText = "Confirm",
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="confirmation-dialog-title"
      aria-describedby="confirmation-dialog-description"
    >
      <DialogTitle id="confirmation-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="confirmation-dialog-description">
          {contentText}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          {cancelText}
        </Button>
        <Button onClick={onConfirm} color="error" autoFocus>
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
