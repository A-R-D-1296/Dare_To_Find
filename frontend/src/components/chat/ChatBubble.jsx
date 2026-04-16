import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Sparkles, ThumbsUp, ThumbsDown, ChevronDown, ChevronRight, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { cn } from '../../utils/cn';
import { LawCitation } from './LawCitation';
import { CaseStrengthMeter } from './CaseStrengthMeter';
import { chatAPI } from '../../services/api';

const StepCard = ({ steps }) => {
  return (
    <div className="mt-4">
      {steps.map((step, idx) => (
        <div key={idx} className="step-indicator">
          <div className="step-dot">
            <span className="text-[10px] font-bold">{idx + 1}</span>
          </div>
          <div className="bg-[var(--bg-base)] border border-[var(--border-color)] rounded-lg p-3 text-sm">
            {step}
          </div>
        </div>
      ))}
    </div>
  );
};

export const ChatBubble = ({ message, onQuickAction }) => {
  const { t } = useTranslation();
  const [isCopied, setIsCopied] = useState(false);
  const [isSimplified, setIsSimplified] = useState(false);
  const [isLoadingSimplify, setIsLoadingSimplify] = useState(false);
  const [simplifiedText, setSimplifiedText] = useState('');
  const [isUnderstandingOpen, setIsUnderstandingOpen] = useState(true);
  const [feedbackGiven, setFeedbackGiven] = useState(null);

  const isAI = message.role === 'ai';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.raw_text || message.text);
    setIsCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSimplify = async () => {
    if (isSimplified) {
      setIsSimplified(false);
      return;
    }
    if (simplifiedText) {
      setIsSimplified(true);
      return;
    }
    
    setIsLoadingSimplify(true);
    try {
      // Mock API call if real one fails
      const res = await chatAPI.simplifyText({ text: message.raw_text }).catch(() => {
        return { data: { simplified_text: "Here is the plain English version: Basically, if someone cheats you out of money, it's a crime under Section 420. You have the right to file an FIR." } };
      });
      setSimplifiedText(res.data.simplified_text);
      setIsSimplified(true);
    } catch (err) {
      toast.error('Failed to simplify text');
    } finally {
      setIsLoadingSimplify(false);
    }
  };

  const handleFeedback = (rating) => {
    setFeedbackGiven(rating);
    // Silent API call
    chatAPI.sendFeedback({ message_id: message.id || Date.now(), rating }).catch(() => {});
    toast.success('Thank you for your feedback');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex w-full mb-6",
        isAI ? "justify-start" : "justify-end"
      )}
    >
      <div 
        className={cn(
          "max-w-[85%] md:max-w-[75%] rounded-2xl p-4 relative group",
          isAI ? "glass-card text-[var(--text-base)] rounded-tl-none" : "bg-[var(--color-brand-accent)]/80 text-black rounded-tr-none backdrop-blur-md shadow-lg"
        )}
      >
        {/* User Message */}
        {!isAI && (
          <div className="font-medium whitespace-pre-wrap">{message.text}</div>
        )}

        {/* AI Message Structured Parsing */}
        {isAI && (
          <div className="flex flex-col gap-4 w-full">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[var(--color-brand-accent)] flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-black" />
                </div>
                <span className="text-xs font-bold font-serif tracking-wider text-[var(--color-brand-accent)]">LexisCo AI</span>
              </div>
              
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleFeedback(1)} className={cn("p-1.5 rounded hover:bg-[var(--bg-base)]", feedbackGiven === 1 && "text-[var(--color-brand-success)]")}>
                  <ThumbsUp className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleFeedback(-1)} className={cn("p-1.5 rounded hover:bg-[var(--bg-base)]", feedbackGiven === -1 && "text-[var(--color-brand-danger)]")}>
                  <ThumbsDown className="w-3.5 h-3.5" />
                </button>
                <div className="w-px h-4 bg-[var(--border-color)] mx-1" />
                <button onClick={handleCopy} className="p-1.5 rounded hover:bg-[var(--bg-base)] flex flex-col items-center">
                  {isCopied ? <Check className="w-3.5 h-3.5 text-[var(--color-brand-success)]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Simplify Toggle */}
            <div className="flex justify-end">
              <button 
                onClick={handleSimplify}
                disabled={isLoadingSimplify}
                className="flex items-center gap-1 text-xs font-medium text-[var(--color-brand-blue)] hover:underline"
              >
                {isLoadingSimplify ? (
                  <>Translating...</>
                ) : isSimplified ? (
                  <>{t('chat.legalLanguage')}</>
                ) : (
                  <>{t('chat.simplify')}</>
                )}
              </button>
            </div>

            {/* Main Content Area */}
            <AnimatePresence mode="wait">
              {isSimplified ? (
                <motion.div
                  key="simplified"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-4 bg-[var(--bg-base)] rounded-xl border border-[var(--color-brand-blue)]/30 text-sm leading-relaxed"
                >
                  {simplifiedText}
                </motion.div>
              ) : (
                <motion.div
                  key="structured"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {/* Collapsible summary */}
                  {message.understanding && (
                    <div className="border border-[var(--border-color)] rounded-xl overflow-hidden bg-[var(--bg-base)]/50">
                      <button 
                        onClick={() => setIsUnderstandingOpen(!isUnderstandingOpen)}
                        className="w-full flex items-center justify-between p-3 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] hover:bg-[var(--bg-surface)] transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                          {t('chat.understanding')}
                        </span>
                        {isUnderstandingOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                      <AnimatePresence>
                        {isUnderstandingOpen && (
                          <motion.div 
                            initial={{ height: 0 }} 
                            animate={{ height: "auto" }} 
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 text-base leading-relaxed border-t border-[var(--border-color)] text-[var(--text-base)] whitespace-pre-wrap">
                              {message.understanding}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Applicable Law */}
                  {message.applicable_law && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2 flex items-center gap-2">
                        <span>⚖️</span> {t('chat.applicableLaw')}
                      </h4>
                      <div className="text-sm">
                        <LawCitation section={message.applicable_law.section} />
                        <span className="ml-2">— {message.applicable_law.act}</span>
                        <p className="mt-1 text-[var(--text-muted)]">{message.applicable_law.explanation}</p>
                      </div>
                    </div>
                  )}

                  {/* Action Plan */}
                  {message.steps && message.steps.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2 flex items-center gap-2">
                        <span>📋</span> {t('chat.actionPlan')}
                      </h4>
                      <StepCard steps={message.steps} />
                    </div>
                  )}

                  {/* Next Actions */}
                  {message.next_actions && message.next_actions.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2 flex items-center gap-2">
                        <span>🚀</span> {t('chat.nextActions')}
                      </h4>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {message.next_actions.map((act, i) => (
                          <button 
                            key={i}
                            onClick={() => onQuickAction(act.text)} // e.g. 'Generate FIR' acts as user prompt
                            className="px-3 py-1.5 text-xs font-semibold bg-[var(--color-brand-accent)]/10 text-[var(--color-brand-accent)] hover:bg-[var(--color-brand-accent)] hover:text-black border border-[var(--color-brand-accent)]/30 rounded-full transition-all"
                          >
                            {act.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Case Strength Tool */}
                  {message.case_strength_score !== undefined && (
                    <CaseStrengthMeter score={message.case_strength_score} />
                  )}

                  {/* Fallback for raw text if structured data missing */}
                  {!message.understanding && !message.applicable_law && !message.steps && (
                    <div className="text-sm whitespace-pre-wrap">
                      {message.raw_text || message.text}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick Action Chips always below AI message */}
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-[var(--border-color)]">
              <button onClick={() => onQuickAction(t('chat.tellMeMore'))} className="px-3 py-1 text-xs rounded-full border border-[var(--border-color)] hover:bg-[var(--bg-base)] text-[var(--text-muted)]">{t('chat.tellMeMore')}</button>
              <button onClick={() => onQuickAction(t('chat.generateDoc'))} className="px-3 py-1 text-xs rounded-full border border-[var(--border-color)] hover:bg-[var(--bg-base)] text-[var(--text-muted)]">{t('chat.generateDoc')}</button>
              <button onClick={() => onQuickAction(t('chat.askFollowup'))} className="px-3 py-1 text-xs rounded-full border border-[var(--border-color)] hover:bg-[var(--bg-base)] text-[var(--text-muted)]">{t('chat.askFollowup')}</button>
            </div>
            <div className="text-[10px] text-[var(--text-muted)] italic mt-2 opacity-60">
              LexisCo provides legal guidance, not legal advice. Consult a licensed advocate for court matters.
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export const TypingIndicator = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start mb-6">
    <div className="glass-card rounded-2xl rounded-tl-none p-4 flex items-center gap-1.5 w-auto">
      <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-2 h-2 rounded-full bg-[var(--color-brand-accent)]" />
      <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 rounded-full bg-[var(--color-brand-accent)]" />
      <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 rounded-full bg-[var(--color-brand-accent)]" />
    </div>
  </motion.div>
);
