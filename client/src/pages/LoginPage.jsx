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
import { useAuth } from "../AuthContext";
import { jwtDecode } from "jwt-decode";
import { useTranslation } from "react-i18next";

const API_BASE = import.meta.env.VITE_AUTH_API_BASE;

export default function LoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const { setIsLoggedIn, setUsername } = useAuth();
  const { t } = useTranslation();

  const handleChange = (e) => {
    setError("");
    setSuccess("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    setError("");
    setSuccess("");
    try {
      const res = await axios.post(`${API_BASE}/login`, form);
      const { token } = res.data;
      localStorage.setItem("jwtToken", token);

      const decodedToken = jwtDecode(token);

      if (decodedToken.username) {
        setUsername(decodedToken.username);
        setIsLoggedIn(true);
      }

      setSuccess(t("page.login.success"));
      setTimeout(() => {
        navigate("/");
        window.location.reload();
      }, 1000);
    } catch (err) {
      const errorMessage = err.response?.data || err.message;
      setError(t("errors.loginFailed", { message: errorMessage }));
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
          {t("page.login.title")}
        </Typography>

        <Typography
          variant="subtitle1"
          gutterBottom
          sx={{ color: "text.secondary" }}
        >
          {t("page.login.subtitle")}
        </Typography>

        <TextField
          fullWidth
          margin="normal"
          label={t("page.login.fields.username")}
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
          label={t("page.login.fields.password")}
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
          autoComplete="current-password"
        />

        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleLogin}
          sx={{ mt: 3, py: 1.5, borderRadius: "8px" }}
          aria-label={t("page.login.buttons.signIn")}
        >
          {t("page.login.buttons.signIn")}
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
            {t("page.login.cta.noAccount")}{" "}
            <Button onClick={() => navigate("/register")}>
              {t("page.login.buttons.signUp")}
            </Button>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}
