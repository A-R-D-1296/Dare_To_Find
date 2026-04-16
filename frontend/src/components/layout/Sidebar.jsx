import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, MessageSquare, Settings, Scale, LogOut, FileText, History } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import { chatAPI } from '../../services/api';
import { cn } from '../../utils/cn';

export const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { chats, activeChatId, setActiveChat, createNewSession, setChats } = useChatStore();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await chatAPI.getHistory();
        setChats(res.data);
      } catch (err) {
        console.error("Failed to load chat history", err);
      }
    };
    // fetchHistory(); // Mocked for now until backend is fully integrated
  }, [setChats]);

  const handleNewChat = () => {
    const newId = createNewSession();
    navigate('/dashboard');
    if (onClose) onClose();
  };

  const handleSelectChat = (id) => {
    setActiveChat(id);
    navigate('/dashboard');
    if (onClose) onClose();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={onClose}
        />
      )}
      
      {/* Sidebar Container */}
      <div
        className={cn(
          "fixed md:static inset-y-0 left-0 z-50 w-[260px] bg-[var(--bg-surface)] border-r border-[var(--border-color)] flex flex-col transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Scale className="w-6 h-6 text-[var(--color-brand-accent)]" />
            <span className="text-xl font-bold font-serif">LexisCo</span>
          </Link>
        </div>

        <div className="p-4">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--color-brand-accent)] text-black rounded-lg font-semibold hover:bg-opacity-90 transition-all active:scale-95 shadow-md"
          >
            <Plus className="w-5 h-5" />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
          <h3 className="px-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Recent Chats</h3>
          
          {chats.length === 0 ? (
            <div className="px-4 text-sm text-[var(--text-muted)] italic">No recent chats</div>
          ) : (
            <div className="space-y-1">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => handleSelectChat(chat.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                    activeChatId === chat.id
                      ? "bg-[var(--color-brand-accent)]/10 text-[var(--color-brand-accent)]"
                      : "hover:bg-[var(--bg-base)] text-[var(--text-muted)] hover:text-[var(--text-base)]"
                  )}
                >
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  <span className="truncate text-sm">{chat.title}</span>
                </button>
              ))}
            </div>
          )}

          <div className="mt-8">
            <h3 className="px-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Tools</h3>
            <div className="space-y-1">
              <Link to="/fir-generator" className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-[var(--text-muted)] hover:bg-[var(--bg-base)] hover:text-[var(--text-base)] transition-colors">
                <FileText className="w-4 h-4 shrink-0" />
                <span className="text-sm">Document Generator</span>
              </Link>
              <Link to="/history" className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-[var(--text-muted)] hover:bg-[var(--bg-base)] hover:text-[var(--text-base)] transition-colors">
                <History className="w-4 h-4 shrink-0" />
                <span className="text-sm">History Log</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-[var(--border-color)]">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-10 h-10 rounded-full bg-[var(--color-brand-accent)]/20 flex items-center justify-center text-[var(--color-brand-accent)] font-bold shrink-0">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <div className="truncate text-sm font-semibold text-[var(--text-base)]">{user?.name || 'User'}</div>
              <div className="truncate text-xs text-[var(--text-muted)]">{user?.email || ''}</div>
            </div>
          </div>
          
          <div className="flex justify-between px-2">
            <Link to="/profile" className="p-2 text-[var(--text-muted)] hover:text-[var(--color-brand-accent)] rounded-lg hover:bg-[var(--bg-base)] transition-colors">
              <Settings className="w-5 h-5" />
            </Link>
            <button onClick={handleLogout} className="p-2 text-[var(--color-brand-danger)] hover:bg-red-500/10 rounded-lg transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
