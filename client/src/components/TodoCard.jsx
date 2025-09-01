// src/components/TodoCard.jsx
import {
  Card,
  CardContent,
  Typography,
  Checkbox,
  Box,
  Tooltip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { lightBlue, deepOrange, green, blue } from "@mui/material/colors";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import RepeatIcon from "@mui/icons-material/Repeat";
import LabelIcon from "@mui/icons-material/Label";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";

export default function TodoCard({ todo, onToggleComplete }) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  // Keep Day.js locale in sync with i18n
  useEffect(() => {
    const lang = (i18n.resolvedLanguage || i18n.language || "en").split("-")[0];
    dayjs.locale(lang === "zh" ? "zh-cn" : "en");
  }, [i18n.resolvedLanguage, i18n.language]);

  /**
   * Calculates the number of days until a due date.
   * Localized using i18next pluralization.
   */
  const daysUntil = (dueDateStr) => {
    const due = dayjs(dueDateStr);
    const now = dayjs();
    const diffDays = due.diff(now, "day");

    if (diffDays === 0) return t("todo.dueToday");
    if (diffDays > 0) return t("todo.daysLeft", { count: diffDays });
    return t("todo.overdue", { count: Math.abs(diffDays) });
  };

  /**
   * Determines the color of the card based on the todo's status.
   */
  const getCardColor = (todo) => {
    if (todo.completed) return green[50];

    const dueDate = todo.nextDueDate ? new Date(todo.nextDueDate) : null;
    const remindDate = dueDate ? new Date(dueDate) : null;
    if (remindDate) {
      remindDate.setDate(remindDate.getDate() - (todo.reminderDaysBefore || 0));
    }

    const now = new Date();
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
      return blue[50]; // reminding window
    } else if (dueDate && startOfToday.getTime() > dueDate.getTime()) {
      return deepOrange[50]; // overdue
    }
    return lightBlue[50]; // upcoming
  };

  // Map raw category to top-level categories.* (supports "Work" and "work")
  const categoryText = useMemo(() => {
    const raw = (todo.category || "Other").toString().trim();
    const last = raw.includes(".") ? raw.split(".").pop() : raw; // strip "categories.Other"
    const title = last.charAt(0).toUpperCase() + last.slice(1).toLowerCase(); // "work" -> "Work"
    const lower = last.toLowerCase();

    if (i18n.exists(`categories.${title}`)) {
      return t(`categories.${title}`);
    }
    if (i18n.exists(`categories.${lower}`)) {
      return t(`categories.${lower}`);
    }
    return todo.category || t("common.none");
  }, [todo.category, t, i18n]);

  // Map raw recurrence -> your keys: oneTime | every7d | every14d | monthly
  // Map raw recurrence -> your keys under todoDetail.recurrence
  const recurrenceText = useMemo(() => {
    const raw = (todo.recurrenceRule ?? "").toString().trim();
    if (!raw) return t("common.none");

    // normalize and map back-end values to your camelCase keys
    const norm = raw.toLowerCase().replace(/\s+/g, "").replace(/-/g, "");
    const map = {
      onetime: "oneTime",
      one_time: "oneTime",
      "7d": "every7d",
      every7d: "every7d",
      "14d": "every14d",
      every14d: "every14d",
      monthly: "monthly",
    };
    const k = map[norm];
    if (k && i18n.exists(`todoDetail.recurrence.${k}`)) {
      return t(`todoDetail.recurrence.${k}`);
    }
    return raw; // fallback to the raw value if no match
  }, [todo.recurrenceRule, t, i18n]);

  // Date format (with safe fallback) and render text
  const dateFormat = t("todo.dateFormat", { defaultValue: "YYYY-MM-DD" });
  const dateText = todo.nextDueDate
    ? dayjs(todo.nextDueDate).format(dateFormat)
    : t("todo.noDueDate");

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
        <Box
          sx={{
            "&::after": { content: '""', display: "table", clear: "both" },
          }}
        >
          <Box sx={{ float: "right", mt: -1.0, mr: -1.8, mb: -2.4 }}>
            <Checkbox
              checked={!!todo.completed}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                e.stopPropagation();
                onToggleComplete();
              }}
              color="primary"
              inputProps={{ "aria-label": t("todo.markComplete") }}
            />
          </Box>

          <Typography
            variant="h6"
            sx={{ mt: -0.8, fontSize: "1.1rem", fontWeight: "bold" }}
          >
            {todo.title}
          </Typography>
        </Box>

        <Typography
          variant="body2"
          sx={{
            mt: 0.8,
            mb: 2,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 4,
            WebkitBoxOrient: "vertical",
          }}
        >
          {todo.content}
        </Typography>

        <Box sx={{ color: "text.secondary", mt: 4 }}>
          {todo.category && (
            <Box display="flex" alignItems="center" sx={{ mb: 0 }}>
              <Tooltip title={t("todo.categoryLabel")}>
                <LabelIcon
                  sx={{ mr: 1.2, fontSize: "1.0rem", color: "action" }}
                />
              </Tooltip>
              <Typography variant="body2">{categoryText}</Typography>
            </Box>
          )}

          <Box display="flex" alignItems="center" sx={{ mb: 0 }}>
            <Tooltip title={t("todo.recurrenceLabel")}>
              <RepeatIcon
                sx={{ mr: 1.2, fontSize: "1.0rem", color: "action" }}
              />
            </Tooltip>
            <Typography variant="body2">{recurrenceText}</Typography>
          </Box>

          <Box display="flex" alignItems="center" sx={{ mb: 0 }}>
            <Tooltip title={t("todo.nextDueDateLabel")}>
              <CalendarMonthIcon
                sx={{ mr: 1.2, fontSize: "1.0rem", color: "action" }}
              />
            </Tooltip>
            <Typography variant="body2">{dateText}</Typography>
          </Box>

          {todo.nextDueDate && (
            <Typography
              variant="body1"
              sx={{ fontSize: "0.8rem", fontWeight: "bold", mb: -1.6 }}
            >
              {daysUntil(todo.nextDueDate)}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
