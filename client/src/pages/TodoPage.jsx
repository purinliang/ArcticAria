import { useEffect, useState } from 'react';
import {
    Container, Typography, Button, Divider
} from '@mui/material';
import 'dayjs/locale/en-gb'; // force dd/MM/yyyy locale
import axios from 'axios';
import TodoCard from '../components/TodoCard';
import { useNavigate } from 'react-router-dom';


const API_BASE = import.meta.env.VITE_TODO_API_BASE;

export default function TodoPage() {
    const navigate = useNavigate();

    const [todos, setTodos] = useState({
        reminding: [], upcoming: [],
        overdued: [], completed: []
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
                        <TodoCard
                            key={todo.id}
                            todo={todo}
                            onToggleComplete={handleToggleComplete}
                            onDelete={handleDelete}
                        />
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

            <Button
                variant="outlined"
                sx={{ mt: 2 }}
                onClick={() => navigate('/todos/new')}
            >
                ➕ Add New Todo
            </Button>

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
