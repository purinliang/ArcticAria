import { useState } from 'react';
import { TextField, Button, Box, Typography, Container, Alert } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { red } from '@mui/material/colors';

const API_BASE = import.meta.env.VITE_AUTH_API_BASE;

export default function LoginPage() {
    const [form, setForm] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(''); // Added success state
    const navigate = useNavigate();

    /**
     * Handles changes in the form input fields.
     * @param {React.ChangeEvent<HTMLInputElement>} e The change event from the input.
     */
    const handleChange = e => {
        setError('');
        setSuccess(''); // Clear success message on input change
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    /**
     * Handles the login button click.
     * Sends a POST request to the login endpoint and handles the response.
     */
    const handleLogin = async () => {
        setError('');
        setSuccess('');

        try {
            console.log(`POST ${API_BASE}/login`);
            const res = await axios.post(`${API_BASE}/login`, form);

            // Store the JWT token upon successful login
            localStorage.setItem('jwtToken', res.data.token);

            setSuccess('Login successful! Redirecting to todos page...'); // Set success message
            // Navigate to the todos page after a delay
            setTimeout(() => navigate('/todos'), 2000);

        } catch (err) {
            console.log(`Login error: ${err}`);
            // Check if the error has a response and data to get a more specific message
            const errorMessage = err.response?.data || err.message;
            // Instead of an alert, set the error state to display the message
            setError(`Login failed: ${errorMessage}`);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box
                mt={6}
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
                    Welcome Back
                </Typography>
                <Typography variant="subtitle1" gutterBottom sx={{ color: 'text.secondary' }}>
                    Please log in to continue.
                </Typography>

                {/* Conditionally render the success message */}
                {success && (
                    <Alert severity="success" sx={{ width: '100%', mb: 2, borderRadius: '8px' }}>
                        {success}
                    </Alert>
                )}

                {/* Conditionally render the error message if the `error` state is not empty */}
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
                    // Use "current-password" for login forms
                    autoComplete="current-password"
                />
                <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleLogin}
                    sx={{ mt: 3, py: 1.5, borderRadius: '8px' }}
                >
                    Login
                </Button>
                <Box textAlign="center" sx={{ mt: 2, width: '100%' }}>
                    <Typography variant="body2" color="textSecondary">
                        Don't have an account? <Button onClick={() => navigate('/register')}>Register</Button>
                    </Typography>
                </Box>
            </Box>
        </Container>
    );
}
