import {
    Container, Typography, TextField, Button, Grid, MenuItem, Checkbox, FormControlLabel
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_TODO_API_BASE;

export default function TodoDetailPage() {
    const { id } = useParams();
    const isEdit = !!id;
    const { state } = useLocation();
    const navigate = useNavigate();
    const token = localStorage.getItem('jwtToken');

    const [form, setForm] = useState({
        title: '',
        content: '',
        next_due_date: dayjs().format('YYYY-MM-DD'),
        recurrence_rule: 'one-time',
        reminder_days_before: 0,
        category: '',
        completed: false
    });

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const fetchTodo = async () => {
        try {
            const res = await axios.get(`${API_BASE}/todo/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setForm(res.data);
        } catch (err) {
            alert(`Failed to load todo: ${err.response?.data || err.message}`);
        }
    };

    const handleSave = async () => {
        try {
            const payload = { ...form };
            if (isEdit) {
                await axios.put(`${API_BASE}/todo/${id}`, payload, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            } else {
                await axios.post(`${API_BASE}/todo`, payload, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            }
            navigate('/todos');
        } catch (err) {
            alert(`Save failed: ${err.response?.data || err.message}`);
        }
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`${API_BASE}/todo/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate('/todos');
        } catch (err) {
            alert('Delete failed');
        }
    };

    const toggleCompleted = async () => {
        try {
            await axios.put(`${API_BASE}/todo/${id}`, {
                completed: !form.completed
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setForm(prev => ({ ...prev, completed: !prev.completed }));
        } catch (err) {
            alert('Failed to update status');
        }
    };

    useEffect(() => {
        if (isEdit) {
            if (state?.todo) {
                setForm(state.todo);
            } else {
                fetchTodo(); // fallback
            }
        }
    }, [id, state]);

    return (
        <Container maxWidth="sm">
            <Typography variant="h4" mt={4}>
                {isEdit ? 'Edit Todo' : 'Add New Todo'}
            </Typography>
            <Grid container spacing={2} mt={1} direction="column">
                <Grid item xs={12}>
                    <TextField label="Title" name="title" fullWidth value={form.title} onChange={handleChange} />
                </Grid>
                <Grid item xs={12}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
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
                        label="Category"
                        name="category"
                        fullWidth
                        value={form.category}
                        onChange={handleChange}
                    />
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
                <Grid item xs={12}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={!!form.completed}
                                onChange={toggleCompleted}
                                color="primary"
                            />
                        }
                        label="Mark as Completed"
                    />
                </Grid>
                <Grid item xs={6}>
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={handleSave}
                    >
                        {isEdit ? 'Save Changes' : 'Create Todo'}
                    </Button>
                </Grid>
                {isEdit && (
                    <Grid item xs={6}>
                        <Button
                            variant="outlined"
                            color="error"
                            fullWidth
                            onClick={handleDelete}
                        >
                            Delete
                        </Button>
                    </Grid>
                )}
            </Grid>
        </Container>
    );
}
