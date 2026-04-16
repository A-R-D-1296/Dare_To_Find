import React, { useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';
import { cn } from '../../utils/cn';

export const ThemeToggle = ({ className }) => {
  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "p-2 rounded-full bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--color-brand-accent)] transition-colors",
        className
      )}
      aria-label="Toggle Theme"
    >
      {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
};
