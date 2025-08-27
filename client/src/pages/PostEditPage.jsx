import { useEffect, useState } from 'react';
import {
    Container, Typography, Box, TextField, Button, Paper, Alert, IconButton, CircularProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const API_BASE = import.meta.env.VITE_BLOG_API_BASE;

export default function PostEditPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { isLoggedIn } = useAuth();

    const [post, setPost] = useState({ title: '', content: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);

    const isEditMode = !!id;
    const token = localStorage.getItem('jwtToken');

    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/login');
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
                    console.error('Failed to fetch post for editing:', err);
                    setError('Failed to fetch post. Please check the post ID.');
                } finally {
                    setLoading(false);
                }
            };
            fetchPost();
        }
    }, [id, isLoggedIn, navigate, token, isEditMode]);

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
                setMessage('Post updated successfully!');
            } else {
                await axios.post(`${API_BASE}/posts`, post, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessage('Post created successfully!');
                setPost({ title: '', content: '' }); // Clear form for new post
            }
        } catch (err) {
            console.error('Failed to submit post:', err);
            setError(`Failed to ${isEditMode ? 'update' : 'create'} post: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditMode) {
        return (
            <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Container>
        );
    }

    // Check for not logged in and not in loading state
    if (!isLoggedIn && !loading) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Alert severity="warning">You must be logged in to access this page.</Alert>
                <Button sx={{ mt: 2 }} variant="contained" onClick={() => navigate('/login')}>Go to Login</Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <IconButton onClick={() => navigate('/blog')} sx={{ mr: 1 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {isEditMode ? 'Edit Blog Post' : 'Create New Blog Post'}
                </Typography>
            </Box>

            <Paper sx={{ p: 4, mb: 4, boxShadow: 3 }}>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Post Title"
                        name="title"
                        fullWidth
                        value={post.title}
                        onChange={handleChange}
                        margin="normal"
                        required
                    />
                    <TextField
                        label="Content (Markdown supported)"
                        name="content"
                        fullWidth
                        multiline
                        rows={10}
                        value={post.content}
                        onChange={handleChange}
                        margin="normal"
                        required
                    />
                    <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading}
                            sx={{ textTransform: 'none' }}
                        >
                            {loading ? <CircularProgress size={24} /> : (isEditMode ? 'Update Post' : 'Publish Post')}
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => navigate('/blog')}
                            disabled={loading}
                            sx={{ textTransform: 'none' }}
                        >
                            Cancel
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Container>
    );
}
