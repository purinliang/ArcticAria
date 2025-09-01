import {
  Container,
  Typography,
  TextField,
  Button,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Box,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from "@mui/material";
import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import axios from "axios";
import { red } from "@mui/material/colors";
import { useTranslation } from "react-i18next";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import i18n from "../i18n";
const API_BASE = import.meta.env.VITE_TODO_API_BASE;
const CATEGORIES = ["work", "study", "life", "play", "other"];

export default function TodoDetailPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const { state } = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("jwtToken");
  const { t } = useTranslation();

  const [form, setForm] = useState({
    title: "",
    content: "",
    nextDueDate: dayjs(),
    recurrenceRule: "one-time",
    reminderDaysBefore: 0,
    category: "Other",
    completed: false
  });

  const [isRecurring, setIsRecurring] = useState(false);
  const [hasReminder, setHasReminder] = useState(false);

  const [error, setError] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [isFormEnabled, setIsFormEnabled] = useState(!isEdit);

  const getDueDateMessage = (dueDateStr) => {
    const due = dayjs(dueDateStr).startOf("day");
    const now = dayjs().startOf("day");
    const diffDays = due.diff(now, "day");
    const dayOfWeek = dayjs(dueDateStr).format("dddd");

    if (diffDays === 0) {
      return t("todo.dueToday", { weekday: dayOfWeek });
    } else if (diffDays > 0) {
      return t("todo.daysLeft", { count: diffDays, weekday: dayOfWeek });
    } else {
      return t("todo.overdue", { count: -diffDays, weekday: dayOfWeek });
    }
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleRecurringChange = (event) => {
    const isChecked = event.target.checked;
    setIsRecurring(isChecked);
    if (!isChecked) {
      setForm((prev) => ({ ...prev, recurrenceRule: "one-time" }));
    }
  };

  const handleReminderChange = (event) => {
    const isChecked = event.target.checked;
    setHasReminder(isChecked);
    if (!isChecked) {
      setForm((prev) => ({ ...prev, reminderDaysBefore: 0 }));
    }
  };

  const fetchTodo = async () => {
    setError("");
    if (!token) {
      setError(t("errors.notLoggedIn"));
      setTimeout(() => navigate("/login"), 3000);
      return;
    }
    try {
      const res = await axios.get(`${API_BASE}/todo/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const isRec = res.data.recurrenceRule !== "one-time";
      setIsRecurring(isRec);
      const hasRem = res.data.reminderDaysBefore > 0;
      setHasReminder(hasRem);

      setForm({ ...res.data, nextDueDate: dayjs(res.data.nextDueDate) });
    } catch (err) {
      console.error("Failed to load todo:", err);
      if (err.response && err.response.status === 401) {
        localStorage.removeItem("jwtToken");
        setError(t("errors.sessionExpired"));
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setError(
          t("errors.loadTodo", { message: err.response?.data || err.message })
        );
      }
    }
  };

  const handleSave = async () => {
    setError("");
    try {
      const payload = { ...form };
      if (isEdit) {
        await axios.put(`${API_BASE}/todo/${id}`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
      } else {
        await axios.post(`${API_BASE}/todo`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
      }
      navigate("/todos");
    } catch (err) {
      console.error("Save failed:", err);
      if (err.response && err.response.status === 401) {
        localStorage.removeItem("jwtToken");
        setError(t("errors.sessionExpired"));
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setError(
          t("errors.saveTodo", { message: err.response?.data || err.message })
        );
      }
    }
  };

  const handleOpenDeleteDialog = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
  };

  const handleConfirmDelete = async () => {
    setError("");
    try {
      await axios.delete(`${API_BASE}/todo/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate("/todos");
    } catch (err) {
      console.error("Failed to delete todo:", err);
      if (err.response && err.response.status === 401) {
        localStorage.removeItem("jwtToken");
        setError(t("errors.sessionExpired"));
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setError(t("errors.deleteTodo"));
      }
    } finally {
      handleCloseDeleteDialog();
    }
  };

  const handleEditClick = () => {
    setIsFormEnabled(true);
  };

  useEffect(() => {
    if (isEdit) {
      if (state?.todo) {
        const isRec = state.todo.recurrenceRule !== "one-time";
        setIsRecurring(isRec);
        const hasRem = state.todo.reminderDaysBefore > 0;
        setHasReminder(hasRem);
        setForm({ ...state.todo, nextDueDate: dayjs(state.todo.nextDueDate) });
      } else {
        fetchTodo(); // fallback
      }
    }
  }, [id, state]);

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4, p: 2, borderRadius: "12px" }}>
      <Typography
        variant="h4"
        sx={{ fontWeight: "bold", color: "primary.main", mb: 3 }}
      >
        {isEdit ? t("todoDetail.editTitle") : t("todoDetail.addTitle")}
      </Typography>

      {error && (
        <Alert
          severity="error"
          sx={{
            width: "100%",
            mt: 2,
            mb: 2,
            borderRadius: "8px",
            backgroundColor: red[50]
          }}
        >
          {error}
        </Alert>
      )}

      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        <TextField
          label={t("todoDetail.fields.title")}
          name="title"
          fullWidth
          value={form.title}
          onChange={handleChange}
          variant="outlined"
          disabled={isEdit && !isFormEnabled}
        />

        <TextField
          label={t("todoDetail.fields.content")}
          name="content"
          fullWidth
          multiline
          value={form.content}
          onChange={handleChange}
          variant="outlined"
          helperText={t("todoDetail.fields.contentHelper")}
          disabled={isEdit && !isFormEnabled}
          minRows={10}
          maxRows={30}
        />

        <TextField
          label={t("todoDetail.fields.category")}
          name="category"
          select
          fullWidth
          value={form.category}
          onChange={handleChange}
          variant="outlined"
          disabled={isEdit && !isFormEnabled}
        >
          {CATEGORIES.map((category) => (
            <MenuItem key={category} value={category}>
              {t(`categories.${category}`)}
            </MenuItem>
          ))}
        </TextField>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            gap: 2
          }}
        >
          <Box sx={{ flex: { xs: "auto", sm: 1 } }}>
            <LocalizationProvider
              dateAdapter={AdapterDayjs}
              adapterLocale={i18n.language === "zh" ? "zh-cn" : "en"}
            >
              <DatePicker
                label={t("todoDetail.fields.dueDate")}
                value={form.nextDueDate}
                onChange={(newValue) => {
                  setForm((prev) => ({ ...prev, nextDueDate: newValue }));
                }}
                slotProps={{ textField: { fullWidth: true } }}
                disabled={isEdit && !isFormEnabled}
              />
            </LocalizationProvider>
          </Box>
          <Box sx={{ flex: { xs: "auto", sm: 1 } }}>
            <Typography variant="body1" color="text.secondary">
              {getDueDateMessage(form.nextDueDate)}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            gap: 2
          }}
        >
          <Box sx={{ flex: { xs: "auto", sm: 1 } }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isRecurring}
                  onChange={handleRecurringChange}
                  color="primary"
                  disabled={isEdit && !isFormEnabled}
                />
              }
              label={t("todoDetail.repeat.toggle")}
            />
          </Box>
          {isRecurring && (
            <Box sx={{ flex: { xs: "auto", sm: 1 } }}>
              <TextField
                label={t("todoDetail.repeat.label")}
                name="recurrenceRule"
                select
                fullWidth
                value={form.recurrenceRule}
                onChange={handleChange}
                variant="outlined"
                size="small"
                disabled={isEdit && !isFormEnabled}
              >
                <MenuItem value="one-time">
                  {t("todoDetail.recurrence.oneTime")}
                </MenuItem>
                <MenuItem value="7d">
                  {t("todoDetail.recurrence.every7d")}
                </MenuItem>
                <MenuItem value="14d">
                  {t("todoDetail.recurrence.every14d")}
                </MenuItem>
                <MenuItem value="monthly">
                  {t("todoDetail.recurrence.monthly")}
                </MenuItem>
              </TextField>
            </Box>
          )}
          {!isRecurring && <Box sx={{ flex: { xs: "auto", sm: 1 } }}></Box>}
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            gap: 2
          }}
        >
          <Box sx={{ flex: { xs: "auto", sm: 1 } }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={hasReminder}
                  onChange={handleReminderChange}
                  color="primary"
                  disabled={isEdit && !isFormEnabled}
                />
              }
              label={t("todoDetail.reminder.toggle")}
            />
          </Box>
          {hasReminder && (
            <Box sx={{ flex: { xs: "auto", sm: 1 } }}>
              <TextField
                label={t("todoDetail.reminder.label", {
                  count: form.reminderDaysBefore || 0
                })}
                name="reminderDaysBefore"
                type="number"
                fullWidth
                value={form.reminderDaysBefore}
                onChange={handleChange}
                variant="outlined"
                size="small"
                disabled={isEdit && !isFormEnabled}
              />
            </Box>
          )}
          {!hasReminder && <Box sx={{ flex: { xs: "auto", sm: 1 } }}></Box>}
        </Box>

        {isEdit && (
          <FormControlLabel
            control={
              <Checkbox
                checked={!!form.completed}
                onChange={handleChange}
                color="primary"
                name="completed"
                disabled={isEdit && !isFormEnabled}
              />
            }
            label={t("todoDetail.fields.markCompleted")}
          />
        )}

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2
          }}
        >
          {isEdit && !isFormEnabled ? (
            <>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{
                  py: 1.5,
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                  flex: { xs: "auto", sm: 1 }
                }}
                onClick={handleEditClick}
              >
                Edit
              </Button>
              <Button
                variant="outlined"
                color="error"
                fullWidth
                sx={{
                  py: 1.5,
                  borderRadius: "8px",
                  flex: { xs: "auto", sm: 1 }
                }}
                onClick={handleOpenDeleteDialog}
              >
                {t("todoDetail.buttons.delete")}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{
                  py: 1.5,
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                  flex: { xs: "auto", sm: 1 }
                }}
                onClick={handleSave}
              >
                {isEdit
                  ? t("todoDetail.buttons.save")
                  : t("todoDetail.buttons.create")}
              </Button>
              {isEdit && (
                <Button
                  variant="outlined"
                  color="error"
                  fullWidth
                  sx={{
                    py: 1.5,
                    borderRadius: "8px",
                    flex: { xs: "auto", sm: 1 }
                  }}
                  onClick={handleOpenDeleteDialog}
                >
                  {t("todoDetail.buttons.delete")}
                </Button>
              )}
            </>
          )}
        </Box>
      </Box>

      <Dialog open={isDeleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>{t("todoDetail.dialog.title")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("todoDetail.dialog.content")}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary" autoFocus>
            {t("dialog.cancel")}
          </Button>
          <Button onClick={handleConfirmDelete} color="error">
            {t("dialog.confirm")}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
