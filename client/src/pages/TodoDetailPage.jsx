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
  DialogTitle
} from "@mui/material";
import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import axios from "axios";
import { red } from "@mui/material/colors";
import { useTranslation } from "react-i18next";

const API_BASE = import.meta.env.VITE_TODO_API_BASE;

const CATEGORIES = ["Work", "Study", "Life", "Play", "Other"];

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
    nextDueDate: dayjs().format("YYYY-MM-DD"),
    recurrenceRule: "one-time",
    reminderDaysBefore: 0,
    category: "Other",
    completed: false
  });
  const [error, setError] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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
      setForm(res.data);
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

  const toggleCompleted = async () => {
    setError("");
    try {
      await axios.put(
        `${API_BASE}/todo/${id}`,
        { completed: !form.completed },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setForm((prev) => ({ ...prev, completed: !prev.completed }));
    } catch (err) {
      console.error("Failed to update status:", err);
      if (err.response && err.response.status === 401) {
        localStorage.removeItem("jwtToken");
        setError(t("errors.sessionExpired"));
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setError(t("errors.updateStatus"));
      }
    }
  };

  const handleOpenDeleteDialog = () => setIsDeleteDialogOpen(true);
  const handleCloseDeleteDialog = () => setIsDeleteDialogOpen(false);

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

  useEffect(() => {
    if (isEdit) {
      if (state?.todo) {
        setForm(state.todo);
      } else {
        fetchTodo();
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

      <Grid container spacing={3} mt={1} direction="column">
        <Grid item xs={12}>
          <TextField
            label={t("todoDetail.fields.title")}
            name="title"
            fullWidth
            value={form.title}
            onChange={handleChange}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label={t("todoDetail.fields.dueDate")}
            name="nextDueDate"
            type="date"
            fullWidth
            value={form.nextDueDate}
            onChange={handleChange}
            variant="outlined"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label={t("todoDetail.fields.content")}
            name="content"
            fullWidth
            multiline
            rows={8}
            value={form.content}
            onChange={handleChange}
            variant="outlined"
            helperText={t("todoDetail.fields.contentHelper")}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label={t("todoDetail.fields.recurrence")}
            name="recurrenceRule"
            select
            fullWidth
            value={form.recurrenceRule}
            onChange={handleChange}
            variant="outlined"
          >
            <MenuItem value="one-time">
              {t("todoDetail.recurrence.oneTime")}
            </MenuItem>
            <MenuItem value="7d">{t("todoDetail.recurrence.every7d")}</MenuItem>
            <MenuItem value="14d">
              {t("todoDetail.recurrence.every14d")}
            </MenuItem>
            <MenuItem value="monthly">
              {t("todoDetail.recurrence.monthly")}
            </MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12}>
          <TextField
            label={t("todoDetail.fields.category")}
            name="category"
            select
            fullWidth
            value={form.category}
            onChange={handleChange}
            variant="outlined"
          >
            {CATEGORIES.map((category) => (
              <MenuItem key={category} value={category}>
                {t(`categories.${category}`)}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12}>
          <TextField
            label={t("todoDetail.fields.reminderDays")}
            name="reminderDaysBefore"
            type="number"
            fullWidth
            value={form.reminderDaysBefore}
            onChange={handleChange}
            variant="outlined"
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
              label={t("todoDetail.fields.markCompleted")}
            />
          </Grid>
        )}
        <Grid item xs={12} sm={isEdit ? 6 : 12}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleSave}
          >
            {isEdit
              ? t("todoDetail.buttons.save")
              : t("todoDetail.buttons.create")}
          </Button>
        </Grid>
        {isEdit && (
          <Grid item xs={12} sm={6}>
            <Button
              variant="outlined"
              color="error"
              fullWidth
              onClick={handleOpenDeleteDialog}
            >
              {t("todoDetail.buttons.delete")}
            </Button>
          </Grid>
        )}
      </Grid>

      <Dialog open={isDeleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>{t("todoDetail.dialog.title")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("todoDetail.dialog.content")}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
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
