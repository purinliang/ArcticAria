import { useEffect, useState } from 'react';
import { Container, Typography, Button, Divider, Box, Card, CardContent, Link } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';

const API_BASE = import.meta.env.VITE_BLOG_API_BASE;

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
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {post.title}
                </Typography>
                <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 2 }}>
                    Author: {post.user_id} | Created: {new Date(post.created_at).toLocaleString()}
                </Typography>
                <Box
                    sx={{
                        // Display only the first few lines of the content
                        maxHeight: '100px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 5, // Display up to 5 lines
                        WebkitBoxOrient: 'vertical',
                        whiteSpace: 'pre-wrap', // Preserve markdown line breaks
                        color: 'text.primary',
                        fontSize: '1rem',
                        lineHeight: '1.5rem',
                    }}
                >
                    <ReactMarkdown remarkPlugins={[gfm]}>
                        {post.content || ''}
                    </ReactMarkdown>
                </Box>
                <Link
                    component="button"
                    variant="body2"
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/blog/${post.id}`);
                    }}
                    sx={{ mt: 1, fontWeight: 'bold' }}
                >
                    Read More
                </Link>
            </CardContent>
        </Card>
    );

    return (
        <Container maxWidth="md">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, mt: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    All Blog Posts
                </Typography>
                {isLoggedIn && (
                    <Button
                        variant="contained"
                        onClick={() => navigate('/blog/new')}
                        sx={{ textTransform: 'none' }}
                    >
                        Create New Post
                    </Button>
                )}
            </Box>

            {loading && <Typography align="center">Loading posts...</Typography>}
            {error && <Typography color="error" align="center">{error}</Typography>}
            {!loading && !error && (
                <Box>
                    {posts.length > 0 ? (
                        posts.map(renderPost)
                    ) : (
                        <Typography color="text.secondary" align="center">No posts found.</Typography>
                    )}
                </Box>
            )}
        </Container>
    );
}
