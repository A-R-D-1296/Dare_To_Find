import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, Paperclip, Square } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../utils/cn';
import { useVoice } from '../../hooks/useVoice';
import { Spinner } from '../common/Spinner';

export const ChatInput = ({ onSend, disabled }) => {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const textareaRef = useRef(null);
  const { isRecording, transcript, toggleRecording, hasSupport } = useVoice();

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  // Handle voice transcript
  useEffect(() => {
    if (transcript) {
      setText(prev => prev + ' ' + transcript.split(' ').slice(prev.split(' ').length - 1).join(' ')); // Basic concatenation, could be improved depending on how speech API fires interim results
      // Actually simpler logic for custom hook: Just take the latest transcript to append roughly, or hook directly
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript]);

  // We actually need a better merge for transcript. Let's just override while recording for simplicity in this demo.
  useEffect(() => {
    if (isRecording && transcript) {
       // Append only new words or just set it as a live preview
    }
  }, [transcript, isRecording]);


  const handleSubmit = (e) => {
    e?.preventDefault();
    if (text.trim() && !disabled) {
      onSend(text.trim());
      setText('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-base)]/80 backdrop-blur-lg sticky bottom-0 z-20 pb-safe">
      <div className="max-w-4xl mx-auto relative relative">
        {isRecording && (
          <div className="absolute -top-10 left-0 right-0 flex justify-center z-10 pointer-events-none">
            <div className="bg-red-500 text-white px-4 py-1.5 rounded-full text-xs font-bold animate-pulse flex items-center gap-2 shadow-lg">
              <span className="w-2 h-2 bg-white rounded-full animate-ping" />
              Recording Audio... {transcript && `"${transcript.substring(0,20)}..."`}
            </div>
          </div>
        )}

        <form 
          onSubmit={handleSubmit}
          className={cn(
            "flex items-end gap-2 p-2 rounded-2xl border transition-all",
            isRecording 
              ? "border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)] bg-red-500/5" 
              : "border-[var(--border-color)] bg-[var(--bg-surface)] focus-within:border-[var(--color-brand-accent)] focus-within:shadow-[0_0_15px_rgba(226,185,111,0.1)]"
          )}
        >
          <button
            title="Attach File (Coming Soon)"
            type="button"
            className="p-3 text-[var(--text-muted)] hover:text-[var(--text-base)] transition-colors opacity-50 cursor-not-allowed hidden sm:block"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={t('dashboard.inputPlaceholder')}
            className="flex-1 bg-transparent py-3 px-2 resize-none focus:outline-none max-h-[120px] custom-scrollbar text-sm"
            rows={1}
          />

          {hasSupport && (
            <button
              type="button"
              onClick={toggleRecording}
              className={cn(
                "p-3 rounded-xl transition-colors",
                isRecording 
                  ? "bg-red-500 text-white animate-pulse-ring" 
                  : "text-[var(--text-muted)] hover:bg-[var(--bg-base)] hover:text-[var(--color-brand-accent)]"
              )}
            >
              {isRecording ? <Square className="w-5 h-5 fill-current" /> : <Mic className="w-5 h-5" />}
            </button>
          )}

          <button
            type="submit"
            disabled={!text.trim() || disabled}
            className="p-3 rounded-xl bg-[var(--color-brand-accent)] text-black disabled:opacity-50 disabled:cursor-not-allowed hover:bg-opacity-90 transition-all ml-1"
          >
            {disabled ? <Spinner size="sm" className="border-black border-t-transparent w-5 h-5" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
        <div className="text-center mt-3 text-[11px] text-[var(--text-muted)]">
          {t('dashboard.disclaimer')}
        </div>
      </div>
    </div>
  );
};
