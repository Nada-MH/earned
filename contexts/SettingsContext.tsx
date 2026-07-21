import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppSettings, AppTheme, AppLanguage } from '../types';
import { getTranslation } from '../utils/translations';

interface SettingsContextType {
  settings: AppSettings;
  updateTheme: (theme: AppTheme) => void;
  updateLanguage: (lang: AppLanguage) => void;
  t: (key: string) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state from localStorage or defaults
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('earned_app_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
    
    // System preference detection for theme
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    return { theme: prefersDark ? 'dark' : 'light', language: 'en' };
  });

  // Persist to localStorage and apply side effects
  useEffect(() => {
    localStorage.setItem('earned_app_settings', JSON.stringify(settings));
    
    const root = window.document.documentElement;

    // Apply theme
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Apply direction and language attribute
    if (settings.language === 'ar') {
      root.setAttribute('dir', 'rtl');
      root.setAttribute('lang', 'ar');
    } else {
      root.setAttribute('dir', 'ltr');
      root.setAttribute('lang', settings.language);
    }
  }, [settings]);

  const updateTheme = (theme: AppTheme) => {
    setSettings(prev => ({ ...prev, theme }));
  };

  const updateLanguage = (language: AppLanguage) => {
    setSettings(prev => ({ ...prev, language }));
  };

  const t = (key: string) => getTranslation(settings.language, key);

  return (
    <SettingsContext.Provider value={{ settings, updateTheme, updateLanguage, t }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
