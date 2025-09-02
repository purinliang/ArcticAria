import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./locales/en.json";
import zh from "./locales/zh.json";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import "dayjs/locale/en";

i18n
  .use(LanguageDetector) // detects preferred language
  .use(initReactI18next) // passes i18n down to React
  .init({
    resources: {
      en: { translation: en },
      zh: { translation: zh },
    },
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

// Sync Day.js locale with current i18n language
i18n.on("languageChanged", (lng) => {
  dayjs.locale(lng === "zh" ? "zh-cn" : "en");
});

// set initial locale on load
dayjs.locale(i18n.language === "zh" ? "zh-cn" : "en");

export default i18n;
