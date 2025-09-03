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
import CommentsSection from "../components/CommentsSection";
import ConfirmationDialog from "../components/ConfirmationDialog";

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

  const token = localStorage.getItem("jwtToken");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
  const showComments =
    import.meta.env.VITE_IS_PRODUCTION_ENVIRONMENT !== "true";

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
                sx={{
                  minWidth: "auto",
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                }}
              >
                <EditIcon />
              </Button>
            </Tooltip>
            <Tooltip title={t("page.postDetail.tooltips.deletePost")}>
              <Button
                variant="contained"
                color="error"
                onClick={() => setOpenPostDeleteDialog(true)}
                sx={{
                  minWidth: "auto",
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                }}
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

      {showComments && <CommentsSection postId={id} />}

      {/* Confirmation Dialog for Post Deletion */}
      <ConfirmationDialog
        open={openPostDeleteDialog}
        onClose={() => setOpenPostDeleteDialog(false)}
        onConfirm={handleDeletePost}
        title="page.postDetail.dialog.postDelete.title"
        contentText="page.postDetail.dialog.postDelete.content"
        contentOptions={{ title: post.title }}
      />
    </Container>
  );
}
