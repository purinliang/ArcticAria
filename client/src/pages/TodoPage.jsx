import {
  Container,
  Typography,
  Button,
  Divider,
  Alert,
  Box
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

// Category keys mapped to icons. Labels will be translated via i18n.
const CATEGORY_GROUPS = [
  { key: "Work", icon: <WorkIcon color="primary" /> },
  { key: "Study", icon: <BookIcon color="info" /> },
  { key: "Life", icon: <HomeIcon color="action" /> },
  { key: "Play", icon: <SportsEsportsIcon color="secondary" /> },
  { key: "Other", icon: <CategoryIcon /> }
];

// Helper: sort by due date
const sortTodosByDate = (todos) =>
  [...todos].sort((a, b) => {
    if (!a.nextDueDate && !b.nextDueDate) return 0;
    if (!a.nextDueDate) return 1;
    if (!b.nextDueDate) return -1;
    return new Date(a.nextDueDate) - new Date(b.nextDueDate);
  });

// Group by category (falls back to "Other")
const groupTodosByCategory = (todos) => {
  const grouped = {};
  CATEGORY_GROUPS.forEach((g) => (grouped[g.key] = []));
  todos.forEach((todo) => {
    const exists = CATEGORY_GROUPS.find((g) => g.key === todo.category);
    const key = exists ? todo.category : "Other";
    grouped[key].push(todo);
  });
  return grouped;
};

// SWR fetcher with auth
const fetcher = async (url) => {
  const token = localStorage.getItem("jwtToken");
  if (!token) {
    const error = new Error("Not authenticated");
    error.status = 401;
    throw error;
  }
  const res = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` }
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
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("sortByCategory", JSON.stringify(sortByCategory));
    } catch {}
  }, [sortByCategory]);

  const {
    data: todos,
    error: swrError,
    isLoading,
    mutate
  } = useSWR(`${API_BASE}/todo`, fetcher, {
    dedupingInterval: 1000,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  useEffect(() => {
    if (swrError && swrError.status === 401) {
      localStorage.removeItem("jwtToken");
    }
  }, [swrError, navigate]);

  const handleToggleComplete = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem("jwtToken");
      await axios.put(
        `${import.meta.env.VITE_TODO_API_BASE}/todo/${id}`,
        { completed: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      mutate();
    } catch (err) {
      // Optionally show a toast here with t('errors.updateTodo')
      // console.error(err);
    }
  };

  const handleSortChange = (event) => setSortByCategory(event.target.checked);

  // Group by time windows
  const groupedTodosByTime = (() => {
    if (!todos || !Array.isArray(todos)) {
      return { reminding: [], upcoming: [], overdued: [], completed: [] };
    }
    const reminding = [];
    const upcoming = [];
    const overdued = [];
    const completed = [];
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    todos.forEach((todo) => {
      if (todo.completed) {
        completed.push(todo);
        return;
      }
      const dueDate = todo.nextDueDate ? new Date(todo.nextDueDate) : null;
      const remindDate = dueDate ? new Date(dueDate) : null;
      if (remindDate) {
        remindDate.setDate(
          remindDate.getDate() - (todo.reminderDaysBefore || 0)
        );
      }

      if (
        remindDate &&
        startOfToday.getTime() >= remindDate.getTime() &&
        startOfToday.getTime() <= (dueDate?.getTime?.() ?? 0)
      ) {
        reminding.push(todo);
      } else if (dueDate && startOfToday.getTime() > dueDate.getTime()) {
        overdued.push(todo);
      } else {
        upcoming.push(todo);
      }
    });

    return {
      overdued: sortTodosByDate(overdued),
      reminding: sortTodosByDate(reminding),
      upcoming: sortTodosByDate(upcoming),
      completed: sortTodosByDate(completed)
    };
  })();

  const groupedByCategory = groupTodosByCategory(todos || []);

  const renderTodoGroup = (todoItems, labelKey, icon) => {
    if (!todoItems?.length) return null;
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
    Object.values(groupedTodosByTime).every((g) => g.length === 0) &&
    Object.values(groupedByCategory).every((g) => g.length === 0);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, p: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexDirection: { xs: "column", sm: "row" }
        }}
      >
        <Box
          sx={{
            textAlign: "left",
            mb: { xs: 2, sm: 0 },
            alignSelf: { xs: "flex-start", sm: "auto" }
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
            width: { xs: "100%", sm: "auto" }
          }}
        >
          <Box
            sx={{ minWidth: "200px", display: "flex", alignItems: "center" }}
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
              aria-label={t("page.todos.aria.addNew")}
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
            backgroundColor: red[50]
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
                // By category
                CATEGORY_GROUPS.map((group) =>
                  renderTodoGroup(
                    groupedByCategory[group.key],
                    `categories.${group.key}`,
                    group.icon
                  )
                )
              ) : (
                // By time windows
                <>
                  {renderTodoGroup(
                    groupedTodosByTime.overdued,
                    "todoGroups.overdue",
                    <WarningIcon color="error" />
                  )}
                  {renderTodoGroup(
                    groupedTodosByTime.reminding,
                    "todoGroups.reminding",
                    <NotificationsActiveIcon color="info" />
                  )}
                  {renderTodoGroup(
                    groupedTodosByTime.upcoming,
                    "todoGroups.upcoming",
                    <CalendarTodayIcon sx={{ color: "info" }} />
                  )}
                  {renderTodoGroup(
                    groupedTodosByTime.completed,
                    "todoGroups.completed",
                    <CheckCircleOutlineIcon color="success" />
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
