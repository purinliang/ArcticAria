import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress
} from "@mui/material";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { useTranslation } from "react-i18next";

const API_BASE = import.meta.env.VITE_BLOG_API_BASE;

export default function PostEditPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isLoggedIn } = useAuth();
  const { t } = useTranslation();

  const [post, setPost] = useState({ title: "", content: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const isEditMode = !!id;
  const token = localStorage.getItem("jwtToken");

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    if (isEditMode) {
      const fetchPost = async () => {
        setLoading(true);
        try {
          const res = await axios.get(`${API_BASE}/posts/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setPost(res.data);
          setError(null);
        } catch (err) {
          setError(t("page.postEdit.errors.fetchPost"));
        } finally {
          setLoading(false);
        }
      };
      fetchPost();
    }
  }, [id, isLoggedIn, navigate, token, isEditMode, t]);

  useEffect(() => {
    if (!isEditMode) setPost({ title: "", content: "" });
  }, [isEditMode]);

  const handleChange = (e) => {
    setPost({ ...post, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isEditMode) {
        await axios.put(`${API_BASE}/posts/${id}`, post, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessage(t("page.postEdit.messages.updated"));
        setTimeout(() => navigate(`/blog/${id}`), 1000);
      } else {
        await axios.post(`${API_BASE}/posts`, post, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessage(t("page.postEdit.messages.created"));
        setTimeout(() => navigate("/blog"), 2000);
      }
    } catch (err) {
      setError(
        t("page.postEdit.errors.submit", {
          action: isEditMode
            ? t("page.postEdit.actions.update")
            : t("page.postEdit.actions.create"),
          message: err.response?.data?.message || err.message
        })
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <Container
        maxWidth="md"
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh"
        }}
      >
        <CircularProgress />
      </Container>
    );
  }

  if (!isLoggedIn && !loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning">{t("page.postEdit.auth.required")}</Alert>
        <Button
          sx={{ mt: 2 }}
          variant="contained"
          onClick={() => navigate("/login")}
        >
          {t("page.postEdit.buttons.goLogin")}
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: "bold", color: "primary.main" }}
        >
          {isEditMode
            ? t("page.postEdit.titles.edit")
            : t("page.postEdit.titles.create")}
        </Typography>
      </Box>

      <Paper sx={{ p: 4, mb: 4, boxShadow: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {message && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            label={t("page.postEdit.fields.title")}
            name="title"
            fullWidth
            value={post.title}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            label={t("page.postEdit.fields.content")}
            name="content"
            fullWidth
            multiline
            rows={10}
            value={post.content}
            onChange={handleChange}
            margin="normal"
            required
          />
          <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{ textTransform: "none" }}
            >
              {loading ? (
                <CircularProgress size={24} />
              ) : isEditMode ? (
                t("page.postEdit.buttons.update")
              ) : (
                t("page.postEdit.buttons.publish")
              )}
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate("/blog")}
              disabled={loading}
              sx={{ textTransform: "none" }}
            >
              {t("page.postEdit.buttons.cancel")}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
}
