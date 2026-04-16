import React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../utils/cn';

export const LanguageToggle = ({ className }) => {
  const { i18n } = useTranslation();
  
  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('lexisco-lang', newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className={cn(
        "flex items-center rounded-full p-1 bg-[var(--bg-surface)] border border-[var(--border-color)]",
        className
      )}
    >
      <div
        className={cn(
          "px-3 py-1 text-sm font-medium rounded-full transition-colors",
          i18n.language === 'en' ? "bg-[var(--color-brand-accent)] text-black" : "text-[var(--text-muted)]"
        )}
      >
        EN
      </div>
      <div
        className={cn(
          "px-3 py-1 text-sm font-medium rounded-full transition-colors",
          i18n.language === 'hi' ? "bg-[var(--color-brand-accent)] text-black" : "text-[var(--text-muted)]"
        )}
      >
        HI
      </div>
    </button>
  );
};
