import { useEffect, useState } from 'react';
import { Container, Typography, Button, Divider, Box, Card, CardContent, Link, IconButton, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';

const API_BASE = import.meta.env.VITE_BLOG_API_BASE;

/**
 * Formats a date string into a localized, human-readable format.
 * @param {string} dateString The date string (e.g., from post.createdAt).
 * @returns {string} The formatted date string.
 */
const formatPostDate = (dateString) => {
    // The date string from the backend is in ISO format, add 'Z' to treat it as UTC.
    const date = new Date(dateString + 'Z');
    return date.toLocaleString({
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
    });
};

export default function BlogPage() {
    const navigate = useNavigate();
    const { isLoggedIn } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    /**
     * Fetches all blog posts from the backend.
     */
    const fetchAllPosts = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/posts`);
            setPosts(res.data);
            console.log(res.data)
            setError(null);
        } catch (err) {
            console.error('Failed to fetch all posts:', err);
            setError('Failed to load posts. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllPosts();
    }, []);

    // A helper function to truncate a string and add ellipsis
    const truncateString = (str, maxLength) => {
        if (str && str.length > maxLength) {
            return str.substring(0, maxLength) + '...';
        }
        return str;
    };

    const renderPost = (post) => (
        <Card
            key={post.id}
            sx={{
                mb: 3,
                boxShadow: 3,
                '&:hover': {
                    boxShadow: 6,
                    transform: 'translateY(-2px)',
                    transition: 'transform 0.2s',
                    cursor: 'pointer'
                }
            }}
            onClick={() => navigate(`/blog/${post.id}`)}
        >
            <CardContent>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center', // This aligns items vertically in the middle
                        mb: 1
                    }}
                >
                    <Typography variant="h5" sx={{ fontWeight: 'bold', flexGrow: 1, mr: 2 }}>
                        {post.title}
                    </Typography>
                    <Box sx={{ flexShrink: 0 }}>
                        <Typography variant="caption" display="block" color="text.secondary" >
                            Author: {truncateString(post.userId, 16)}
                        </Typography>
                    </Box>
                </Box>

                <Box
                    sx={{
                        // Calculate max height for 8 lines (8 * 1.5rem)
                        maxHeight: '18rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 12,
                        WebkitBoxOrient: 'vertical',
                        whiteSpace: 'pre-wrap',
                        color: 'text.primary',
                        fontSize: '1rem',
                        lineHeight: '1.5rem',
                    }}
                >
                    <Typography component="div" sx={{
                        whiteSpace: 'pre-wrap',
                        lineHeight: '1.6rem',
                        '& img': {
                            maxWidth: '100%',
                            height: 'auto',
                            display: 'block',
                            mx: 'auto'
                        }
                    }}>
                        <ReactMarkdown remarkPlugins={[gfm]}>
                            {post.content}
                        </ReactMarkdown>
                    </Typography>
                </Box>
                <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                    Created: {formatPostDate(post.createdAt)}
                </Typography>
                <Typography variant="caption" display="block" color="text.secondary" >
                    Updated: {formatPostDate(post.updatedAt)}
                </Typography>

            </CardContent>
        </Card >
    );

    return (
        <Container maxWidth="md">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, mt: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    Discuss
                </Typography>
                {isLoggedIn && (
                    <Tooltip title="Create new post">
                        <IconButton
                            color="primary"
                            onClick={() => navigate('/blog/new')}
                            sx={{
                                border: '1px solid',
                                borderColor: 'primary.main'
                            }}
                        >
                            <AddIcon />
                        </IconButton>
                    </Tooltip>
                )}
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Share your thoughts, ask questions, or start a new discussion.
            </Typography>

            {loading && <Typography align="center">Loading posts...</Typography>}
            {error && <Typography color="error" align="center">{error}</Typography>}
            {!loading && !error && (
                <Box>
                    {posts.length > 0 ? (
                        posts.map(renderPost)
                    ) : (
                        <Typography color="text.secondary" align="center">
                            There are no discussions yet. Be the first to share your thoughts!
                        </Typography>
                    )}
                </Box>
            )}
        </Container>
    );
}