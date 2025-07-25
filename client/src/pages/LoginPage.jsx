import { useState } from 'react';
import { TextField, Button, Box, Typography, Container } from '@mui/material';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE;

export default function LoginPage() {
    const [form, setForm] = useState({ email: '', password: '' });

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleLogin = async () => {
        try {
            const res = await axios.post(`${API_BASE}/login`, form);
            console.log('🔑 JWT Token:', res.data.token);
            alert('Login successful! Token in console.');
        } catch (err) {
            alert(`Login error: ${err.response?.data || err.message}`);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box mt={6}>
                <Typography variant="h4" gutterBottom>Login</Typography>
                <TextField
                    fullWidth
                    margin="normal"
                    label="Email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                />
                <TextField
                    fullWidth
                    margin="normal"
                    label="Password"
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                />
                <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleLogin}
                    sx={{ mt: 2 }}
                >
                    Login
                </Button>
            </Box>
        </Container>
    );
}
