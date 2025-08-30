import {
  Container,
  Typography,
  Button,
  Divider,
  Alert,
  Box,
} from "@mui/material";
import { red } from "@mui/material/colors";
import axios from "axios";
import TodoCard from "../components/TodoCard";
import { useNavigate } from "react-router-dom";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import { useEffect, useState } from "react";
import { Masonry } from "@mui/lab";
import WarningIcon from "@mui/icons-material/Warning";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import StarsIcon from "@mui/icons-material/Stars";
import FormControlLabel from "@mui/material/FormControlLabel";
import Tooltip from "@mui/material/Tooltip";
import Switch from "@mui/material/Switch";

const API_BASE = import.meta.env.VITE_TODO_API_BASE;

// Helper function to sort todos by due date
const sortTodosByDate = (todos) => {
  return [...todos].sort((a, b) => {
    // Handle cases where due_date is null or undefined
    if (!a.nextDueDate && !b.nextDueDate) return 0;
    if (!a.nextDueDate) return 1;
    if (!b.nextDueDate) return -1;
    return new Date(a.nextDueDate) - new Date(b.nextDueDate);
  });
};

export default function TodoPage() {
  const navigate = useNavigate();

  const [todos, setTodos] = useState([]);
  const [error, setError] = useState("");
  const [groupedTodos, setGroupedTodos] = useState({
    reminding: [],
    upcoming: [],
    overdued: [],
    completed: [],
  });
  // State to manage the sorting preference: true for category, false for time
  const [sortByCategory, setSortByCategory] = useState(true);

  /**
   * Fetches the user's todos from the API.
   * If the JWT token is invalid, it redirects the user to the login page.
   */
  const fetchTodos = async () => {
    setError("");
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      setError("You are not logged in. Please log in first...");
      return;
    }
    try {
      const res = await axios.get(`${API_BASE}/todo`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTodos(res.data);
    } catch (err) {
      console.error("Failed to fetch todos:", err);
      if (err.response && err.response.status === 401) {
        localStorage.removeItem("jwtToken");
        setError("Session expired or unauthorized. Please log in again.");
        setTimeout(() => navigate("/login"), 3000);
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
    setError("");
    try {
      const token = localStorage.getItem("jwtToken");
      await axios.put(
        `${import.meta.env.VITE_TODO_API_BASE}/todo/${id}`,
        {
          completed: !currentStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      fetchTodos();
    } catch (err) {
      console.error("Failed to update todo:", err);
      setError("Failed to update todo.");
    }
  };

  const handleSortChange = (event) => {
    setSortByCategory(event.target.checked);
  };

  useEffect(() => {
    // Ensure todos is a valid array before proceeding
    if (!Array.isArray(todos) || todos.length === 0) {
      setGroupedTodos({
        reminding: [],
        upcoming: [],
        overdued: [],
        completed: [],
      });
      return;
    }

    const reminding = [];
    const upcoming = [];
    const overdued = [];
    const completed = [];
    const now = new Date();

    todos.forEach((todo) => {
      if (todo.completed) {
        completed.push(todo);
      } else {
        // Determine due and remind dates for sorting
        const dueDate = todo.nextDueDate ? new Date(todo.nextDueDate) : null;
        const remindDate = dueDate ? new Date(dueDate) : null;
        if (remindDate) {
          remindDate.setDate(
            remindDate.getDate() - (todo.reminderDaysBefore || 0),
          );
        }

        // Get the start of the current day to compare dates correctly
        const startOfToday = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
        );

        // Classify todos based on dates
        if (
          remindDate &&
          startOfToday.getTime() >= remindDate.getTime() &&
          startOfToday.getTime() <= dueDate.getTime()
        ) {
          reminding.push(todo);
        } else if (dueDate && startOfToday.getTime() > dueDate.getTime()) {
          overdued.push(todo);
        } else {
          upcoming.push(todo);
        }
      }
    });

    const sortedGroups = {
      overdued: sortTodosByDate(overdued),
      reminding: sortTodosByDate(reminding),
      upcoming: sortTodosByDate(upcoming),
      completed: sortTodosByDate(completed),
    };

    console.log("Grouped todos:", sortedGroups);
    setGroupedTodos(sortedGroups);
  }, [todos, sortTodosByDate]);

  /**
   * Renders a group of todos with a label in a single list.
   * @param {Array<object>} todoItems The array of todos to render.
   * @param {string} label The label for the group.
   * @param {React.ReactElement} icon The Material-UI icon for the label.
   */
  const renderTodoGroup = (todoItems, label, icon) => {
    if (!todoItems || !Array.isArray(todoItems)) return null;
    if (todoItems.length === 0) return null;

    return (
      <Box key={label} sx={{ my: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", mt: 4, mb: 1 }}>
          {icon && (
            <Box component="span" sx={{ mr: 0.5, mt: 0.5, fontSize: "1.2rem" }}>
              {icon}
            </Box>
          )}
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            {label}
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Masonry columns={{ xs: 1, sm: 2, md: 3, lg: 4 }} spacing={2}>
          {todoItems.map((todo) => (
            <TodoCard
              key={todo.id}
              todo={todo}
              onToggleComplete={() =>
                handleToggleComplete(todo.id, todo.completed)
              }
            />
          ))}
        </Masonry>
      </Box>
    );
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const allGroupsEmpty = Object.values(groupedTodos).every(
    (group) => group.length === 0,
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, p: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            component="h1"
            sx={{ fontWeight: "bold", color: "primary.main", mb: 1 }}
          >
            My Todo List
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage your tasks and stay on top of your schedule.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
              onClick={() => navigate("/todos/new")}
              sx={{ minWidth: "auto", p: 1, borderRadius: "50%" }}
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
            width: "100%",
            mt: 2,
            mb: 2,
            borderRadius: "8px",
            backgroundColor: red[50],
          }}
        >
          {error}
        </Alert>
      )}

      {todos.length > 0 ? (
        <>
          {renderTodoGroup(
            groupedTodos.overdued,
            "Overdue",
            <WarningIcon color="error" />,
          )}
          {renderTodoGroup(
            groupedTodos.reminding,
            "Reminding",
            <NotificationsActiveIcon color="info" />,
          )}
          {renderTodoGroup(
            groupedTodos.upcoming,
            "Upcoming",
            <CalendarTodayIcon sx={{ color: "info" }} />,
          )}
          {renderTodoGroup(
            groupedTodos.completed,
            "Completed",
            <CheckCircleOutlineIcon color="success" />,
          )}
          {allGroupsEmpty && (
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ mt: 4 }}
            >
              All caught up!{" "}
              <StarsIcon color="secondary" sx={{ verticalAlign: "middle" }} />
            </Typography>
          )}
        </>
      ) : (
        <Typography>Loading...</Typography>
      )}
    </Container>
  );
}
