import { Routes, Route, Link } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import TodoPage from './pages/TodoPage';
import TodoDetailPage from './pages/TodoDetailPage';

function App() {
  return (
    <div>
      <nav style={{ padding: '1rem', background: '#eee' }}>
        <Link to="/register" style={{ marginRight: '1rem' }}>Register</Link>
        <Link to="/login" style={{ marginRight: '1rem' }}>Login</Link>
        <Link to="/todos">Todo</Link>
      </nav>

      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/todos" element={<TodoPage />} />
        <Route path="/todos/new" element={<TodoDetailPage />} />
        <Route path="/todos/:id" element={<TodoDetailPage />} />
      </Routes>
    </div>
  );
}

export default App;
