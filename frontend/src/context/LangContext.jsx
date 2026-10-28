import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { translations } from "../i18n/translations";

export const LangContext = createContext(null);

const STORAGE_KEY = "mtec_lang";

const initialLang = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "en" || saved === "ar") return saved;
  return navigator.language?.toLowerCase().startsWith("ar") ? "ar" : "en";
};

export function LangProvider({ children }) {
  const [lang, setLang] = useState(initialLang);
  const dir = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    localStorage.setItem(STORAGE_KEY, lang);
  }, [lang, dir]);

  // t("hero.title") -> text, falls back to English, then to the key
  const t = useCallback(
    (path) => {
      const read = (dict) => path.split(".").reduce((node, part) => node?.[part], dict);
      return read(translations[lang]) ?? read(translations.en) ?? path;
    },
    [lang]
  );

  const value = useMemo(() => ({ lang, dir, setLang, t }), [lang, dir, t]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}
