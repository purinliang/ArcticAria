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
  Paper,
  TextField,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCommentIcon from "@mui/icons-material/AddComment";
import ReplyIcon from "@mui/icons-material/Reply";
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
    dateString.endsWith("Z") ? dateString : dateString + "Z",
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
  const [commentTree, setCommentTree] = useState([]);
  const [commentsMap, setCommentsMap] = useState({});

  // Comments
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentError, setCommentError] = useState(null);
  const [newCommentContent, setNewCommentContent] = useState("");
  const [openAddCommentDialog, setOpenAddCommentDialog] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null); // To store parent comment info for reply
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

  // Build comment tree from flat list
  useEffect(() => {
    if (comments && comments.length > 0) {
      const map = {};
      comments.forEach((comment) => {
        map[comment.id] = { ...comment, children: [] };
      });

      const tree = [];
      comments.forEach((comment) => {
        if (comment.parent_comment_id && map[comment.parent_comment_id]) {
          map[comment.parent_comment_id].children.push(map[comment.id]);
        } else {
          tree.push(map[comment.id]);
        }
      });

      setCommentsMap(map);
      setCommentTree(tree);
    }
  }, [comments]);

  const handleDeletePost = async () => {
    setOpenPostDeleteDialog(false);
    try {
      await axios.delete(`${API_BASE}/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/blog");
    } catch (err) {
      setError(t("page.postDetail.errors.deletePost"));
    }
  };

  const handleReplyComment = (comment) => {
    setReplyingTo(comment);
    setOpenAddCommentDialog(true);
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
        {
          postId: id,
          content: newCommentContent,
          parentCommentId: replyingTo ? replyingTo.id : null,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setNewCommentContent("");
      setOpenAddCommentDialog(false);
      setReplyingTo(null);
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
        { headers: { Authorization: `Bearer ${token}` } },
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
        headers: { Authorization: `Bearer ${token}` },
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
          {t("page.postDetail.buttons.backToList")}
        </Button>
      </Container>
    );
  }

  if (!post) return null;

  // --- Helper Components for Comments ---

  function Comment({ comment, onEdit, onDelete, onReply }) {
    const [isHovered, setIsHovered] = useState(false);

    const createdAt = new Date(comment.createdAt);
    const updatedAt = comment.updatedAt ? new Date(comment.updatedAt) : null;
    const fiveMinutesInMs = 5 * 60 * 1000;
    const isRecentUpdate =
      updatedAt && updatedAt.getTime() - createdAt.getTime() > fiveMinutesInMs;

    const displayTimestamp = isRecentUpdate
      ? getRelativeTime(comment.updatedAt, t)
      : getRelativeTime(comment.createdAt, t);

    const displayLabel = isRecentUpdate
      ? t("page.blogpage.meta.updated")
      : t("page.blogpage.meta.created");

    const parentComment = comment.parent_comment_id
      ? commentsMap[comment.parent_comment_id]
      : null;

    return (
      <Box
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{ position: "relative" }}
      >
        <Paper
          elevation={1}
          sx={{
            p: 2,
            borderRadius: "8px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {parentComment && (
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
              {t("page.postDetail.comments.replyingTo", {
                name: parentComment.username,
              })}
            </Typography>
          )}
          <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
            {comment.content}
          </Typography>
          <Box
            sx={{
              mt: 1,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {comment.username} • {displayLabel}: {displayTimestamp}
            </Typography>
            {isLoggedIn && (
              <Box
                sx={{
                  display: "flex",
                  gap: 0.5,
                  opacity: isHovered ? 1 : 0,
                  transition: "opacity 0.2s ease-in-out",
                }}
              >
                <Tooltip title={t("page.postDetail.tooltips.replyComment")}>
                  <IconButton size="small" onClick={() => onReply(comment)}>
                    <ReplyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                {myUserId === comment.userId && (
                  <>
                    <Tooltip title={t("page.postDetail.tooltips.editComment")}>
                      <IconButton size="small" onClick={() => onEdit(comment)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t("page.postDetail.tooltips.deleteComment")}>
                      <IconButton size="small" onClick={() => onDelete(comment)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </>
                )}
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    );
  }

  function CommentThread({ comments, onEdit, onDelete, onReply, level = 0 }) {
    return (
      <Box
        sx={{
          pl: level > 0 ? 2 : 0,
          borderLeft: level > 0 ? "2px solid #eee" : "none",
          ml: level > 0 ? 1 : 0,
          pt: level > 0 ? 2 : 0,
        }}
      >
        {comments.map((comment) => (
          <Box key={comment.id} sx={{ mb: 2 }}>
            <Comment
              comment={comment}
              onEdit={onEdit}
              onDelete={onDelete}
              onReply={onReply}
            />
            {comment.children && comment.children.length > 0 && (
              <CommentThread
                comments={comment.children}
                onEdit={onEdit}
                onDelete={onDelete}
                onReply={onReply}
                level={level + 1}
              />
            )}
          </Box>
        ))}
      </Box>
    );
  }

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
            <Tooltip title={t("page.postDetail.tooltips.editPost")}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate(`/blog/edit/${post.id}`)}
                sx={{ minWidth: "auto", width: 40, height: 40, borderRadius: "50%" }}
              >
                <EditIcon />
              </Button>
            </Tooltip>
            <Tooltip title={t("page.postDetail.tooltips.deletePost")}>
              <Button
                variant="contained"
                color="error"
                onClick={() => setOpenPostDeleteDialog(true)}
                sx={{ minWidth: "auto", width: 40, height: 40, borderRadius: "50%" }}
              >
                <DeleteIcon />
              </Button>
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
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            {t("page.postDetail.comments.title")}
          </Typography>
          {isLoggedIn && (
            <Tooltip title={t("page.postDetail.tooltips.addComment")}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  setReplyingTo(null);
                  setOpenAddCommentDialog(true);
                }}
                sx={{ minWidth: "auto", width: 40, height: 40, borderRadius: "50%" }}
              >
                <AddCommentIcon />
              </Button>
            </Tooltip>
          )}
        </Box>

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
          <Box sx={{ maxHeight: "60vh", overflowY: "auto", pr: 1 }}>
            {commentTree.length > 0 ? (
              <CommentThread
                comments={commentTree}
                onEdit={handleEditComment}
                onDelete={handleDeleteComment}
                onReply={handleReplyComment}
              />
            ) : (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontStyle: "italic", textAlign: "center", py: 4 }}
              >
                {t("page.postDetail.comments.empty")}
              </Typography>
            )}
          </Box>
        )}

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
              title: post.title,
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

      {/* Dialog for Add Comment */}
      <Dialog
        open={openAddCommentDialog}
        onClose={() => {
          setOpenAddCommentDialog(false);
          setNewCommentContent("");
          setReplyingTo(null);
        }}
        fullWidth
      >
        <DialogTitle>
          {replyingTo
            ? t("page.postDetail.comments.replyTitle", {
              name: replyingTo.username,
            })
            : t("page.postDetail.comments.addTitle")}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            multiline
            fullWidth
            minRows={3}
            placeholder={t("page.postDetail.comments.placeholder")}
            value={newCommentContent}
            onChange={(e) => setNewCommentContent(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenAddCommentDialog(false);
              setNewCommentContent("");
              setReplyingTo(null);
            }}
            color="primary"
          >
            {t("dialog.cancel")}
          </Button>
          <Button onClick={handleAddComment} color="primary" variant="contained">
            {t("page.postDetail.comments.submit")}
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
