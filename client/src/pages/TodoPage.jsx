import { useState, useEffect } from 'react';
import { TextField, Button, Box, Typography, Container, List, ListItem, ListItemText, Divider } from '@mui/material';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_TODO_API_BASE;

export default function TodoPage() {
    const [todos, setTodos] = useState([]);
    const [form, setForm] = useState({ title: '', content: '' });

    const token = localStorage.getItem('jwtToken');

    const fetchTodos = async () => {
        try {
            const res = await axios.get(`${API_BASE}/todo`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTodos(res.data);
        } catch (err) {
            console.error('Failed to fetch todos:', err);
        }
    };

    const handleCreate = async () => {
        try {
            await axios.post(`${API_BASE}/todo`, form, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            setForm({ title: '', content: '' });
            fetchTodos();
        } catch (err) {
            alert(`Create error: ${err.response?.data || err.message}`);
        }
    };

    useEffect(() => {
        fetchTodos();
    }, []);

    return (
        <Container maxWidth="sm">
            <Box mt={4}>
                <Typography variant="h5" gutterBottom>My Todos</Typography>
                <TextField fullWidth label="Title" name="title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} sx={{ mt: 2 }} />
                <TextField fullWidth label="Content" name="content" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} sx={{ mt: 2 }} />
                <Button variant="contained" color="primary" onClick={handleCreate} sx={{ mt: 2 }}>
                    Add Todo
                </Button>

                <List sx={{ mt: 4 }}>
                    {todos.map(todo => (
                        <Box key={todo.id}>
                            <ListItem>
                                <ListItemText
                                    primary={todo.title}
                                    secondary={todo.content}
                                />
                            </ListItem>
                            <Divider />
                        </Box>
                    ))}
                </List>
            </Box>
        </Container>
    );
}
