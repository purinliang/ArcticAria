// src/components/LangSwitchBar.jsx
import { Button, Typography } from "@mui/material";
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
    <Button
      onClick={toggleLanguage}
      variant="outlined"
      color="default"
      sx={{
        py: 1,
        px: 2,
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        gap: 0.5,
      }}
    >
      {/* Globe icon */}
      <LanguageIcon fontSize="small" />

      {/* Text */}
      <Typography variant="body2">{isZh ? "中文" : "English"}</Typography>
    </Button>
  );
}