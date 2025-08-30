import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
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

const API_BASE = import.meta.env.VITE_TODO_API_BASE;

export default function TodoDetailPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const { state } = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("jwtToken");

  const [form, setForm] = useState({
    title: "",
    content: "",
    nextDueDate: dayjs().format("YYYY-MM-DD"),
    recurrenceRule: "one-time",
    reminderDaysBefore: 0,
    category: "",
    completed: false,
  });
  const [error, setError] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  /**
   * Handles changes to the form fields.
   * @param {Event} e The event object.
   */
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  /**
   * Fetches a single todo by its ID.
   */
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
      setForm(res.data);
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

  /**
   * Saves the todo (creates or updates).
   */
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

  /**
   * Toggles the completion status of a todo.
   */
  const toggleCompleted = async () => {
    setError("");
    try {
      await axios.put(
        `${API_BASE}/todo/${id}`,
        {
          completed: !form.completed,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setForm((prev) => ({ ...prev, completed: !prev.completed }));
    } catch (err) {
      console.error("Failed to update status:", err);
      if (err.response && err.response.status === 401) {
        localStorage.removeItem("jwtToken");
        setError("Session expired or unauthorized. Please log in again.");
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setError("Failed to update status");
      }
    }
  };

  /**
   * Opens the confirmation dialog for deletion.
   */
  const handleOpenDeleteDialog = () => {
    setIsDeleteDialogOpen(true);
  };

  /**
   * Closes the confirmation dialog.
   */
  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
  };

  /**
   * Executes the actual deletion after user confirmation.
   */
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

  useEffect(() => {
    if (isEdit) {
      if (state?.todo) {
        setForm(state.todo);
      } else {
        fetchTodo(); // fallback
      }
    }
  }, [id, state]);

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4, p: 2, borderRadius: "12px" }}>
      <Typography
        variant="h4"
        sx={{ fontWeight: "bold", color: "#1a237e", mb: 3 }}
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

      <Grid container spacing={3} mt={1} direction="column">
        <Grid item xs={12}>
          <TextField
            label="Title"
            name="title"
            fullWidth
            value={form.title}
            onChange={handleChange}
            variant="outlined"
            sx={{ borderRadius: "8px" }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Due Date"
            name="nextDueDate"
            type="date"
            fullWidth
            value={form.nextDueDate}
            onChange={handleChange}
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            sx={{ borderRadius: "8px" }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Content"
            name="content"
            fullWidth
            multiline
            rows={8}
            value={form.content}
            onChange={handleChange}
            variant="outlined"
            sx={{ borderRadius: "8px" }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Recurrence Rule"
            name="recurrenceRule"
            select
            fullWidth
            value={form.recurrenceRule}
            onChange={handleChange}
            variant="outlined"
            sx={{ borderRadius: "8px" }}
          >
            <MenuItem value="one-time">One-time</MenuItem>
            <MenuItem value="7d">Every 7 days</MenuItem>
            <MenuItem value="14d">Every 14 days</MenuItem>
            <MenuItem value="monthly">Monthly</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Remind Days Before"
            name="reminderDaysBefore"
            type="number"
            fullWidth
            value={form.reminderDaysBefore}
            onChange={handleChange}
            variant="outlined"
            sx={{ borderRadius: "8px" }}
          />
        </Grid>
        {isEdit && (
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={!!form.completed}
                  onChange={toggleCompleted}
                  color="primary"
                />
              }
              label="Mark as Completed"
            />
          </Grid>
        )}
        <Grid item xs={12} sm={isEdit ? 6 : 12}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{
              py: 1.5,
              borderRadius: "8px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            }}
            onClick={handleSave}
          >
            {isEdit ? "Save Changes" : "Create Todo"}
          </Button>
        </Grid>
        {isEdit && (
          <Grid item xs={12} sm={6}>
            <Button
              variant="outlined"
              color="error"
              fullWidth
              sx={{ py: 1.5, borderRadius: "8px" }}
              onClick={handleOpenDeleteDialog}
            >
              Delete
            </Button>
          </Grid>
        )}
      </Grid>

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
