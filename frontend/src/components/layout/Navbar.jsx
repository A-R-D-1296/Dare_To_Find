import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Scale } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageToggle } from '../common/LanguageToggle';
import { ThemeToggle } from '../common/ThemeToggle';
import { cn } from '../../utils/cn';

export const Navbar = () => {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 w-full z-40 transition-all duration-300",
        scrolled ? "bg-[var(--bg-base)]/80 backdrop-blur-md border-b border-[var(--border-color)] py-3" : "bg-transparent py-5"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <Scale className="w-8 h-8 text-[var(--color-brand-accent)] group-hover:scale-110 transition-transform" />
          <span className="text-2xl font-bold font-serif text-[var(--color-brand-accent)] tracking-wide">LexisCo</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link to="/" className="hover:text-[var(--color-brand-accent)] transition-colors">{t('nav.home')}</Link>
          <Link to="/about" className="hover:text-[var(--color-brand-accent)] transition-colors">{t('nav.about')}</Link>
          <a href="#features" className="hover:text-[var(--color-brand-accent)] transition-colors">{t('nav.features')}</a>
        </div>

        <div className="flex items-center gap-4">
          <LanguageToggle className="hidden sm:flex" />
          <ThemeToggle />
          <Link to="/login" className="hidden sm:block px-4 py-2 text-sm font-medium hover:text-[var(--color-brand-accent)] transition-colors">
            {t('nav.login')}
          </Link>
          <Link to="/signup" className="px-5 py-2 text-sm font-semibold bg-[var(--color-brand-accent)] text-black rounded-lg hover:bg-opacity-90 transition-all active:scale-95 shadow-[0_0_15px_rgba(226,185,111,0.3)]">
            {t('nav.getStarted')}
          </Link>
        </div>
      </div>
    </nav>
  );
};
