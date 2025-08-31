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

const API_BASE = import.meta.env.VITE_AUTH_API_BASE;

export default function LoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const { setIsLoggedIn, setUsername } = useAuth(); // Use the auth context

  /**
   * Handles form input changes.
   * @param {Event} e The event object.
   */
  const handleChange = (e) => {
    setError("");
    setSuccess("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /**
   * Handles the login process.
   */
  const handleLogin = async () => {
    setError("");
    setSuccess("");
    try {
      console.log(`POST ${API_BASE}/login`);
      const res = await axios.post(`${API_BASE}/login`, form);
      const { token } = res.data;
      localStorage.setItem("jwtToken", token);

      const decodedToken = jwtDecode(token);
      console.log("Decoded JWT Payload:", decodedToken); // Log the decoded payload for debugging

      // Check for the 'username' field in the decoded token
      if (decodedToken.username) {
        setUsername(decodedToken.username); // Update username in context
        setIsLoggedIn(true); // Update login status in context
      } else {
        console.error(
          "Username field not found in JWT token. Please check your backend.",
        );
      }
      setSuccess("Logged in successfully! Redirecting to homepage...");
      setTimeout(() => {
        navigate("/");
        window.location.reload();
      }, 1000);
    } catch (err) {
      console.log(`Login error: ${err}`);
      // Check if the error has a response and data to get a more specific message
      const errorMessage = err.response?.data || err.message;
      // Instead of an alert, set the error state to display the message
      setError(`Login failed: ${errorMessage}`);
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
          Sign in
        </Typography>
        <Typography
          variant="subtitle1"
          gutterBottom
          sx={{ color: "text.secondary" }}
        >
          Welcome back! Please log in to your account.
        </Typography>

        {/* Display success and error alerts */}
        {success && (
          <Alert
            severity="success"
            sx={{ width: "100%", mb: 2, borderRadius: "8px" }}
          >
            {success}
          </Alert>
        )}
        {error && (
          <Alert
            severity="error"
            sx={{
              width: "100%",
              mb: 2,
              borderRadius: "8px",
              backgroundColor: red[50],
            }}
          >
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          margin="normal"
          label="Username"
          name="username"
          type="text"
          value={form.username}
          onChange={handleChange}
          required
          // Add autocomplete for better browser support
          autoComplete="username"
        />
        <TextField
          fullWidth
          margin="normal"
          label="Password"
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
          // Use "current-password" for login forms
          autoComplete="current-password"
        />
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleLogin}
          sx={{ mt: 3, py: 1.5, borderRadius: "8px" }}
        >
          Login
        </Button>
        <Box textAlign="center" sx={{ mt: 2, width: "100%" }}>
          <Typography variant="body2" color="textSecondary">
            Don't have an account?{" "}
            <Button onClick={() => navigate("/register")}>Sign up</Button>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}
