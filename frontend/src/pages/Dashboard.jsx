import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, Scale, User, Shield } from 'lucide-react';
import { Sidebar } from '../components/layout/Sidebar';
import { ChatInput } from '../components/chat/ChatInput';
import { ChatBubble, TypingIndicator } from '../components/chat/ChatBubble';
import { UrgencyBanner } from '../components/chat/UrgencyBanner';
import { EmptyState } from '../components/common/EmptyState';
import { LanguageToggle } from '../components/common/LanguageToggle';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { useChatStore } from '../store/chatStore';
import { checkUrgency } from '../utils/urgencyKeywords';
import { chatAPI } from '../services/api';

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUrgencyVisible, setIsUrgencyVisible] = useState(false);
  
  const { 
    activeChatId, 
    chats, 
    addMessage, 
    createNewSession, 
    isGenerating, 
    setIsGenerating 
  } = useChatStore();

  const messagesEndRef = useRef(null);

  const activeChat = chats.find(c => c.id === activeChatId) || null;
  const messages = activeChat?.messages || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  // Handle empty state initially
  useEffect(() => {
    if (!activeChatId && chats.length === 0) {
      createNewSession();
    }
  }, [activeChatId, chats.length, createNewSession]);

  const handleSend = async (text) => {
    let currentSessionId = activeChatId;
    if (!currentSessionId) {
      currentSessionId = createNewSession();
    }

    if (checkUrgency(text)) {
      setIsUrgencyVisible(true);
    } else {
      setIsUrgencyVisible(false);
    }

    // Add user message
    const userMsg = { id: Date.now(), role: 'user', text };
    addMessage(currentSessionId, userMsg);
    
    setIsGenerating(true);

    try {
      // Map existing history, then append the new message
      const history = messages.map(m => ({ role: m.role, content: m.text || m.raw_text || "" }));
      history.push({ role: 'user', content: text });

      const payload = {
        messages: history,
        context: { session_id: currentSessionId, language: i18n.language }
      };
      
      const response = await chatAPI.sendMessage(payload);

      const aiMsg = { 
        id: Date.now() + 1, 
        role: 'ai', 
        ...response.data
      };
      
      addMessage(currentSessionId, aiMsg);
    } catch (error) {
      console.error("Chat API Error:", error);
      const errorMsg = { 
        id: Date.now() + 1, 
        role: 'ai', 
        raw_text: "I'm sorry, I encountered a critical error connecting to my backend. Please check the console.",
        understanding: "I'm sorry, I encountered a critical error connecting to my backend.\n\nPlease check server logs."
      };
      addMessage(currentSessionId, errorMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSuggestionClick = (text) => {
    handleSend(text);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-base)]">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Top Header */}
        <header className="h-16 border-b border-[var(--border-color)] bg-[var(--bg-surface)] flex items-center justify-between px-4 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 md:hidden text-[var(--text-muted)] hover:text-[var(--text-base)] transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="font-semibold truncate max-w-[200px] md:max-w-md hidden sm:block">
              {activeChat?.title || "New Legal Query"}
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <ThemeToggle />
            <button className="w-8 h-8 rounded-full bg-[var(--color-brand-accent)]/20 flex items-center justify-center text-[var(--color-brand-accent)]">
              <User className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Chat Area Container */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative flex flex-col">
          <UrgencyBanner isVisible={isUrgencyVisible} onClose={() => setIsUrgencyVisible(false)} />

          <div className="max-w-4xl mx-auto w-full px-4 py-8 flex-1 flex flex-col">
            {messages.length === 0 ? (
              <div className="my-auto">
                <EmptyState 
                  icon={Scale}
                  title={t('dashboard.emptyTitle')}
                  subtitle={t('dashboard.emptySubtitle')}
                  action={
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8 max-w-2xl text-left">
                      {[
                        t('dashboard.suggestion1'),
                        t('dashboard.suggestion2'),
                        t('dashboard.suggestion3'),
                        t('dashboard.suggestion4')
                      ].map((s, i) => (
                        <button
                          key={i}
                          onClick={() => handleSuggestionClick(s)}
                          className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] hover:border-[var(--color-brand-accent)]/50 hover:bg-[var(--color-brand-accent)]/5 transition-all text-sm text-[var(--text-muted)] hover:text-[var(--text-base)] flex items-start gap-3"
                        >
                          <Shield className="w-5 h-5 text-[var(--color-brand-accent)] shrink-0" />
                          <span>{s}</span>
                        </button>
                      ))}
                    </div>
                  }
                />
              </div>
            ) : (
              <div className="flex flex-col">
                {messages.map((msg) => (
                  <ChatBubble key={msg.id} message={msg} onQuickAction={handleSend} />
                ))}
                {isGenerating && <TypingIndicator />}
                <div ref={messagesEndRef} className="h-4" />
              </div>
            )}
          </div>
        </div>

        <ChatInput onSend={handleSend} disabled={isGenerating} />
      </main>
    </div>
  );
}
