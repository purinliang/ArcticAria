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
import Tooltip from "@mui/material/Tooltip";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import useSWR from "swr";
import WorkIcon from "@mui/icons-material/Work";
import BookIcon from "@mui/icons-material/Book";
import HomeIcon from "@mui/icons-material/Home";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import CategoryIcon from "@mui/icons-material/Category";
import { useTranslation } from "react-i18next";

const API_BASE = import.meta.env.VITE_TODO_API_BASE;

// Define the categories and their corresponding icons for sorting
const CATEGORY_GROUPS = [
  { key: "Work", icon: <WorkIcon color="primary" /> },
  { key: "Study", icon: <BookIcon color="info" /> },
  { key: "Life", icon: <HomeIcon color="action" /> },
  { key: "Play", icon: <SportsEsportsIcon color="secondary" /> },
  { key: "Other", icon: <CategoryIcon /> },
];

// Helper function to sort todos by due date
const sortTodosByDate = (todos) => {
  return [...todos].sort((a, b) => {
    // Handle cases where nextDueDate is null or undefined
    if (!a.nextDueDate && !b.nextDueDate) return 0;
    if (!a.nextDueDate) return 1;
    if (!b.nextDueDate) return -1;
    return new Date(a.nextDueDate) - new Date(b.nextDueDate);
  });
};

// Helper function to group todos by category
const groupTodosByCategory = (todos) => {
  const grouped = {};
  CATEGORY_GROUPS.forEach((group) => (grouped[group.key] = []));

  todos.forEach((todo) => {
    // If the category exists in our defined groups, add it there.
    // Otherwise, it falls into the 'Other' category.
    const categoryGroup = CATEGORY_GROUPS.find(
      (group) => group.key.toLowerCase() === todo.category.toLowerCase(),
    );
    const categoryKey = categoryGroup ? categoryGroup.key : "Other";
    grouped[categoryKey].push(todo);
  });
  return grouped;
};

// SWR fetcher function with authentication headers
const fetcher = async (url) => {
  const token = localStorage.getItem("jwtToken");
  if (!token) {
    // If no token, throw an error to trigger SWR's error state
    const error = new Error("Not authenticated");
    error.status = 401;
    throw error;
  }
  const res = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export default function TodoPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [sortByCategory, setSortByCategory] = useState(() => {
    try {
      const storedSort = localStorage.getItem("sortByCategory");
      return storedSort !== null ? JSON.parse(storedSort) : false;
    } catch (e) {
      console.error("Failed to load sort preference from localStorage", e);
      return false;
    }
  });

  // Use useEffect to save the sort state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("sortByCategory", JSON.stringify(sortByCategory));
    } catch (e) {
      console.error("Failed to save sort preference to localStorage", e);
    }
  }, [sortByCategory]);

  // Use useSWR to fetch and manage todos data
  const {
    data: todos,
    error: swrError,
    isLoading,
    mutate, // The mutate function is crucial for revalidation
  } = useSWR(`${API_BASE}/todo`, fetcher, {
    dedupingInterval: 1000, // cache for 1 seconds
    revalidateOnFocus: false, // Prevents re-fetching on window focus
    revalidateOnReconnect: false, // Prevents re-fetching on network reconnect
  });

  // Handle authentication errors
  useEffect(() => {
    if (swrError && swrError.status === 401) {
      localStorage.removeItem("jwtToken");
    }
  }, [swrError, navigate]);

  /**
   * Toggles the completion status of a todo.
   * We'll use mutate() to re-fetch and update the data after a successful change.
   */
  const handleToggleComplete = async (id, currentStatus) => {
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
      // Re-fetch data after a successful update to show the latest state
      mutate();
    } catch (err) {
      console.error("Failed to update todo:", err);
      // Optionally handle specific errors here
    }
  };

  const handleSortChange = (event) => {
    setSortByCategory(event.target.checked);
  };

  // Group and sort todos based on the fetched data
  const groupedTodosByTime = (() => {
    if (!todos || !Array.isArray(todos)) {
      return {
        reminding: [],
        upcoming: [],
        overdued: [],
        completed: [],
      };
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
        const dueDate = todo.nextDueDate ? new Date(todo.nextDueDate) : null;
        const remindDate = dueDate ? new Date(dueDate) : null;
        if (remindDate) {
          remindDate.setDate(
            remindDate.getDate() - (todo.reminderDaysBefore || 0),
          );
        }

        const startOfToday = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
        );

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

    return {
      overdued: sortTodosByDate(overdued),
      reminding: sortTodosByDate(reminding),
      upcoming: sortTodosByDate(upcoming),
      completed: sortTodosByDate(completed),
    };
  })();

  const groupedTodosByCategory = groupTodosByCategory(todos || []);

  const renderTodoGroup = (todoItems, labelKey, icon) => {
    if (!todoItems || !Array.isArray(todoItems) || todoItems.length === 0)
      return null;

    return (
      <Box key={labelKey} sx={{ my: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", mt: 4, mb: 1 }}>
          {icon && (
            <Box component="span" sx={{ mr: 0.5, mt: 0.5, fontSize: "1.2rem" }}>
              {icon}
            </Box>
          )}
          <Typography sx={{ fontWeight: "bold" }}>{t(labelKey)}</Typography>
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

  const allGroupsEmpty =
    Object.values(groupedTodosByTime).every((group) => group.length === 0) &&
    Object.values(groupedTodosByCategory).every((group) => group.length === 0);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, p: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <Box
          sx={{
            textAlign: "left",
            mb: { xs: 2, sm: 0 },
            alignSelf: { xs: "flex-start", sm: "auto" },
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            sx={{ fontWeight: "bold", color: "primary.main", mb: 1 }}
          >
            {t("page.todos.title")}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {t("page.todos.subtitle")}
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            justifyContent: "flex-end",
            width: { xs: "100%", sm: "auto" },
          }}
        >
          <Box
            sx={{
              minWidth: "200px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Tooltip
              title={
                sortByCategory
                  ? t("page.todos.tooltips.switchToTime")
                  : t("page.todos.tooltips.switchToCategory")
              }
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={sortByCategory}
                    onChange={handleSortChange}
                    name="sortBySwitch"
                    color="primary"
                  />
                }
                label={
                  sortByCategory
                    ? t("page.todos.labels.sortByCategory")
                    : t("page.todos.labels.sortByTime")
                }
              />
            </Tooltip>
          </Box>
          <Tooltip title={t("page.todos.tooltips.addNew")}>
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
      {swrError && (
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
          {swrError.status === 401
            ? t("errors.sessionExpired")
            : t("errors.fetchTodos", { message: swrError.message })}
        </Alert>
      )}
      {isLoading ? (
        <Typography sx={{ mt: 4 }} align="center">
          {t("common.loading")}
        </Typography>
      ) : (
        <>
          {allGroupsEmpty ? (
            <Typography
              color="text.secondary"
              align="center"
              sx={{ mt: 8, mb: 4 }}
            >
              {t("page.todos.empty")}
            </Typography>
          ) : (
            <>
              {sortByCategory ? (
                // Render groups by category
                CATEGORY_GROUPS.map((group) =>
                  renderTodoGroup(
                    groupedTodosByCategory[group.key],
                    `categories.${group.key.toLowerCase()}`,
                    group.icon,
                  ),
                )
              ) : (
                // Render groups by time (default)
                <>
                  {renderTodoGroup(
                    groupedTodosByTime.overdued,
                    "todoGroups.overdue",
                    <WarningIcon color="error" />,
                  )}
                  {renderTodoGroup(
                    groupedTodosByTime.reminding,
                    "todoGroups.reminding",
                    <NotificationsActiveIcon color="info" />,
                  )}
                  {renderTodoGroup(
                    groupedTodosByTime.upcoming,
                    "todoGroups.upcoming",
                    <CalendarTodayIcon sx={{ color: "info" }} />,
                  )}
                  {renderTodoGroup(
                    groupedTodosByTime.completed,
                    "todoGroups.completed",
                    <CheckCircleOutlineIcon color="success" />,
                  )}
                </>
              )}
            </>
          )}
        </>
      )}
    </Container>
  );
}
