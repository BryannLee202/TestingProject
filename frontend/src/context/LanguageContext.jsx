import React, { createContext, useState, useContext, useEffect } from 'react';
import vi from '../locales/vi';
import en from '../locales/en';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  // Read language from localStorage, default to 'vi'
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'vi';
  });

  // Save to localStorage when language changes
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const translations = language === 'vi' ? vi : en;

  // Function to translate keys
  const t = (key) => {
    return translations[key] || key;
  };

  const changeLanguage = (lang) => {
    setLanguage(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  return useContext(LanguageContext);
};
