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
  DialogTitle,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import axios from "axios";
import { red } from "@mui/material/colors";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

const API_BASE = import.meta.env.VITE_TODO_API_BASE;
const CATEGORIES = ["Work", "Study", "Life", "Play", "Other"];

export default function TodoDetailPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const { state } = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("jwtToken");

  const [form, setForm] = useState({
    title: "",
    content: "",
    nextDueDate: dayjs(),
    recurrenceRule: "one-time",
    reminderDaysBefore: 0,
    category: "Other",
    completed: false,
  });

  const [isRecurring, setIsRecurring] = useState(false);
  const [hasReminder, setHasReminder] = useState(false);

  const [error, setError] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [isFormEnabled, setIsFormEnabled] = useState(!isEdit);

  const getDueDateMessage = (dueDateStr) => {
    const due = dayjs(dueDateStr).startOf('day');
    const now = dayjs().startOf('day');
    const diffDays = due.diff(now, "day");
    const dayOfWeek = dayjs(dueDateStr).format("dddd");

    if (diffDays === 0) {
      return `Due Today (${dayOfWeek})`;
    } else if (diffDays > 0) {
      return `${diffDays} day${diffDays === 1 ? "" : "s"} left (${dayOfWeek})`;
    } else {
      return `Overdue by ${-diffDays} day${-diffDays === 1 ? "" : "s"} (${dayOfWeek})`;
    }
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
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
      setError("You are not logged in. Redirecting to login page...");
      setTimeout(() => navigate("/login"), 3000);
      return;
    }
    try {
      const res = await axios.get(`${API_BASE}/todo/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
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
        setError("Session expired or unauthorized. Please log in again.");
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setError(`Failed to load todo: ${err.response?.data || err.message}`);
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
            "Content-Type": "application/json",
          },
        });
      } else {
        await axios.post(`${API_BASE}/todo`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      }
      navigate("/todos");
    } catch (err) {
      console.error("Save failed:", err);
      if (err.response && err.response.status === 401) {
        localStorage.removeItem("jwtToken");
        setError("Session expired or unauthorized. Please log in again.");
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setError(`Save failed: ${err.response?.data || err.message}`);
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
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/todos");
    } catch (err) {
      console.error("Failed to delete todo:", err);
      if (err.response && err.response.status === 401) {
        localStorage.removeItem("jwtToken");
        setError("Session expired or unauthorized. Please log in again.");
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setError("Failed to delete todo.");
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
        {isEdit ? "Edit Todo" : "Add New Todo"}
      </Typography>

      {error && (
        <Alert
          severity="error"
          sx={{
            width: "100%",
            mt: 2,
            mb: 2,
            borderRadius: "8px",
            backgroundColor: red[50],
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
        sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        <TextField
          label="Title"
          name="title"
          fullWidth
          value={form.title}
          onChange={handleChange}
          variant="outlined"
          disabled={isEdit && !isFormEnabled}
        />

        <TextField
          label="Content"
          name="content"
          fullWidth
          multiline
          value={form.content}
          onChange={handleChange}
          variant="outlined"
          helperText="Provide a detailed description of the task."
          disabled={isEdit && !isFormEnabled}
          minRows={10}
          maxRows={30}
        />

        <TextField
          label="Category"
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
              {category}
            </MenuItem>
          ))}
        </TextField>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Box sx={{ flex: { xs: 'auto', sm: 1 } }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Due Date"
                value={form.nextDueDate}
                onChange={(newValue) => {
                  setForm((prev) => ({ ...prev, nextDueDate: newValue }));
                }}
                slotProps={{ textField: { fullWidth: true } }}
                disabled={isEdit && !isFormEnabled}
              />
            </LocalizationProvider>
          </Box>
          <Box sx={{ flex: { xs: 'auto', sm: 1 } }}>
            <Typography variant="body1" color="text.secondary">
              {getDueDateMessage(form.nextDueDate)}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Box sx={{ flex: { xs: 'auto', sm: 1 } }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isRecurring}
                  onChange={handleRecurringChange}
                  color="primary"
                  disabled={isEdit && !isFormEnabled}
                />
              }
              label="Is this a recurring task?"
            />
          </Box>
          {isRecurring && (
            <Box sx={{ flex: { xs: 'auto', sm: 1 } }}>
              <TextField
                label="Recurrence Rule"
                name="recurrenceRule"
                select
                fullWidth
                value={form.recurrenceRule}
                onChange={handleChange}
                variant="outlined"
                size="small"
                disabled={isEdit && !isFormEnabled}
              />
            </Box>
          )}
          {!isRecurring && (
            <Box sx={{ flex: { xs: 'auto', sm: 1 } }}></Box>
          )}
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Box sx={{ flex: { xs: 'auto', sm: 1 } }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={hasReminder}
                  onChange={handleReminderChange}
                  color="primary"
                  disabled={isEdit && !isFormEnabled}
                />
              }
              label="Do you need a reminder?"
            />
          </Box>
          {hasReminder && (
            <Box sx={{ flex: { xs: 'auto', sm: 1 } }}>
              <TextField
                label="Remind Days Before"
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
          {!hasReminder && (
            <Box sx={{ flex: { xs: 'auto', sm: 1 } }}></Box>
          )}
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
            label="Mark as Completed"
          />
        )}

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
          }}
        >
          {isEdit && !isFormEnabled ? (
            <>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{ py: 1.5, borderRadius: "8px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", flex: { xs: 'auto', sm: 1 } }}
                onClick={handleEditClick}
              >
                Edit
              </Button>
              <Button
                variant="outlined"
                color="error"
                fullWidth
                sx={{ py: 1.5, borderRadius: "8px", flex: { xs: 'auto', sm: 1 } }}
                onClick={handleOpenDeleteDialog}
              >
                Delete
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{ py: 1.5, borderRadius: "8px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", flex: { xs: 'auto', sm: 1 } }}
                onClick={handleSave}
              >
                {isEdit ? "Save Changes" : "Create Todo"}
              </Button>
              {isEdit && (
                <Button
                  variant="outlined"
                  color="error"
                  fullWidth
                  sx={{ py: 1.5, borderRadius: "8px", flex: { xs: 'auto', sm: 1 } }}
                  onClick={handleOpenDeleteDialog}
                >
                  Delete
                </Button>
              )}
            </>
          )}
        </Box>
      </Box>

      <Dialog
        open={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Deletion"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            This action is permanent. Are you sure you want to delete this todo?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary" autoFocus>
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}