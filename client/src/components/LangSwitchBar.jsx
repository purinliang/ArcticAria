// src/components/LangSwitchBar.jsx
import React from "react";
import { IconButton, Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import LanguageIcon from "@mui/icons-material/Language";

export default function LangSwitchBar() {
  const { i18n } = useTranslation();

  const isZh = (i18n.resolvedLanguage || i18n.language || "en").startsWith(
    "zh",
  );

  const toggleLanguage = () => {
    const next = isZh ? "en" : "zh";
    i18n.changeLanguage(next);
    localStorage.setItem("i18nextLng", next);
  };

  return (
    <IconButton
      onClick={toggleLanguage}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        border: "none",
        boxShadow: "none",
        "&:focus": { outline: "none" },
      }}
    >
      {/* Globe icon */}
      <LanguageIcon fontSize="small" />

      {/* Text */}
      <Typography variant="body2">{isZh ? "中文" : "English"}</Typography>
    </IconButton>
  );
}
