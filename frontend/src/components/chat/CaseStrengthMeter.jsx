import React, { useEffect, useState } from 'react';
import { cn } from '../../utils/cn';

export const CaseStrengthMeter = ({ score }) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    // Animate the score on mount
    const timeout = setTimeout(() => {
      setAnimatedScore(score);
    }, 500);
    return () => clearTimeout(timeout);
  }, [score]);

  let color = 'text-[var(--color-brand-danger)]';
  let label = 'Weak Case';
  let bgGradient = 'conic-gradient(var(--color-brand-danger) calc(var(--score) * 1%), transparent 0)';
  
  if (score > 40 && score <= 70) {
    color = 'text-amber-500';
    label = 'Moderate Case';
    // Tailwind doesn't have an amber variable by default in our setup, using hex
    bgGradient = 'conic-gradient(#f59e0b calc(var(--score) * 1%), transparent 0)';
  } else if (score > 70) {
    color = 'text-[var(--color-brand-success)]';
    label = 'Strong Case';
    bgGradient = 'conic-gradient(var(--color-brand-success) calc(var(--score) * 1%), transparent 0)';
  }

  return (
    <div className="flex items-center gap-4 mt-2 p-3 rounded-lg bg-[var(--bg-base)] border border-[var(--border-color)] w-max">
      <div 
        className="relative w-12 h-12 rounded-full flex items-center justify-center bg-[var(--bg-surface)] before:absolute before:inset-[3px] before:rounded-full before:bg-[var(--bg-base)] shadow-inner transition-all duration-1000 ease-out"
        style={{ background: bgGradient, '--score': animatedScore }}
      >
        <span className={cn("relative z-10 text-xs font-bold", color)}>
          {animatedScore}%
        </span>
      </div>
      <div>
        <div className="text-xs uppercase tracking-wider font-semibold text-[var(--text-muted)]">Case Strength</div>
        <div className={cn("text-sm font-bold", color)}>{label}</div>
      </div>
    </div>
  );
};
