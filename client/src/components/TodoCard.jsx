import { Card, CardContent, Typography, Checkbox, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function TodoCard({ todo, onToggleComplete, onDelete }) {
    const navigate = useNavigate();

    const daysUntil = (dueDateStr) => {
        const due = new Date(dueDateStr);
        const now = new Date();
        const diff = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
        return diff >= 0 ? `${diff} day(s) left` : `Overdue by ${-diff} day(s)`;
    };

    return (
        <Card sx={{ mt: 2, cursor: 'pointer' }} onClick={() =>
            navigate(`/todos/${todo.id}`, { state: { todo } })}>
            <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography variant="h6">{todo.title}</Typography>
                    <Checkbox
                        checked={!!todo.completed}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                            e.stopPropagation();
                            onToggleComplete(todo.id, todo.completed);
                        }}
                        color="primary"
                    />
                </Box>
                <Typography sx={{ mt: 1, mb: 2 }}>
                    {todo.content ? (
                        todo.content.split('\n').map((line, index) => (
                            <Box key={index}>
                                {line}
                            </Box>
                        ))
                    ) : (
                        <Box />
                    )}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    🗓️ Next Due: {new Date(todo.next_due_date).toLocaleDateString()}
                    &nbsp;({daysUntil(todo.next_due_date)})
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    🔁 Recurrence: {todo.recurrence_rule || 'None'}
                </Typography>
                {todo.category && (
                    <Typography variant="body2" color="textSecondary">
                        🏷️ Category: {todo.category}
                    </Typography>
                )}
            </CardContent>
        </Card >
    );
}
