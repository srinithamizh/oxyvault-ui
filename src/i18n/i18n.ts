import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enUS from "@/locales/en-US.json";

export const DEFAULT_LANGUAGE = "en-US";

/**
 * To add a language: create `src/locales/<code>.json` with the same keys as en-US.json,
 * register it here under `resources`, and call `i18n.changeLanguage("<code>")`.
 */
export const resources = {
  "en-US": { translation: enUS },
} as const;

void i18n.use(initReactI18next).init({
  resources,
  lng: DEFAULT_LANGUAGE,
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: { escapeValue: false }, // React already escapes rendered values
  returnNull: false,
});

const syncDocumentLanguage = (language: string) => {
  document.documentElement.lang = language;
};
syncDocumentLanguage(i18n.language);
i18n.on("languageChanged", syncDocumentLanguage);

export default i18n;
