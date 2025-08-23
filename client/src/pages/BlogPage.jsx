import { useEffect, useState } from 'react';
import {
    Container, Typography, Button, Divider, Paper, Box, TextField, Card, CardContent, CardActions, IconButton,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_BLOG_API_BASE;

export default function BlogPage() {
    const navigate = useNavigate();

    const [posts, setPosts] = useState([]);
    const [authorId, setAuthorId] = useState('');
    const [newPost, setNewPost] = useState({ title: '', content: '' });
    const [editingPost, setEditingPost] = useState(null);

    const token = localStorage.getItem('jwtToken');
    const isLoggedIn = !!token;

    const fetchAllPosts = async () => {
        try {
            const res = await axios.get(`${API_BASE}/posts`);
            console.log(API_BASE)
            setPosts(res.data);
        } catch (err) {
            alert(`Failed to fetch all posts: ${err.response?.data || err.message}`);
        }
    };

    const fetchAuthorPosts = async () => {
        if (!authorId) {
            alert('Please enter an author ID.');
            return;
        }
        try {
            const res = await axios.get(`${API_BASE}/author/${authorId}`);
            setPosts(res.data);
        } catch (err) {
            alert(`Failed to fetch author's posts: ${err.response?.data || err.message}`);
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!isLoggedIn) {
            alert('You must be logged in to create a post.');
            return;
        }
        try {
            await axios.post(`${API_BASE}/posts`, newPost, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNewPost({ title: '', content: '' });
            alert('Post created successfully!');
            fetchAllPosts();
        } catch (err) {
            alert(`Failed to create post: ${err.response?.data || err.message}`);
        }
    };

    const handleUpdatePost = async (e) => {
        e.preventDefault();
        if (!isLoggedIn) {
            alert('You must be logged in to update a post.');
            return;
        }
        try {
            await axios.put(`${API_BASE}/posts/${editingPost.id}`, {
                title: editingPost.title,
                content: editingPost.content
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEditingPost(null);
            alert('Post updated successfully!');
            fetchAllPosts();
        } catch (err) {
            alert(`Failed to update post: ${err.response?.data || err.message}`);
        }
    };

    const handleDeletePost = async (id) => {
        if (!isLoggedIn) {
            alert('You must be logged in to delete a post.');
            return;
        }
        if (window.confirm('Are you sure you want to delete this post?')) {
            try {
                await axios.delete(`${API_BASE}/posts/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('Post deleted successfully!');
                fetchAllPosts();
            } catch (err) {
                alert(`Failed to delete post: ${err.response?.data || err.message}`);
            }
        }
    };

    useEffect(() => {
        fetchAllPosts();
    }, []);

    const renderPost = (post) => (
        <Card key={post.id} sx={{ mb: 2 }}>
            <CardContent>
                <Typography variant="h6">{post.title}</Typography>
                {post.content && <Typography variant="body2" color="text.secondary">{post.content}</Typography>}
                <Typography variant="caption" display="block" color="text.secondary">
                    Author ID: {post.user_id}
                </Typography>
                <Typography variant="caption" display="block" color="text.secondary">
                    Created: {new Date(post.created_at).toLocaleString()}
                </Typography>
            </CardContent>
            {isLoggedIn && (
                <CardActions>
                    <IconButton onClick={() => setEditingPost(post)}>
                        <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeletePost(post.id)}>
                        <DeleteIcon />
                    </IconButton>
                </CardActions>
            )}
        </Card>
    );

    return (
        <Container maxWidth="md">
            <Typography variant="h4" mt={4}>Blog Management Console</Typography>
            <Typography variant="h6" mt={2} color={isLoggedIn ? 'primary' : 'error'}>
                {isLoggedIn ? 'Logged In' : 'Not Logged In - Please Log In to manage posts.'}
            </Typography>

            <Divider sx={{ my: 4 }} />

            <Typography variant="h5" sx={{ mb: 2 }}>Create New Post</Typography>
            <Box component="form" onSubmit={handleCreatePost} sx={{ mb: 4 }}>
                <TextField
                    label="Title"
                    fullWidth
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    margin="normal"
                    required
                />
                <TextField
                    label="Content"
                    fullWidth
                    multiline
                    rows={4}
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    margin="normal"
                    required
                />
                <Button type="submit" variant="contained" sx={{ mt: 2 }} disabled={!isLoggedIn}>
                    Submit New Post
                </Button>
            </Box>

            <Divider sx={{ my: 4 }} />

            {editingPost && (
                <Paper sx={{ p: 2, mb: 4 }}>
                    <Typography variant="h5">Edit Post</Typography>
                    <Box component="form" onSubmit={handleUpdatePost}>
                        <TextField
                            label="Post ID"
                            fullWidth
                            value={editingPost.id}
                            margin="normal"
                            disabled
                        />
                        <TextField
                            label="Title"
                            fullWidth
                            value={editingPost.title}
                            onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                            margin="normal"
                            required
                        />
                        <TextField
                            label="Content"
                            fullWidth
                            multiline
                            rows={4}
                            value={editingPost.content}
                            onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                            margin="normal"
                            required
                        />
                        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                            <Button type="submit" variant="contained">Update Post</Button>
                            <Button variant="outlined" onClick={() => setEditingPost(null)}>Cancel</Button>
                        </Box>
                    </Box>
                </Paper>
            )}

            <Typography variant="h5" sx={{ mb: 2 }}>Filter Posts by Author ID</Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                <TextField
                    label="Enter Author ID"
                    value={authorId}
                    onChange={(e) => setAuthorId(e.target.value)}
                    fullWidth
                />
                <Button variant="contained" onClick={fetchAuthorPosts}>
                    Get Posts
                </Button>
                <Button variant="outlined" onClick={fetchAllPosts}>
                    Reset
                </Button>
            </Box>

            <Divider sx={{ my: 4 }} />

            <Typography variant="h5" sx={{ mb: 2 }}>All Posts</Typography>
            <Box>
                {posts.length > 0 ? (
                    posts.map(renderPost)
                ) : (
                    <Typography color="textSecondary">No posts found.</Typography>
                )}
            </Box>
        </Container>
    );
}
