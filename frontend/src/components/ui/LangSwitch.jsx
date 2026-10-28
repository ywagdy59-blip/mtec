import { useLang } from "../../hooks/useLang";

export default function LangSwitch() {
  const { lang, setLang } = useLang();

  return (
    <div className="lang-switch" role="group" aria-label="Language">
      <button type="button" aria-pressed={lang === "en"} onClick={() => setLang("en")} lang="en">
        EN
      </button>
      <button type="button" aria-pressed={lang === "ar"} onClick={() => setLang("ar")} lang="ar">
        عربي
      </button>
    </div>
  );
}
