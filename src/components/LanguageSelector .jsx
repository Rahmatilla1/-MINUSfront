import i18n from "./i18n"; // to‘g‘ri yo‘l bo‘lishi shart!
import { useTranslation } from "react-i18next";

const LanguageSelector = () => {
  const { t } = useTranslation();

  const changeLang = async (lang) => {
    if (!["uz", "ru", "en"].includes(lang)) {
      console.error("❌ Noto‘g‘ri til:", lang);
      return;
    }

    try {
      // Tilni o‘zgartirish
      await i18n.changeLanguage(lang);
      localStorage.setItem("lang", lang);
      console.log("✅ Til o‘zgartirildi:", lang);
    } catch (err) {
      console.error("❌ Tilni o‘zgartirishda xatolik:", err);
    }
  };

  return (
    <select
      onChange={(e) => changeLang(e.target.value)}
      defaultValue={i18n.language || "uz"}
    >
      <option value="uz">O'zbekcha</option>
      <option value="ru">Русский</option>
      <option value="en">English</option>
    </select>
  );
};

export default LanguageSelector;