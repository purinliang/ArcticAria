import { useEffect, useState } from 'react';
import {
    Container, Typography, TextField, Button, Box, Grid, Card, CardContent, Divider, MenuItem, Checkbox
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/en-gb'; // force dd/MM/yyyy locale
import axios from 'axios';

const API_BASE = import.meta.env.VITE_TODO_API_BASE;

export default function TodoPage() {
    const [todos, setTodos] = useState({
        reminding: [], upcoming: [],
        overdued: [], completed: []
    });
    const [form, setForm] = useState({
        title: '',
        content: '',
        next_due_date: '',
        recurrence_rule: '',
        reminder_days_before: 0
    });

    const token = localStorage.getItem('jwtToken');

    const fetchTodos = async () => {
        try {
            const res = await axios.get(`${API_BASE}/todo`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTodos(res.data);
        } catch (err) {
            alert(`Failed to fetch todos: ${err.response?.data || err.message}`);
        }
    };

    const handleCreate = async () => {
        try {
            await axios.post(`${API_BASE}/todo`, form, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            setForm({ title: '', content: '', next_due_date: '', recurrence_rule: '', reminder_days_before: 0 });
            fetchTodos();
        } catch (err) {
            alert(`Create failed: ${err.response?.data || err.message}`);
        }
    };

    const handleChange = e => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    function renderTodoGroup(todos, label) {
        if (!todos || !Array.isArray(todos)) return null;

        const handleToggleComplete = async (id, currentStatus) => {
            try {
                const token = localStorage.getItem('jwtToken');
                console.log(`PUT ${import.meta.env.VITE_TODO_API_BASE}/todo/${id}`);
                await axios.put(`${import.meta.env.VITE_TODO_API_BASE}/todo/${id}`, {
                    completed: !currentStatus
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                window.location.reload();   // debug only
            } catch (err) {
                alert('Failed to update todo');
                console.error(err);
            }
        };

        const handleDelete = async (id) => {
            try {
                const token = localStorage.getItem('jwtToken');
                console.log(`DELETE ${import.meta.env.VITE_TODO_API_BASE}/todo/${id}`);
                await axios.delete(`${import.meta.env.VITE_TODO_API_BASE}/todo/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                window.location.reload();   // debug only
            } catch (err) {
                alert('Failed to delete todo');
                console.error(err);
            }
        };

        const daysUntil = (dueDateStr) => {
            const due = new Date(dueDateStr);
            const now = new Date();
            const diff = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
            return diff >= 0 ? `${diff} day(s) left` : `Overdue by ${-diff} day(s)`;
        };

        return (
            <>
                <Typography variant="h6" sx={{ mt: 4 }}>{label}</Typography>
                {todos.length === 0 ? (
                    <Typography color="textSecondary">No items</Typography>
                ) : (
                    todos.map(todo => (
                        <Card key={todo.id} sx={{ mt: 2 }}>
                            <CardContent>
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Typography variant="h6">{todo.title}</Typography>
                                    <Checkbox
                                        checked={!!todo.completed}
                                        onChange={() => handleToggleComplete(todo.id, todo.completed)}
                                        color="primary"
                                    />
                                </Box>
                                <Typography>{todo.content}</Typography>
                                <Typography variant="body2" color="textSecondary">
                                    🗓️ Next Due: {new Date(todo.next_due_date).toLocaleDateString()}
                                    &nbsp;({daysUntil(todo.next_due_date)})
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    🔁 Recurrence: {todo.recurrence_rule || 'None'}
                                </Typography>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    size="small"
                                    sx={{ mt: 1 }}
                                    onClick={() => handleDelete(todo.id)}
                                >
                                    Delete
                                </Button>
                            </CardContent>
                        </Card>
                    ))
                )}
            </>
        );
    }

    useEffect(() => {
        fetchTodos();
    }, []);

    return (
        <Container maxWidth="md">
            <Typography variant="h4" mt={4}>My Todo List</Typography>

            <Box mt={4}>
                <Typography variant="h5" gutterBottom>Add New Todo</Typography>
                <Grid container spacing={2} direction="column">
                    <Grid item xs={12}>
                        <TextField label="Title" name="title" fullWidth value={form.title} onChange={handleChange} />
                    </Grid>
                    <Grid item xs={12}>
                        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
                            <DatePicker
                                label="Due Date"
                                format="DD/MM/YYYY"
                                value={form.next_due_date ? dayjs(form.next_due_date) : null}
                                onChange={(date) =>
                                    setForm({ ...form, next_due_date: date ? date.format('YYYY-MM-DD') : '' })
                                }
                                slotProps={{ textField: { fullWidth: true } }}
                            />
                        </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Content"
                            name="content"
                            fullWidth
                            multiline
                            rows={3}
                            value={form.content}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Recurrence Rule"
                            name="recurrence_rule"
                            select
                            fullWidth
                            value={form.recurrence_rule}
                            onChange={handleChange}
                        >
                            <MenuItem value="one-time">One-time</MenuItem>
                            <MenuItem value="7d">Every 7 days</MenuItem>
                            <MenuItem value="14d">Every 14 days</MenuItem>
                            <MenuItem value="monthly">Monthly</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Remind Days Before"
                            name="reminder_days_before"
                            type="number"
                            fullWidth
                            value={form.reminder_days_before}
                            onChange={handleChange}
                        />
                    </Grid>
                </Grid>
                <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ mt: 3 }}
                    onClick={handleCreate}
                >
                    Add Todo
                </Button>
            </Box>

            <Divider sx={{ my: 4 }} />

            {todos ? (
                <>
                    {renderTodoGroup(todos.reminding, '🔔 Reminding')}
                    {renderTodoGroup(todos.upcoming, '📅 Upcoming')}
                    {renderTodoGroup(todos.overdued, '⚠️ Overdue')}
                    {renderTodoGroup(todos.completed, '✅ Completed')}
                </>
            ) : (
                <Typography>Loading...</Typography>
            )}
        </Container>
    );
}
