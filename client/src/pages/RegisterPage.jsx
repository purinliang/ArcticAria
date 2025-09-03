import { useState } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Container,
  Alert,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { red } from "@mui/material/colors";
import { useTranslation } from "react-i18next";

const API_BASE = import.meta.env.VITE_AUTH_API_BASE;

export default function RegisterPage() {
  const [form, setForm] = useState({ username: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleChange = (e) => {
    setError("");
    setSuccess("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    setError("");
    setSuccess("");

    if (form.password !== form.confirm) {
      setError(t("errors.passwordMismatch"));
      return;
    }

    try {
      await axios.post(`${API_BASE}/register`, {
        username: form.username,
        password: form.password,
      });
      setSuccess(t("page.register.success"));
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(
        t("errors.registerFailed", {
          message: err.response?.data || err.message,
        }),
      );
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        mt={6}
        mb={2}
        p={4}
        sx={{
          backgroundColor: "white",
          borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          component="div"
          sx={{ fontWeight: "bold", color: "primary.main" }}
        >
          {t("page.register.title")}
        </Typography>

        <Typography
          variant="subtitle1"
          gutterBottom
          sx={{ color: "text.secondary" }}
        >
          {t("page.register.subtitle")}
        </Typography>

        <TextField
          fullWidth
          margin="normal"
          label={t("page.register.fields.username")}
          name="username"
          type="text"
          value={form.username}
          onChange={handleChange}
          required
          autoComplete="username"
        />

        <TextField
          fullWidth
          margin="normal"
          label={t("page.register.fields.password")}
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
          autoComplete="new-password"
        />

        <TextField
          fullWidth
          margin="normal"
          label={t("page.register.fields.confirm")}
          type="password"
          name="confirm"
          value={form.confirm}
          onChange={handleChange}
          required
          autoComplete="new-password"
        />

        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleRegister}
          sx={{ mt: 3, py: 1.5, borderRadius: "8px" }}
          aria-label={t("page.register.buttons.signUp")}
        >
          {t("page.register.buttons.signUp")}
        </Button>

        {/* Success and error messages */}
        {success && (
          <Alert
            severity="success"
            sx={{ width: "100%", mt: 2, borderRadius: "8px" }}
          >
            {success}
          </Alert>
        )}

        {error && (
          <Alert
            severity="error"
            sx={{
              width: "100%",
              mt: 2,
              borderRadius: "8px",
            }}
          >
            {error}
          </Alert>
        )}

        <Box textAlign="center" sx={{ mt: 2, width: "100%" }}>
          <Typography variant="body2" color="textSecondary">
            {t("page.register.cta.haveAccount")}{" "}
            <Button onClick={() => navigate("/login")}>
              {t("page.register.buttons.signIn")}
            </Button>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}
