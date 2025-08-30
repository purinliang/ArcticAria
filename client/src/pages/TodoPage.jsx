import { useEffect, useState, useMemo } from 'react';
import {
    Container, Typography, Button, Divider, Alert, Box, Switch, FormControlLabel,
    Tooltip,
} from '@mui/material';
import { red } from '@mui/material/colors';
import axios from 'axios';
import TodoCard from '../components/TodoCard';
import { useNavigate } from 'react-router-dom';
import ConfirmationDialog from '../components/ConfirmationDialog';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import { Masonry } from '@mui/lab';

const API_BASE = import.meta.env.VITE_TODO_API_BASE;

// Helper function to sort todos by due date
const sortTodosByDate = (todos) => {
    return [...todos].sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
};

export default function TodoPage() {
    const navigate = useNavigate();

    const [todos, setTodos] = useState({
        reminding: [], upcoming: [],
        overdued: [], completed: []
    });
    const [error, setError] = useState('');
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [todoToDeleteId, setTodoToDeleteId] = useState(null);
    // State to manage the sorting preference: true for category, false for time
    const [sortByCategory, setSortByCategory] = useState(true);

    /**
     * Fetches the user's todos from the API.
     * If the JWT token is invalid, it redirects the user to the login page.
     */
    const fetchTodos = async () => {
        setError('');
        const token = localStorage.getItem('jwtToken');
        if (!token) {
            setError('You are not logged in. Please log in first...');
            return;
        }
        try {
            const res = await axios.get(`${API_BASE}/todo`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTodos(res.data);
        } catch (err) {
            console.error('Failed to fetch todos:', err);
            if (err.response && err.response.status === 401) {
                localStorage.removeItem('jwtToken');
                setError('Session expired or unauthorized. Please log in again.');
                setTimeout(() => navigate('/login'), 3000);
            } else {
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
            await axios.put(`${import.meta.env.VITE_TODO_API_BASE}/todo/${id}`, {
                completed: !currentStatus
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            fetchTodos();
        } catch (err) {
            console.error('Failed to update todo:', err);
            setError('Failed to update todo.');
        }
    };

    /**
     * Handles the delete button click by opening the confirmation dialog.
     * @param {string} id The ID of the todo to be deleted.
     */
    const handleDelete = (id) => {
        setTodoToDeleteId(id);
        setIsDeleteDialogOpen(true);
    };

    /**
     * Closes the confirmation dialog and resets the state.
     */
    const handleCloseDeleteDialog = () => {
        setIsDeleteDialogOpen(false);
        setTodoToDeleteId(null);
    };

    /**
     * Executes the actual deletion after user confirmation.
     */
    const handleConfirmDelete = async () => {
        if (!todoToDeleteId) {
            handleCloseDeleteDialog();
            return;
        }

        setError('');
        try {
            const token = localStorage.getItem('jwtToken');
            await axios.delete(`${API_BASE}/todo/${todoToDeleteId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchTodos();
        } catch (err) {
            console.error('Failed to delete todo:', err);
            if (err.response && err.response.status === 401) {
                localStorage.removeItem('jwtToken');
                setError('Session expired or unauthorized. Please log in again.');
                setTimeout(() => navigate('/login'), 3000);
            } else {
                setError('Failed to delete todo.');
            }
        } finally {
            handleCloseDeleteDialog();
        }
    };

    const handleSortChange = (event) => {
        setSortByCategory(event.target.checked);
    };

    const groupedTodos = useMemo(() => {
        const allTodos = Object.values(todos).flat();
        if (sortByCategory) {
            const groups = {
                reminding: todos.reminding,
                upcoming: todos.upcoming,
                overdued: todos.overdued,
                completed: todos.completed
            };
            return groups;
        } else {
            const sorted = sortTodosByDate(allTodos);
            const groups = {
                overdued: sorted.filter(t => t.due_date && new Date(t.due_date) < new Date() && !t.completed),
                reminding: sorted.filter(t => t.remind_me_at && !t.completed),
                upcoming: sorted.filter(t => t.due_date && new Date(t.due_date) >= new Date() && !t.completed),
                completed: sorted.filter(t => t.completed),
            };
            return groups;
        }
    }, [todos, sortByCategory]);

    /**
     * Renders a group of todos with a label in a single list.
     * @param {Array<object>} todoItems The array of todos to render.
     * @param {string} label The label for the group.
     */
    const renderTodoGroup = (todoItems, label) => {
        if (!todoItems || !Array.isArray(todoItems)) return null;
        if (todoItems.length === 0) return null;

        return (
            <Box key={label} sx={{ my: 2 }}>
                <Typography variant="h6" sx={{ mt: 4, mb: 1, fontWeight: 'bold' }}>
                    {label}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Masonry columns={{ xs: 1, sm: 2 }} spacing={2}>
                    {todoItems.map(todo => (
                        <TodoCard
                            key={todo.id}
                            todo={todo}
                            onToggleComplete={() => handleToggleComplete(todo.id, todo.completed)}
                            onDelete={() => handleDelete(todo.id)}
                        />
                    ))}
                </Masonry>
            </Box>
        );
    };

    useEffect(() => {
        fetchTodos();
    }, []);

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4, p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box>
                    <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
                        My Todo List 📝
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        Manage your tasks and stay on top of your schedule.
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={sortByCategory}
                                onChange={handleSortChange}
                                name="sortBySwitch"
                                color="primary"
                            />
                        }
                        label={sortByCategory ? "Sort by Category" : "Sort by Time"}
                        sx={{ mr: 1 }}
                    />
                    <Tooltip title="Add New Todo">
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => navigate('/todos/new')}
                            sx={{ minWidth: 'auto', p: 1, borderRadius: '50%' }}
                        >
                            <PlaylistAddIcon sx={{ fontSize: 24 }} />
                        </Button>
                    </Tooltip>
                </Box>
            </Box>

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

            {todos ? (
                <>
                    {renderTodoGroup(groupedTodos.overdued, '⚠️ Overdue')}
                    {renderTodoGroup(groupedTodos.reminding, '🔔 Reminding')}
                    {renderTodoGroup(groupedTodos.upcoming, '📅 Upcoming')}
                    {renderTodoGroup(groupedTodos.completed, '✅ Completed')}
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>
                        All caught up! ✨
                    </Typography>
                </>
            ) : (
                <Typography>Loading...</Typography>
            )}

            <ConfirmationDialog
                open={isDeleteDialogOpen}
                onClose={handleCloseDeleteDialog}
                onConfirm={handleConfirmDelete}
                title="Confirm Deletion"
                contentText="This action is permanent. Are you sure you want to delete this todo?"
                confirmText="Delete"
                cancelText="Cancel"
            />
        </Container>
    );
}