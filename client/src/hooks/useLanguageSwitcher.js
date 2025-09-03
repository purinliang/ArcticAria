import { useTranslation } from "react-i18next";

/**
 * A custom hook to manage language switching logic.
 * @returns {object} An object containing:
 * - `toggleLanguage`: A function to switch between English and Chinese.
 * - `switchLanguageText`: The appropriate text for the language switch button/menu item.
 * - `isZh`: A boolean indicating if the current language is Chinese.
 */
export const useLanguageSwitcher = () => {
  const { t, i18n } = useTranslation();

  const isZh = (i18n.resolvedLanguage || i18n.language || "en").startsWith(
    "zh",
  );

  const toggleLanguage = () => {
    const next = isZh ? "en" : "zh";
    i18n.changeLanguage(next);
    localStorage.setItem("i18nextLng", next);
  };

  const switchLanguageText = isZh
    ? t("auth.switchToEnglish")
    : t("auth.switchToChinese");

  return { toggleLanguage, switchLanguageText, isZh };
};
