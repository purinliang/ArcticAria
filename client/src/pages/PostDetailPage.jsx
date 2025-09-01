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
  TextField
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { jwtDecode } from "jwt-decode";
import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

const API_BASE = import.meta.env.VITE_BLOG_API_BASE;

// Relative time using your blogpage time keys for consistency
const getRelativeTime = (dateString, t) => {
  const date = new Date(
    dateString.endsWith("Z") ? dateString : dateString + "Z"
  );
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return t("page.blogpage.time.justNow");
  if (minutes < 60) return t("page.blogpage.time.minutes", { count: minutes });
  if (hours < 24) return t("page.blogpage.time.hours", { count: hours });
  if (days < 30) return t("page.blogpage.time.days", { count: days });
  return dayjs(date).format(t("page.blogpage.time.longDateFormat"));
};

export default function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { t } = useTranslation();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthor, setIsAuthor] = useState(false);
  const [openPostDeleteDialog, setOpenPostDeleteDialog] = useState(false);

  // Comments
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
          setIsAuthor(decodedToken.userId === res.data.userId);
        } else {
          setIsAuthor(false);
        }
      } catch (err) {
        setError(t("page.postDetail.errors.loadPost"));
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, token, t]);

  // Fetch Comments
  useEffect(() => {
    const fetchComments = async () => {
      if (!id) return;
      setCommentsLoading(true);
      try {
        const res = await axios.get(`${API_BASE}/posts/${id}/comments`);
        setComments(res.data);
        setCommentError(null);
      } catch (err) {
        setCommentError(t("page.postDetail.errors.loadComments"));
      } finally {
        setCommentsLoading(false);
      }
    };
    fetchComments();
  }, [id, token, t]);

  const handleDeletePost = async () => {
    setOpenPostDeleteDialog(false);
    try {
      await axios.delete(`${API_BASE}/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate("/blog");
    } catch (err) {
      setError(t("page.postDetail.errors.deletePost"));
    }
  };

  const handleAddComment = async () => {
    if (!newCommentContent.trim()) {
      alert(t("page.postDetail.validation.emptyComment"));
      return;
    }
    if (!isLoggedIn || !token) {
      alert(t("page.postDetail.validation.mustLogin"));
      return;
    }

    try {
      await axios.post(
        `${API_BASE}/comments`,
        { postId: id, content: newCommentContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewCommentContent("");
      const res = await axios.get(`${API_BASE}/posts/${id}/comments`);
      setComments(res.data);
    } catch (err) {
      setCommentError(t("page.postDetail.errors.addComment"));
    }
  };

  const handleEditComment = (comment) => {
    setCommentToEdit(comment);
    setOpenCommentEditDialog(true);
  };

  const handleSaveComment = async () => {
    if (!commentToEdit || !commentToEdit.content.trim()) {
      alert(t("page.postDetail.validation.emptyCommentContent"));
      return;
    }

    try {
      await axios.put(
        `${API_BASE}/comments/${commentToEdit.id}`,
        { content: commentToEdit.content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOpenCommentEditDialog(false);
      setCommentToEdit(null);
      const res = await axios.get(`${API_BASE}/posts/${id}/comments`);
      setComments(res.data);
    } catch (err) {
      setCommentError(t("page.postDetail.errors.updateComment"));
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
        headers: { Authorization: `Bearer ${token}` }
      });
      setOpenCommentDeleteDialog(false);
      setCommentToDelete(null);
      const res = await axios.get(`${API_BASE}/posts/${id}/comments`);
      setComments(res.data);
    } catch (err) {
      setCommentError(t("page.postDetail.errors.deleteComment"));
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
          height: "80vh"
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
          {t("page.postDetail.buttons.backToList")}
        </Button>
      </Container>
    );
  }

  if (!post) return null;

  const createdAt = new Date(post.createdAt);
  const updatedAt = new Date(post.updatedAt);
  const fiveMinutesInMs = 5 * 60 * 1000;
  const isRecentUpdate =
    updatedAt.getTime() - createdAt.getTime() < fiveMinutesInMs;

  const displayTimestamp = isRecentUpdate
    ? getRelativeTime(post.createdAt, t)
    : getRelativeTime(post.updatedAt, t);

  const displayLabel = isRecentUpdate
    ? t("page.blogpage.meta.created")
    : t("page.blogpage.meta.updated");

  const myUserId = token ? jwtDecode(token).userId : null;

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      {/* Post Title & Author Actions */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
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
            <Tooltip title={t("page.postDetail.tooltips.editPost")}>
              <IconButton
                onClick={() => navigate(`/blog/edit/${post.id}`)}
                color="primary"
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={t("page.postDetail.tooltips.deletePost")}>
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
          {t("page.blogpage.meta.author", { name: post.username })}
        </Typography>
        <Typography variant="caption" display="block" color="text.secondary">
          {displayLabel}: {displayTimestamp}
        </Typography>
      </Box>

      {/* Markdown content */}
      <Box
        sx={{
          pt: isMobile ? 0 : 0.75,
          pb: isMobile ? 0 : 0.75,
          pl: isMobile ? 1.5 : 2.5,
          pr: isMobile ? 1.5 : 2.5,
          border: "1px solid #e0e0e0",
          borderRadius: "8px",
          boxShadow: 1,
          backgroundColor: "white"
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
              mx: "auto"
            }
          }}
        >
          <ReactMarkdown remarkPlugins={[gfm]}>{post.content}</ReactMarkdown>
        </Typography>
      </Box>

      {/* --- Comments Section --- */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
          {t("page.postDetail.comments.title")}
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
                    flexDirection: "column"
                  }}
                >
                  <Typography variant="body1">{comment.content}</Typography>
                  <Box
                    sx={{
                      mt: 1,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {comment.username} •{" "}
                      {getRelativeTime(comment.createdAt, t)}
                    </Typography>
                    {isLoggedIn && myUserId === comment.userId && (
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Tooltip
                          title={t("page.postDetail.tooltips.editComment")}
                        >
                          <IconButton
                            size="small"
                            onClick={() => handleEditComment(comment)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip
                          title={t("page.postDetail.tooltips.deleteComment")}
                        >
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
                {t("page.postDetail.comments.empty")}
              </Typography>
            )}
          </Box>
        )}

        {/* Comment Form */}
        <Box sx={{ mt: 3, pt: 3, borderTop: "1px solid #e0e0e0" }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {t("page.postDetail.comments.addTitle")}
          </Typography>
          {isLoggedIn ? (
            <Box>
              <TextField
                multiline
                fullWidth
                minRows={3}
                variant="outlined"
                placeholder={t("page.postDetail.comments.placeholder")}
                value={newCommentContent}
                onChange={(e) => setNewCommentContent(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button
                variant="contained"
                onClick={handleAddComment}
                sx={{ borderRadius: 8 }}
              >
                {t("page.postDetail.comments.submit")}
              </Button>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {t("page.postDetail.comments.loginToComment")}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Confirmation Dialog for Post Deletion */}
      <Dialog
        open={openPostDeleteDialog}
        onClose={() => setOpenPostDeleteDialog(false)}
      >
        <DialogTitle>
          {t("page.postDetail.dialog.postDelete.title")}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("page.postDetail.dialog.postDelete.content", {
              title: post.title
            })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenPostDeleteDialog(false)}
            color="primary"
          >
            {t("dialog.cancel")}
          </Button>
          <Button onClick={handleDeletePost} color="error" autoFocus>
            {t("dialog.confirm")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for Comment Edit */}
      <Dialog
        open={openCommentEditDialog}
        onClose={() => setOpenCommentEditDialog(false)}
        fullWidth
      >
        <DialogTitle>
          {t("page.postDetail.dialog.commentEdit.title")}
        </DialogTitle>
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
            {t("dialog.cancel")}
          </Button>
          <Button
            onClick={handleSaveComment}
            color="primary"
            variant="contained"
          >
            {t("page.postDetail.dialog.commentEdit.save")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog for Comment Deletion */}
      <Dialog
        open={openCommentDeleteDialog}
        onClose={() => setOpenCommentDeleteDialog(false)}
      >
        <DialogTitle>
          {t("page.postDetail.dialog.commentDelete.title")}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("page.postDetail.dialog.commentDelete.content")}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenCommentDeleteDialog(false)}
            color="primary"
          >
            {t("dialog.cancel")}
          </Button>
          <Button onClick={handleConfirmDeleteComment} color="error" autoFocus>
            {t("dialog.confirm")}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
