import React, { useState } from 'react';
import { ExternalLink, BookOpen } from 'lucide-react';
import lawData from '../../utils/lawSections.json';

export const LawCitation = ({ section }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Try to find the exact section in our predefined list
  const lawInfo = lawData.find(l => section.toLowerCase().includes(l.section.toLowerCase()));

  if (!lawInfo) {
    return <span className="text-[var(--color-brand-accent)] font-semibold">{section}</span>;
  }

  return (
    <div className="relative inline-block" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <span className="text-[var(--color-brand-accent)] border-b border-dashed border-[var(--color-brand-accent)] cursor-help font-semibold hover:bg-[var(--color-brand-accent)]/10 px-1 rounded transition-colors">
        {section}
      </span>
      
      {isHovered && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl shadow-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded bg-[var(--color-brand-accent)]/20 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4 text-[var(--color-brand-accent)]" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[var(--text-base)]">{lawInfo.act}</h4>
              <p className="text-xs text-[var(--text-muted)] mt-1">{lawInfo.section}</p>
            </div>
          </div>
          <div className="mt-3 text-sm text-[var(--text-base)]">
            {lawInfo.text}
          </div>
          {lawInfo.url && (
            <a 
              href={lawInfo.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-3 flex items-center gap-1 text-xs text-[var(--color-brand-blue)] hover:underline"
            >
              View Full Act <ExternalLink className="w-3 h-3" />
            </a>
          )}
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-[var(--border-color)]"></div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-[var(--bg-surface)] -mt-[1px]"></div>
        </div>
      )}
    </div>
  );
};
