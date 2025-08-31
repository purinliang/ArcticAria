import { useEffect, useState, createContext, useContext } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  Tooltip,
  useTheme,
  useMediaQuery,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { jwtDecode } from "jwt-decode";
import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";

const API_BASE = import.meta.env.VITE_BLOG_API_BASE;

/**
 * Formats a date string into a relative, human-readable format.
 * @param {string} dateString The date string (e.g., from post.createdAt).
 * @returns {string} The relative formatted date string.
 */
const getRelativeTime = (dateString) => {
  // Ensure the date string is treated as UTC if it doesn't have a 'Z'
  const date = new Date(
    dateString.endsWith("Z") ? dateString : dateString + "Z",
  );
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return "just now";
  } else if (minutes < 60) {
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  } else if (hours < 24) {
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  } else if (days < 30) {
    return `${days} day${days > 1 ? "s" : ""} ago`;
  } else {
    // For older posts, show a simple date format.
    const olderDate = new Date(dateString + "Z");
    return olderDate.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
};

export default function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthor, setIsAuthor] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const token = localStorage.getItem("jwtToken");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE}/posts/${id}`);
        setPost(res.data);
        setError(null);

        if (token) {
          const decodedToken = jwtDecode(token);
          if (decodedToken.userId === res.data.userId) {
            setIsAuthor(true);
          } else {
            setIsAuthor(false);
          }
        } else {
          setIsAuthor(false);
        }
      } catch (err) {
        console.error("Failed to fetch post:", err);
        setError("Failed to load post. It may not exist.");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, token]);

  const handleDelete = async () => {
    setOpenDialog(false);
    try {
      await axios.delete(`${API_BASE}/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/blog");
    } catch (err) {
      console.error("Failed to delete post:", err);
      setError("Failed to delete post.");
    }
  };

  if (loading) {
    return (
      <Container
        maxWidth="md"
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          sx={{ mt: 2 }}
          variant="contained"
          onClick={() => navigate("/blog")}
        >
          Go Back to Blog List
        </Button>
      </Container>
    );
  }

  if (!post) {
    return null;
  }

  const createdAt = new Date(post.createdAt);
  const updatedAt = new Date(post.updatedAt);
  const fiveMinutesInMs = 5 * 60 * 1000;
  const isRecentUpdate =
    updatedAt.getTime() - createdAt.getTime() < fiveMinutesInMs;

  const displayTimestamp = isRecentUpdate
    ? getRelativeTime(post.createdAt)
    : getRelativeTime(post.updatedAt);

  const displayLabel = isRecentUpdate ? "Created" : "Updated";

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      {/* First line: Back arrow and author action buttons */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography
          variant="h4"
          sx={{ fontWeight: "bold", color: "primary.main" }}
        >
          {post.title}
        </Typography>

        {isLoggedIn && isAuthor && (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title="Edit Post">
              <IconButton
                onClick={() => navigate(`/blog/edit/${post.id}`)}
                color="primary"
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Post">
              <IconButton onClick={() => setOpenDialog(true)} color="error">
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>

      {/* Second line: Author and publication date */}
      <Box sx={{ mb: 2.5 }}>
        <Typography
          variant="caption"
          display="block"
          color="text.secondary"
          sx={{ mb: -0.5 }}
        >
          Author: {post.username}
        </Typography>
        <Typography variant="caption" display="block" color="text.secondary">
          {displayLabel}: {displayTimestamp}
        </Typography>
      </Box>

      {/* Markdown content box with image styling */}
      <Box
        sx={{
          pt: isMobile ? 0 : 0.75,
          pb: isMobile ? 0 : 0.75,
          pl: isMobile ? 1.5 : 2.5,
          pr: isMobile ? 1.5 : 2.5,
          border: "1px solid #e0e0e0",
          borderRadius: "8px",
          boxShadow: 1,
          backgroundColor: "white",
        }}
      >
        <Typography
          component="div"
          sx={{
            whiteSpace: "pre-wrap",
            lineHeight: "1.5rem",
            "& img": {
              maxWidth: "100%",
              height: "auto",
              display: "block",
              mx: "auto",
            },
          }}
        >
          <ReactMarkdown remarkPlugins={[gfm]}>{post.content}</ReactMarkdown>
        </Typography>
      </Box>

      {/* Confirmation Dialog for Deletion */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the post titled "{post.title}"? This
            action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
