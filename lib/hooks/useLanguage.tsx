// lib/hooks/useLanguage.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type LanguageContextType = {
  language: 'en' | 'zh';
  toggleLanguage: () => void;
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  toggleLanguage: () => {},
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<'en' | 'zh'>('en');

  useEffect(() => {
    // Check if localStorage is available (client-side only)
    if (typeof window !== 'undefined') {
      // Load saved language preference
      const savedLanguage = localStorage.getItem('language');
      if (savedLanguage === 'en' || savedLanguage === 'zh') {
        setLanguage(savedLanguage);
      }
    }
  }, []);

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'zh' : 'en';
    setLanguage(newLanguage);
    // Check if localStorage is available (client-side only)
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', newLanguage);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);