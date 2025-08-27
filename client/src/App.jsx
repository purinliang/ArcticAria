import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { AppBar, Toolbar, Button, Typography, Box } from '@mui/material';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import TodoPage from './pages/TodoPage';
import TodoDetailPage from './pages/TodoDetailPage';
import BlogPage from './pages/BlogPage';
import { useAuth } from './AuthContext';

function App() {
  const { isLoggedIn, username, logout } = useAuth();
  const navigate = useNavigate();

  /**
   * Handles the logout action.
   * Clears the JWT token from local storage and navigates to the login page.
   */
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ bgcolor: 'white', color: 'black', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <Toolbar sx={{ maxWidth: '1280px', width: '100%', mx: 'auto' }}>
          {/* Logo/App Name */}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            <Button onClick={() => navigate('/')} color="inherit" sx={{ fontWeight: 'bold', fontSize: '1.25rem' }}>
              Arctic Aria
            </Button>
          </Typography>

          {/* Navigation Links */}
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button onClick={() => navigate('/todos')} color="inherit">
              Todos
            </Button>
            <Button onClick={() => navigate('/blog')} color="inherit">
              Blog
            </Button>
          </Box>

          {/* Auth buttons or user info */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isLoggedIn ? (
              <>
                <Typography variant="body1" component="span" sx={{ mr: 1, fontWeight: 'medium' }}>
                  {username}
                </Typography>
                <Button variant="contained" color="error" onClick={handleLogout}>
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Button variant="contained" color="primary" onClick={() => navigate('/login')}>
                  Sign in
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main content routes */}
      <Box component="main" sx={{ p: 3, maxWidth: '1280px', mx: 'auto' }}>
        <Routes>
          <Route path="/" element={<TodoPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/todos" element={<TodoPage />} />
          <Route path="/todos/new" element={<TodoDetailPage />} />
          <Route path="/todos/:id" element={<TodoDetailPage />} />
          <Route path="/blog" element={<BlogPage />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;
