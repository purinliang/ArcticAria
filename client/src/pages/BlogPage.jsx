import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Tooltip,
} from "@mui/material";
import PostAddIcon from "@mui/icons-material/PostAdd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";
import { Masonry } from "@mui/lab";
import useSWR from "swr";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

const API_BASE = import.meta.env.VITE_BLOG_API_BASE;

// Relative time using i18n pluralization + long date fallback
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

  // Older posts: format with a locale-controlled format string
  return dayjs(date).format(t("page.blogpage.time.longDateFormat"));
};

// SWR fetcher
const fetcher = async (url) => {
  const res = await axios.get(url);
  return res.data;
};

export default function BlogPage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { t } = useTranslation();

  const { data: posts, error } = useSWR(`${API_BASE}/posts`, fetcher, {
    dedupingInterval: 1000,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  const loading = !posts && !error;

  const renderPost = (post) => {
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
      <Card
        key={post.id}
        sx={{
          boxShadow: 3,
          "&:hover": {
            boxShadow: 6,
            transform: "translateY(-2px)",
            transition: "transform 0.2s",
            cursor: "pointer",
          },
        }}
        onClick={() => navigate(`/blog/${post.id}`)}
      >
        <CardContent>
          <Typography
            variant="h5"
            sx={{ fontWeight: "bold", fontSize: "1.2rem", flexGrow: 1, mr: 2 }}
          >
            {post.title}
          </Typography>

          <Typography
            component="div"
            sx={{
              whiteSpace: "pre-wrap",
              fontSize: "0.9rem",
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

          <Typography
            variant="caption"
            display="block"
            color="text.secondary"
            sx={{ fontSize: "0.7rem", mt: 1 }}
          >
            {t("page.blogpage.meta.author", { name: post.username })}
          </Typography>
          <Typography
            variant="caption"
            display="block"
            color="text.secondary"
            sx={{ fontSize: "0.7rem", mt: -0.25, mb: -1.5 }}
          >
            {displayLabel}: {displayTimestamp}
          </Typography>
        </CardContent>
      </Card>
    );
  };

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
          mt: 4,
        }}
      >
        <Typography
          variant="h4"
          sx={{ fontWeight: "bold", color: "primary.main" }}
        >
          {t("page.blogpage.title")}
        </Typography>

        {isLoggedIn && (
          <Tooltip title={t("page.blogpage.tooltips.newPost")}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/blog/new")}
              sx={{ minWidth: "auto", p: 1, borderRadius: "50%" }}
              aria-label={t("page.blogpage.buttons.newPost")}
            >
              <PostAddIcon sx={{ fontSize: 24 }} />
            </Button>
          </Tooltip>
        )}
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        {t("page.blogpage.subtitle")}
      </Typography>

      {loading && (
        <Typography align="center">
          {t("page.blogpage.status.loading")}
        </Typography>
      )}

      {error && (
        <Typography color="error" align="center">
          {t("page.blogpage.status.error")}
        </Typography>
      )}

      <Box sx={{ display: "flex", justifyContent: "center", p: 0, m: 0 }}>
        {!loading && !error && (
          <Masonry columns={{ xs: 1, sm: 2, md: 3 }} spacing={2}>
            {posts && posts.length > 0 ? (
              posts.map(renderPost)
            ) : (
              <Typography color="text.secondary" align="center">
                {t("page.blogpage.status.empty")}
              </Typography>
            )}
          </Masonry>
        )}
      </Box>
    </Container>
  );
}
