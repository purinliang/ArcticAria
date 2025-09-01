// src/components/LangSwitchBar.jsx
import React from "react";
import { Box } from "@mui/material";
import ReactFlagsSelect from "react-flags-select";
import { useTranslation } from "react-i18next";

export default function LangSwitchBar() {
  const { i18n } = useTranslation();

  const selected = (i18n.resolvedLanguage || i18n.language || "en").startsWith(
    "zh"
  )
    ? "CN"
    : "AU";

  const onSelect = (code) => {
    const next = code === "CN" ? "zh" : "en";
    i18n.changeLanguage(next);
    localStorage.setItem("i18nextLng", next);
  };

  return (
    <Box
      sx={{
        // Remove border/outline/focus ring from the select button — no external CSS needed
        "& .aa-no-outline": {
          border: "none !important",
          boxShadow: "none !important"
        },
        "& .aa-no-outline:focus": {
          outline: "none !important",
          boxShadow: "none !important"
        }
      }}
    >
      <ReactFlagsSelect
        selected={selected}
        onSelect={onSelect}
        countries={["AU", "CN"]}
        customLabels={{ AU: "English", CN: "简体中文" }}
        showSelectedLabel={false} // button shows only the flag
        showOptionLabel // dropdown shows English / 简体中文
        selectedSize={18}
        optionsSize={18}
        fullWidth={false}
        alignOptionsToRight
        selectButtonClassName="aa-no-outline"
      />
    </Box>
  );
}
