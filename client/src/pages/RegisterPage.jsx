import { useState } from 'react';
import { TextField, Button, Box, Typography, Container, Alert } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { red } from '@mui/material/colors';

const API_BASE = import.meta.env.VITE_AUTH_API_BASE;

export default function RegisterPage() {
    const [form, setForm] = useState({ username: '', password: '', confirm: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    /**
     * Handles form input changes.
     * @param {Event} e The event object.
     */
    const handleChange = e => {
        setError('');
        setSuccess('');
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    /**
     * Handles the registration process.
     */
    const handleRegister = async () => {
        setError('');
        setSuccess('');

        if (form.password !== form.confirm) {
            setError('Passwords do not match.');
            return;
        }

        try {
            console.log(`POST ${API_BASE}/register`);
            await axios.post(`${API_BASE}/register`, {
                username: form.username,
                password: form.password,
            });
            setSuccess('Registered successfully! Redirecting to login page...');
            // Automatically navigate to login page after a delay
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            console.error('Register error:', err);
            setError(`Register error: ${err.response?.data || err.message}`);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box
                mt={6}
                mb={2}
                p={4}
                sx={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}
            >
                <Typography variant="h4" gutterBottom component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    Sign up
                </Typography>
                <Typography variant="subtitle1" gutterBottom sx={{ color: 'text.secondary' }}>
                    Create an account to get started.
                </Typography>

                {/* Display success and error alerts */}
                {success && (
                    <Alert severity="success" sx={{ width: '100%', mb: 2, borderRadius: '8px' }}>
                        {success}
                    </Alert>
                )}
                {error && (
                    <Alert severity="error" sx={{ width: '100%', mb: 2, borderRadius: '8px', backgroundColor: red[50] }}>
                        {error}
                    </Alert>
                )}

                <TextField
                    fullWidth
                    margin="normal"
                    label="Username"
                    name="username"
                    type="text"
                    value={form.username}
                    onChange={handleChange}
                    required
                    // Add autocomplete for better browser support
                    autoComplete="username"
                />
                <TextField
                    fullWidth
                    margin="normal"
                    label="Password"
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    // Add autocomplete for better browser support
                    autoComplete="new-password"
                />
                <TextField
                    fullWidth
                    margin="normal"
                    label="Confirm Password"
                    type="password"
                    name="confirm"
                    value={form.confirm}
                    onChange={handleChange}
                    required
                    // Add autocomplete for better browser support
                    autoComplete="new-password"
                />
                <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleRegister}
                    sx={{ mt: 3, py: 1.5, borderRadius: '8px' }}
                >
                    Register
                </Button>
                <Box textAlign="center" sx={{ mt: 2, width: '100%' }}>
                    <Typography variant="body2" color="textSecondary">
                        Already have an account? <Button onClick={() => navigate('/login')}>Sign in
                        </Button>
                    </Typography>
                </Box>
            </Box>
        </Container>
    );
}
