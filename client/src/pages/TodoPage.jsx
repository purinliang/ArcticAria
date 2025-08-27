import { useEffect, useState } from 'react';
import {
    Container, Typography, Button, Divider, Alert, Box
} from '@mui/material';
import { red } from '@mui/material/colors';
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
    // Add a new state variable for displaying errors
    const [error, setError] = useState('');

    /**
     * Fetches the user's todos from the API.
     * If the JWT token is invalid, it redirects the user to the login page.
     */
    const fetchTodos = async () => {
        // Clear any previous error messages
        setError('');
        const token = localStorage.getItem('jwtToken');
        if (!token) {
            // If there's no token, a red message will be displayed, and after 3 seconds,
            // the user will be redirected to the login page.
            setError('You are not logged in. Please log in first...');
            // setTimeout(() => navigate('/login'), 3000);
            return;
        }
        try {
            const res = await axios.get(`${API_BASE}/todo`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTodos(res.data);
        } catch (err) {
            console.error('Failed to fetch todos:', err);
            // Check for a 401 Unauthorized status code
            if (err.response && err.response.status === 401) {
                // Clear the invalid token from localStorage
                localStorage.removeItem('jwtToken');
                // Display a red message, then redirect to the login page
                setError('Session expired or unauthorized. Please log in again.');
                setTimeout(() => navigate('/login'), 3000);
            } else {
                // Handle other types of errors
                setError(`Failed to fetch todos: ${err.response?.data || err.message}`);
            }
        }
    };

    /**
     * Toggles the completion status of a todo.
     * @param {string} id The ID of the todo.
     * @param {boolean} currentStatus The current completion status.
     */
    const handleToggleComplete = async (id, currentStatus) => {
        setError('');
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
            fetchTodos(); // Call fetchTodos to update the list immediately
        } catch (err) {
            console.error('Failed to update todo:', err);
            setError('Failed to update todo.');
        }
    };

    /**
     * Deletes a todo.
     * @param {string} id The ID of the todo.
     */
    const handleDelete = async (id) => {
        setError('');
        try {
            const token = localStorage.getItem('jwtToken');
            console.log(`DELETE ${import.meta.env.VITE_TODO_API_BASE}/todo/${id}`);
            await axios.delete(`${import.meta.env.VITE_TODO_API_BASE}/todo/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            fetchTodos(); // Call fetchTodos to update the list immediately
        } catch (err) {
            console.error('Failed to delete todo:', err);
            setError('Failed to delete todo.');
        }
    };

    /**
     * Calculates the days until a due date.
     * @param {string} dueDateStr The due date string.
     * @returns {string} The formatted string showing days left or overdue.
     */
    const daysUntil = (dueDateStr) => {
        const due = new Date(dueDateStr);
        const now = new Date();
        const diff = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
        return diff >= 0 ? `${diff} day(s) left` : `Overdue by ${-diff} day(s)`;
    };

    /**
     * Renders a group of todos with a label.
     * @param {Array<object>} todoItems The array of todos to render.
     * @param {string} label The label for the group.
     */
    function renderTodoGroup(todoItems, label) {
        if (!todoItems || !Array.isArray(todoItems)) return null;

        return (
            <Box sx={{ my: 2 }}>
                <Typography variant="h6" sx={{ mt: 4, mb: 1, fontWeight: 'bold' }}>
                    {label}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {todoItems.length === 0 ? (
                    <Typography color="textSecondary" sx={{ fontStyle: 'italic' }}>
                        No items in this group.
                    </Typography>
                ) : (
                    todoItems.map(todo => (
                        <TodoCard
                            key={todo.id}
                            todo={todo}
                            onToggleComplete={() => handleToggleComplete(todo.id, todo.completed)}
                            onDelete={() => handleDelete(todo.id)}
                        />
                    ))
                )}
            </Box>
        );
    }

    // Fetch todos on component mount
    useEffect(() => {
        fetchTodos();
    }, []); // Empty dependency array means this runs only once

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4, p: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                My Todo List
            </Typography>

            {/* Conditionally render the error message with Alert component */}
            {error && (
                <Alert
                    severity="error"
                    sx={{
                        width: '100%',
                        mt: 2,
                        mb: 2,
                        borderRadius: '8px',
                        backgroundColor: red[50]
                    }}
                >
                    {error}
                </Alert>
            )}

            <Button
                variant="contained"
                color="primary"
                sx={{ mt: 3, mb: 2, py: 1.5, borderRadius: '8px' }}
                onClick={() => navigate('/todos/new')}
            >
                ➕ Add New Todo
            </Button>

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
