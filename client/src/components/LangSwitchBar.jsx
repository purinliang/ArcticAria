// src/components/LangSwitchBar.jsx
import {
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import LanguageIcon from "@mui/icons-material/Language";

export default function LangSwitchBar({ isMobile = false }) {
  const { i18n } = useTranslation();

  const isZh = (i18n.resolvedLanguage || i18n.language || "en").startsWith(
    "zh",
  );

  const toggleLanguage = () => {
    const next = isZh ? "en" : "zh";
    i18n.changeLanguage(next);
    localStorage.setItem("i18nextLng", next);
  };

  if (isMobile) {
    return (
      <ListItem button onClick={toggleLanguage}>
        <ListItemIcon sx={{ minWidth: 30 }}>
          <LanguageIcon />
        </ListItemIcon>
        <ListItemText primary={isZh ? "English" : "中文"} />
      </ListItem>
    );
  }

  return (
    <Button
      onClick={toggleLanguage}
      variant="outlined"
      color="primary"
      sx={{
        borderRadius: "8px",
        textTransform: "none",
        gap: 0.5,
      }}
    >
      <LanguageIcon fontSize="small" />
      <Typography variant="body2">{isZh ? "English" : "中文"}</Typography>
    </Button>
  );
}
