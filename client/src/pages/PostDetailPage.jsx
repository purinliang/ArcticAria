import { useEffect, useState } from "react";
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
  TextField,
} from "@mui/material";
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
  const [openPostDeleteDialog, setOpenPostDeleteDialog] = useState(false);

  // States for Comments
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentError, setCommentError] = useState(null);
  const [newCommentContent, setNewCommentContent] = useState("");
  const [openCommentEditDialog, setOpenCommentEditDialog] = useState(false);
  const [commentToEdit, setCommentToEdit] = useState(null);
  const [openCommentDeleteDialog, setOpenCommentDeleteDialog] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  const token = localStorage.getItem("jwtToken");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  // Fetch Post
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

  // Fetch Comments
  useEffect(() => {
    const fetchComments = async () => {
      if (!id) return;
      setCommentsLoading(true);
      try {
        const res = await axios.get(`${API_BASE}/posts/${id}/comments`);
        setComments(res.data);
      } catch (err) {
        console.error("Failed to fetch comments:", err);
        setCommentError("Failed to load comments.");
      } finally {
        setCommentsLoading(false);
      }
    };
    fetchComments();
  }, [id, token]);

  const handleDeletePost = async () => {
    setOpenPostDeleteDialog(false);
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

  const handleAddComment = async () => {
    if (!newCommentContent.trim()) {
      alert("Comment cannot be empty.");
      return;
    }
    if (!isLoggedIn || !token) {
      alert("You must be logged in to comment.");
      return;
    }

    try {
      await axios.post(
        `${API_BASE}/comments`,
        {
          postId: id,
          content: newCommentContent,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setNewCommentContent("");
      // Re-fetch comments to show the new one
      const res = await axios.get(`${API_BASE}/posts/${id}/comments`);
      setComments(res.data);
    } catch (err) {
      console.error("Failed to add comment:", err);
      setCommentError("Failed to add comment. Please try again.");
    }
  };

  const handleEditComment = (comment) => {
    setCommentToEdit(comment);
    setOpenCommentEditDialog(true);
  };

  const handleSaveComment = async () => {
    if (!commentToEdit || !commentToEdit.content.trim()) {
      alert("Comment content cannot be empty.");
      return;
    }

    try {
      await axios.put(
        `${API_BASE}/comments/${commentToEdit.id}`,
        { content: commentToEdit.content },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setOpenCommentEditDialog(false);
      setCommentToEdit(null);
      // Re-fetch comments to update the list
      const res = await axios.get(`${API_BASE}/posts/${id}/comments`);
      setComments(res.data);
    } catch (err) {
      console.error("Failed to update comment:", err);
      setCommentError("Failed to update comment. Please try again.");
    }
  };

  const handleDeleteComment = (comment) => {
    setCommentToDelete(comment);
    setOpenCommentDeleteDialog(true);
  };

  const handleConfirmDeleteComment = async () => {
    if (!commentToDelete) return;
    try {
      await axios.delete(`${API_BASE}/comments/${commentToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOpenCommentDeleteDialog(false);
      setCommentToDelete(null);
      // Re-fetch comments to update the list
      const res = await axios.get(`${API_BASE}/posts/${id}/comments`);
      setComments(res.data);
    } catch (err) {
      console.error("Failed to delete comment:", err);
      setCommentError("Failed to delete comment. Please try again.");
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

  const myUserId = token ? jwtDecode(token).userId : null;

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      {/* Post Title & Author Actions */}
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
              <IconButton
                onClick={() => setOpenPostDeleteDialog(true)}
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>

      {/* Author and publication date */}
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

      {/* --- Comments Section --- */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
          Comments
        </Typography>
        {commentError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {commentError}
          </Alert>
        )}

        {commentsLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <Box sx={{ maxHeight: "400px", overflowY: "auto", pr: 2 }}>
            {comments.length > 0 ? (
              comments.map((comment) => (
                <Box
                  key={comment.id}
                  sx={{
                    mb: 2,
                    p: 2,
                    backgroundColor: "#fafafa",
                    borderRadius: "8px",
                    border: "1px solid #e0e0e0",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Typography variant="body1">{comment.content}</Typography>
                  <Box
                    sx={{
                      mt: 1,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {comment.username} • {getRelativeTime(comment.createdAt)}
                    </Typography>
                    {isLoggedIn && myUserId === comment.userId && (
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Tooltip title="Edit Comment">
                          <IconButton
                            size="small"
                            onClick={() => handleEditComment(comment)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Comment">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteComment(comment)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}
                  </Box>
                </Box>
              ))
            ) : (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontStyle: "italic" }}
              >
                No comments yet. Be the first to comment!
              </Typography>
            )}
          </Box>
        )}

        {/* Comment Form */}
        <Box sx={{ mt: 3, pt: 3, borderTop: "1px solid #e0e0e0" }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Add a Comment
          </Typography>
          {isLoggedIn ? (
            <Box>
              <TextField
                multiline
                fullWidth
                minRows={3}
                variant="outlined"
                placeholder="Write your comment here..."
                value={newCommentContent}
                onChange={(e) => setNewCommentContent(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button
                variant="contained"
                onClick={handleAddComment}
                sx={{ borderRadius: 8 }}
              >
                Submit Comment
              </Button>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              You must be logged in to add a comment.
            </Typography>
          )}
        </Box>
      </Box>

      {/* Confirmation Dialog for Post Deletion */}
      <Dialog
        open={openPostDeleteDialog}
        onClose={() => setOpenPostDeleteDialog(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the post titled "{post.title}"? This
            action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenPostDeleteDialog(false)}
            color="primary"
          >
            Cancel
          </Button>
          <Button onClick={handleDeletePost} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for Comment Edit */}
      <Dialog
        open={openCommentEditDialog}
        onClose={() => setOpenCommentEditDialog(false)}
        fullWidth
      >
        <DialogTitle>Edit Comment</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            multiline
            fullWidth
            minRows={3}
            value={commentToEdit?.content || ""}
            onChange={(e) =>
              setCommentToEdit({ ...commentToEdit, content: e.target.value })
            }
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenCommentEditDialog(false)}
            color="primary"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveComment}
            color="primary"
            variant="contained"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog for Comment Deletion */}
      <Dialog
        open={openCommentDeleteDialog}
        onClose={() => setOpenCommentDeleteDialog(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this comment? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenCommentDeleteDialog(false)}
            color="primary"
          >
            Cancel
          </Button>
          <Button onClick={handleConfirmDeleteComment} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
