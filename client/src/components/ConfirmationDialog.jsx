import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useTranslation } from "react-i18next";
/**
 * A generic and reusable confirmation dialog component.
 * @param {object} props
 * @param {boolean} props.open - Controls the visibility of the dialog.
 * @param {function} props.onClose - Function to call when the dialog is closed.
 * @param {function} props.onConfirm - Function to call when the user confirms the action.
 * @param {string} props.title - The title text for the dialog.
 * @param {string} props.contentText - The main content text for the dialog.
 * @param {object} [props.contentOptions] - Options for i18next interpolation in contentText.
 * @param {string} [props.cancelText='Cancel'] - The text for the cancel button.
 * @param {string} [props.confirmText='Confirm'] - The text for the confirm button.
 */
export default function ConfirmationDialog({
  open,
  onClose,
  onConfirm,
  title,
  contentText,
  contentOptions,
  cancelText = "dialog.cancel", //  use translation keys
  confirmText = "dialog.confirm", //  use translation keys
}) {
  const { t } = useTranslation();
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="confirmation-dialog-title"
      aria-describedby="confirmation-dialog-description"
    >
      <DialogTitle id="confirmation-dialog-title">{t(title)}</DialogTitle>
      <DialogContent>
        <DialogContentText id="confirmation-dialog-description">
          {t(contentText, contentOptions)}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          {t(cancelText)}
        </Button>
        <Button onClick={onConfirm} color="error" autoFocus>
          {t(confirmText)}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
