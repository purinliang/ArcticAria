import { Routes, Route, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Button, Typography, Box, Divider, Link } from '@mui/material';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import TodoPage from './pages/TodoPage';
import TodoDetailPage from './pages/TodoDetailPage';
import BlogPage from './pages/BlogPage';
import PostEditPage from './pages/PostEditPage';
import PostDetailPage from './pages/PostDetailPage';
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
    <Box>
      <AppBar position="static" sx={{ bgcolor: 'white', color: 'black', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <Toolbar sx={{ maxWidth: '1120px', width: '100%', mx: 'auto' }}>
          {/* Logo and App Name */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <img src="/arctic_aria.svg" alt="Arctic Aria Logo" style={{ height: '32px', marginRight: '8px' }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
              <Button onClick={() => navigate('/')} color="primary" sx={{ fontWeight: 'bold', fontSize: '1.5rem', textTransform: 'none' }}>
                ArcticAria
              </Button>
            </Typography>
          </Box>

          {/* Navigation Links */}
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', ml: 4, gap: 2 }}>
            <Button onClick={() => navigate('/todos')} color="inherit" sx={{ fontWeight: 'bold', textTransform: 'none' }}>
              Todos
            </Button>
            <Button onClick={() => navigate('/blog')} color="inherit" sx={{ fontWeight: 'bold', textTransform: 'none' }}>
              Blog
            </Button>
          </Box>

          {/* Auth buttons or user info. Fixed width to prevent CLS. */}
          <Box sx={{ minWidth: '160px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1 }}>
            {isLoggedIn ? (
              <>
                <Typography variant="body1" component="span" sx={{ mr: 1, fontWeight: 'medium' }}>
                  {username}
                </Typography>
                <Button variant="contained" color="error" onClick={handleLogout} sx={{ textTransform: 'none' }}>
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Button variant="contained" color="primary" onClick={() => navigate('/login')} sx={{ textTransform: 'none' }}>
                  Sign in
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main content routes */}
      <Box component="main" sx={{ p: 3, mb: 8, maxWidth: '960px', mx: 'auto' }}>
        <Routes>
          <Route path="/" element={<TodoPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/todos" element={<TodoPage />} />
          <Route path="/todos/new" element={<TodoDetailPage />} />
          <Route path="/todos/:id" element={<TodoDetailPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/new" element={<PostEditPage />} />
          <Route path="/blog/:id" element={<PostDetailPage />} />
        </Routes>
      </Box>

      {/* Footer */}
      <Divider sx={{ mb: 1 }} />
      <Box component="footer" sx={{ p: 2, maxWidth: '1120px', mx: 'auto', textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          &copy; {new Date().getFullYear()} ArcticAria. All rights reserved.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <Link href="mailto:purinliang@gmail.com" color="inherit" sx={{ mr: 1 }}>
            Contact Us
          </Link>
          |
          <Link href="#" color="inherit" sx={{ ml: 1 }}>
            Privacy Policy
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}

export default App;
