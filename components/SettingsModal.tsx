import React, { useEffect } from 'react';
import { X, Moon, Sun, Globe } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { AppTheme, AppLanguage } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateTheme, updateLanguage, t } = useSettings();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {t('settings.title')}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-900 dark:hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          
          {/* Theme Section */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-1.5">
              {settings.theme === 'dark' ? <Moon size={14}/> : <Sun size={14}/>}
              {t('settings.theme')}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => updateTheme('dark')}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border font-bold text-sm transition-all ${
                  settings.theme === 'dark'
                    ? 'bg-slate-800 border-emerald-500 text-emerald-400'
                    : 'bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500'
                }`}
              >
                <Moon size={16} />
                {t('settings.theme.dark')}
              </button>
              <button
                onClick={() => updateTheme('light')}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border font-bold text-sm transition-all ${
                  settings.theme === 'light'
                    ? 'bg-white border-blue-500 text-blue-600 shadow-md'
                    : 'bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500'
                }`}
              >
                <Sun size={16} />
                {t('settings.theme.light')}
              </button>
            </div>
          </div>

          {/* Language Section */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-1.5">
              <Globe size={14}/>
              {t('settings.language')}
            </label>
            <div className="grid grid-cols-1 gap-2">
              {[
                { code: 'en', label: 'English' },
                { code: 'es', label: 'Español' },
                { code: 'fr', label: 'Français' },
                { code: 'de', label: 'Deutsch' },
                { code: 'ja', label: '日本語' },
                { code: 'ar', label: 'العربية' }
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => updateLanguage(lang.code as AppLanguage)}
                  className={`w-full text-left rtl:text-right px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                    settings.language === lang.code
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                      : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex justify-between items-center rtl:flex-row-reverse">
                    <span>{lang.label}</span>
                    {settings.language === lang.code && <div className="w-2 h-2 rounded-full bg-emerald-500"></div>}
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-b-2xl border-t border-slate-200 dark:border-slate-800 text-center">
           <p className="text-[10px] text-slate-400">
             Earned v0.2.0 • {t('app.tagline')}
           </p>
        </div>

      </div>
    </div>
  );
};
