import { useState } from 'react';
import { TextField, Button, Box, Typography, Container } from '@mui/material';
import axios from 'axios';

const API_BASE = '/api';

export default function RegisterPage() {
    const [form, setForm] = useState({ email: '', password: '', confirm: '' });

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleRegister = async () => {
        if (form.password !== form.confirm) {
            alert('Passwords do not match');
            return;
        }
        try {
            await axios.post(`${API_BASE}/register`, {
                email: form.email,
                password: form.password,
            });
            alert('Registered successfully!');
        } catch (err) {
            alert(`Register error: ${err.response?.data || err.message}`);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box mt={6}>
                <Typography variant="h4" gutterBottom>Register</Typography>
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
                <TextField
                    fullWidth
                    margin="normal"
                    label="Confirm Password"
                    type="password"
                    name="confirm"
                    value={form.confirm}
                    onChange={handleChange}
                />
                <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleRegister}
                    sx={{ mt: 2 }}
                >
                    Register
                </Button>
            </Box>
        </Container>
    );
}
