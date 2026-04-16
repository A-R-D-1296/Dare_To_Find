import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Scale } from 'lucide-react';

export const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-[var(--border-color)] bg-[var(--bg-base)] text-[var(--text-muted)] py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <Scale className="w-6 h-6 text-[var(--color-brand-accent)]" />
          <span className="text-xl font-bold font-serif text-[var(--text-base)]">LexisCo</span>
        </div>
        
        <div className="flex gap-6 text-sm">
          <Link to="/about" className="hover:text-[var(--color-brand-accent)] transition-colors">About</Link>
          <a href="#" className="hover:text-[var(--color-brand-accent)] transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-[var(--color-brand-accent)] transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-[var(--color-brand-accent)] transition-colors">Contact</a>
        </div>
        
        <div className="text-sm font-medium text-center md:text-right">
          Built for India.<br />Powered by AI.
        </div>
      </div>
    </footer>
  );
};
