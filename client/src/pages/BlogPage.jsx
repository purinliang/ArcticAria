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

const API_BASE = import.meta.env.VITE_BLOG_API_BASE;

/**
 * Formats a date string into a localized, human-readable format.
 * @param {string} dateString The date string (e.g., from post.createdAt).
 * @returns {string} The formatted date string.
 */
const formatPostDate = (dateString) => {
    // The date string from the backend is in ISO format, add 'Z' to treat it as UTC.
    const date = new Date(dateString + "Z");
    return date.toLocaleString({
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
    });
};

/**
 * A helper function to truncate a string and add ellipsis.
 * @param {string} str The string to truncate.
 * @param {number} maxLength The maximum allowed length.
 * @returns {string} The truncated string with an ellipsis, or the original string.
 */
const truncateString = (str, maxLength) => {
    if (str && str.length > maxLength) {
        return str.substring(0, maxLength) + "...";
    }
    return str;
};

// Define a fetcher function for useSWR
const fetcher = async (url) => {
    const res = await axios.get(url);
    return res.data;
};

export default function BlogPage() {
    const navigate = useNavigate();
    const { isLoggedIn } = useAuth();

    // Use useSWR to fetch and cache data
    const { data: posts, error } = useSWR(`${API_BASE}/posts`, fetcher, {
        dedupingInterval: 1000, // cache for 1 seconds
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
    });

    const loading = !posts && !error;

    const renderPost = (post) => (
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
                    sx={{ fontWeight: "bold", flexGrow: 1, mr: 2 }}
                >
                    {post.title}
                </Typography>
                <Box
                    sx={{
                        // With Masonry, we no longer need a fixed maxHeight or lineClamp
                        whiteSpace: "pre-wrap",
                        color: "text.primary",
                        fontSize: "1rem",
                        lineHeight: "1.5rem",
                    }}
                >
                    <Typography
                        component="div"
                        sx={{
                            whiteSpace: "pre-wrap",
                            lineHeight: "1.6rem",
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
                <Typography variant="caption" display="block" color="text.secondary">
                    Author: {truncateString(post.userId, 13)}
                </Typography>
                <Typography variant="caption" display="block" color="text.secondary">
                    Created: {formatPostDate(post.createdAt)}
                </Typography>
                <Typography variant="caption" display="block" color="text.secondary">
                    Updated: {formatPostDate(post.updatedAt)}
                </Typography>
            </CardContent>
        </Card>
    );

    return (
        <Container maxWidth="lg" >
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
                    Discuss
                </Typography>
                {isLoggedIn && (
                    <Tooltip title="Create new post">
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => navigate("/blog/new")}
                            sx={{ minWidth: "auto", p: 1, borderRadius: "50%" }}
                        >
                            <PostAddIcon sx={{ fontSize: 24 }} />
                        </Button>
                    </Tooltip>
                )}
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Share your thoughts, ask questions, or start a new discussion.
            </Typography>

            {loading && <Typography align="center">Loading posts...</Typography>}
            {error && (
                <Typography color="error" align="center">
                    Failed to load posts. Please try again later.
                </Typography>
            )}
            <Box sx={{ display: "flex", justifyContent: "center", p: "0", m: "0" }}>
                {!loading && !error && (
                    <Masonry columns={{ xs: 1, sm: 2, md: 3 }} spacing={2}>
                        {posts && posts.length > 0 ? (
                            posts.map(renderPost)
                        ) : (
                            <Typography color="text.secondary" align="center">
                                There are no discussions yet. Be the first to share your
                                thoughts!
                            </Typography>
                        )}
                    </Masonry>
                )}
            </Box>
        </Container>
    );
}
