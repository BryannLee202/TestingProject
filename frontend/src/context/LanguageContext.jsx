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

  // Try to sync with Google Translate on mount
  useEffect(() => {
    const syncGoogleTranslate = () => {
      const selectField = document.querySelector('.goog-te-combo');
      if (selectField) {
        if (selectField.value !== language) {
          selectField.value = language;
          selectField.dispatchEvent(new Event('change'));
        }
      } else {
        setTimeout(syncGoogleTranslate, 500); // Wait for script to load
      }
    };
    if (language === 'en') {
      setTimeout(syncGoogleTranslate, 500);
    }
    // Run once on mount only, to sync with whatever language was already persisted
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const translations = language === 'vi' ? vi : en;

  // Function to translate keys
  const t = (key) => {
    return translations[key] || key;
  };

  const changeLanguage = (lang) => {
    // Add transitioning class for CSS effect
    document.body.classList.add('lang-transitioning');
    
    setLanguage(lang);
    
    // Trigger Google Translate
    const triggerTranslation = () => {
      const selectField = document.querySelector('.goog-te-combo');
      if (selectField) {
        if (lang === 'vi') {
          document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
          selectField.value = 'vi';
        } else {
          selectField.value = lang;
        }
        selectField.dispatchEvent(new Event('change', { bubbles: true }));
      }
    };

    setTimeout(triggerTranslation, 10);
    // Retry to ensure Google Translate catches the event (fixes the "double click required" issue)
    setTimeout(triggerTranslation, 200);
    setTimeout(triggerTranslation, 500);

    // Remove transitioning class after 800ms
    setTimeout(() => {
      document.body.classList.remove('lang-transitioning');
    }, 800);
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components -- co-located with LanguageProvider by design; splitting into a separate file would mean touching every importer for a Fast Refresh nicety only
export const useLanguage = () => {
  return useContext(LanguageContext);
};
