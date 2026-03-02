import useLangStore from '../store/useLangStore';
import { translations } from '../i18n/translations';

const useTranslation = (namespace) => {
  const { language, setLanguage } = useLangStore();
  const t = namespace ? translations[language][namespace] : translations[language];
  return { t, language, setLanguage };
};

export default useTranslation;
