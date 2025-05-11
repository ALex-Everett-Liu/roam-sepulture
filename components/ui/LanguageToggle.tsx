import { useLanguage } from '@/lib/hooks/useLanguage';

export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();
  
  return (
    <button
      onClick={toggleLanguage}
      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium"
    >
      {language === 'en' ? '切换到中文' : 'Switch to English'}
    </button>
  );
}