import {
  Card,
  CardContent,
  Typography,
  Checkbox,
  Box,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { lightBlue, deepOrange, green, blue } from "@mui/material/colors";
import dayjs from "dayjs";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import RepeatIcon from "@mui/icons-material/Repeat";
import LabelIcon from "@mui/icons-material/Label";
import EditIcon from "@mui/icons-material/Edit";

export default function TodoCard({ todo, onToggleComplete }) {
  const navigate = useNavigate();

  /**
   * Calculates the number of days until a due date.
   * @param {string} dueDateStr The due date string.
   * @returns {string} A string indicating days left or overdue status.
   */
  const daysUntil = (dueDateStr) => {
    const due = dayjs(dueDateStr);
    const now = dayjs();
    const diffDays = due.diff(now, "day");
    if (diffDays === 0) {
      return "Due Today";
    } else if (diffDays > 0) {
      return `${diffDays} day${diffDays === 1 ? "" : "s"} left`;
    } else {
      return `Overdue by ${-diffDays} day${-diffDays === 1 ? "" : "s"}`;
    }
  };

  /**
   * Determines the color of the card based on the todo's status.
   * @param {object} todo The todo object.
   * @returns {string} The background color string.
   */
  const getCardColor = (todo) => {
    if (todo.completed) {
      return green[50];
    }
    // Determine due and remind dates for sorting
    const dueDate = todo.nextDueDate ? new Date(todo.nextDueDate) : null;
    const remindDate = dueDate ? new Date(dueDate) : null;
    if (remindDate) {
      remindDate.setDate(remindDate.getDate() - (todo.reminderDaysBefore || 0));
    }

    const now = new Date();
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
      // reminding
      return blue[50];
    } else if (dueDate && startOfToday.getTime() > dueDate.getTime()) {
      return deepOrange[50];
    } else {
      return lightBlue[50];
    }
  };

  return (
    <Card
      sx={{
        mt: 2,
        cursor: "pointer",
        borderRadius: "12px",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        transition: "transform 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 6px 12px rgba(0,0,0,0.15)",
        },
        bgcolor: getCardColor(todo),
      }}
      onClick={() => navigate(`/todos/${todo.id}`, { state: { todo } })}
    >
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
            }}
          >
            {todo.title}
          </Typography>
          <Box display="flex" alignItems="center">
            <Checkbox
              checked={!!todo.completed}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                e.stopPropagation();
                onToggleComplete();
              }}
              color="primary"
            />
          </Box>
        </Box>
        <Typography
          variant="body2"
          sx={{
            mt: 1,
            mb: 2,
            whiteSpace: "pre-wrap",
          }}
        >
          {todo.content}
        </Typography>
        <Box sx={{ color: "text.secondary", mt: 4 }}>
          {todo.category && (
            <Box display="flex" alignItems="center" sx={{ mb: 0.5 }}>
              <Tooltip title="Category">
                <LabelIcon
                  sx={{ mr: 1.2, fontSize: "1.0rem", color: "action" }}
                />
              </Tooltip>
              <Typography variant="body2">{todo.category}</Typography>
            </Box>
          )}
          <Box display="flex" alignItems="center" sx={{ mb: 0.5 }}>
            <Tooltip title="Recurrence Rule">
              <RepeatIcon
                sx={{ mr: 1.2, fontSize: "1.0rem", color: "action" }}
              />
            </Tooltip>
            <Typography variant="body2">
              {todo.recurrenceRule || "None"}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center-center" sx={{ mb: 0.5 }}>
            <Tooltip title="Next Due Date">
              <CalendarMonthIcon
                sx={{ mr: 1.2, fontSize: "1.0rem", color: "action" }}
              />
            </Tooltip>
            <Box>
              <Typography variant="body2">
                {dayjs(todo.nextDueDate).format("DD/MM/YYYY")}
              </Typography>
            </Box>
          </Box>
          <Typography variant="body1">{daysUntil(todo.nextDueDate)}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
