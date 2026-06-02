import React, { createContext, useState, useContext, useEffect } from 'react';
import { en, st } from './locales';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('language');
    return saved || 'en';
  });
  
  const [translations, setTranslations] = useState(() => {
    return language === 'en' ? en : st;
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    setTranslations(language === 'en' ? en : st);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'st' : 'en');
  };

  return (
    <LanguageContext.Provider value={{ language, translations, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
