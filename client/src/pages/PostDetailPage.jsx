import { useEffect, useState } from 'react';
import { Container, Typography, Box, Button, CircularProgress, Alert, IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { jwtDecode } from 'jwt-decode';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';

const API_BASE = import.meta.env.VITE_BLOG_API_BASE;

export default function PostDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isLoggedIn } = useAuth();

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAuthor, setIsAuthor] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);

    const token = localStorage.getItem('jwtToken');

    useEffect(() => {
        const fetchPost = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${API_BASE}/posts/${id}`);
                setPost(res.data);
                setError(null);

                // Check if the current logged-in user is the author
                if (token) {
                    const decodedToken = jwtDecode(token);
                    if (decodedToken.user_id === res.data.user_id) {
                        setIsAuthor(true);
                    } else {
                        setIsAuthor(false);
                    }
                } else {
                    setIsAuthor(false);
                }

            } catch (err) {
                console.error('Failed to fetch post:', err);
                setError('Failed to load post. It may not exist.');
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
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate('/blog');
        } catch (err) {
            console.error('Failed to delete post:', err);
            setError('Failed to delete post.');
        }
    };

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Alert severity="error">{error}</Alert>
                <Button sx={{ mt: 2 }} variant="contained" onClick={() => navigate('/blog')}>Go Back to Blog List</Button>
            </Container>
        );
    }

    if (!post) {
        return null;
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <IconButton onClick={() => navigate('/blog')} sx={{ mr: 1 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {post.title}
                </Typography>
                {isLoggedIn && isAuthor && (
                    <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                        <IconButton onClick={() => navigate(`/blog/new?edit=${post.id}`)} color="primary">
                            <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => setOpenDialog(true)} color="error">
                            <DeleteIcon />
                        </IconButton>
                    </Box>
                )}
            </Box>

            <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 2 }}>
                Author: {post.user_id} | Published: {new Date(post.created_at).toLocaleString()}
            </Typography>

            <Box sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: 1, backgroundColor: 'white' }}>
                <Typography component="div" sx={{ whiteSpace: 'pre-wrap', lineHeight: '1.6rem' }}>
                    <ReactMarkdown remarkPlugins={[gfm]}>
                        {post.content}
                    </ReactMarkdown>
                </Typography>
            </Box>

            {/* Confirmation Dialog for Deletion */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete the post titled "{post.title}"? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)} color="primary">Cancel</Button>
                    <Button onClick={handleDelete} color="error" autoFocus>Delete</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
