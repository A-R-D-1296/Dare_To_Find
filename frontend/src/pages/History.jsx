import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { History as HistoryIcon, Clock, MessageSquare, Trash2, Menu } from 'lucide-react';
import { Sidebar } from '../components/layout/Sidebar';
import { useChatStore } from '../store/chatStore';
import { EmptyState } from '../components/common/EmptyState';
import { cn } from '../../utils/cn';

export default function History() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { chats, setActiveChat, setChats } = useChatStore();
  const [selectedChat, setSelectedChat] = useState(null);

  // Auto-select first chat if none selected
  useEffect(() => {
    if (chats.length > 0 && !selectedChat) {
      setSelectedChat(chats[0]);
    }
  }, [chats, selectedChat]);

  const filteredChats = chats.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase()) || 
    (c.messages.length > 0 && c.messages[0].text && c.messages[0].text.toLowerCase().includes(search.toLowerCase()))
  );

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this session?")) {
       setChats(chats.filter(c => c.id !== id));
       if (selectedChat?.id === id) {
         setSelectedChat(null);
       }
    }
  };

  const handleContinue = () => {
    if (selectedChat) {
      setActiveChat(selectedChat.id);
      navigate('/dashboard');
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-base)]">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="flex-1 flex flex-col min-w-0 h-full">
        <header className="h-16 border-b border-[var(--border-color)] bg-[var(--bg-surface)] flex items-center px-4 sticky top-0 z-20">
          <Menu className="w-6 h-6 md:hidden mr-4 cursor-pointer text-[var(--text-muted)]" onClick={() => setIsSidebarOpen(true)} />
          <h1 className="font-semibold text-lg flex items-center gap-2">
            <HistoryIcon className="w-5 h-5 text-[var(--color-brand-accent)]" />
            Chat History
          </h1>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Column: List */}
          <div className="w-full md:w-[350px] border-r border-[var(--border-color)] flex flex-col overflow-hidden bg-[var(--bg-surface)]/30">
            <div className="p-4 border-b border-[var(--border-color)]">
              <input
                type="text"
                placeholder="Search history..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-[var(--bg-base)] border border-[var(--border-color)] focus:border-[var(--color-brand-accent)] outline-none text-sm text-[var(--text-base)] placeholder:text-[var(--text-muted)]"
              />
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
              {filteredChats.length === 0 ? (
                 <div className="text-center text-sm text-[var(--text-muted)] mt-10">No sessions found.</div>
              ) : (
                filteredChats.map(chat => (
                  <div 
                    key={chat.id}
                    onClick={() => setSelectedChat(chat)}
                    className={cn(
                      "p-3 rounded-xl mb-2 cursor-pointer transition-colors border group",
                      selectedChat?.id === chat.id ? "bg-[var(--color-brand-accent)]/10 border-[var(--color-brand-accent)]/30" : "bg-transparent border-transparent hover:bg-[var(--bg-surface)] hover:border-[var(--border-color)]"
                    )}
                  >
                     <div className="flex justify-between items-start mb-1">
                        <h4 className={cn("font-semibold text-sm truncate pr-4", selectedChat?.id === chat.id ? "text-[var(--color-brand-accent)]" : "text-[var(--text-base)]")}>
                          {chat.title}
                        </h4>
                        <button onClick={(e) => handleDelete(e, chat.id)} className="text-[var(--text-muted)] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 className="w-4 h-4" />
                        </button>
                     </div>
                     <p className="text-xs text-[var(--text-muted)] line-clamp-2 mb-2">
                       {chat.messages.length > 0 ? (chat.messages.find(m => m.role === 'user')?.text || 'Empty session') : 'Empty session'}
                     </p>
                     <div className="flex items-center gap-3 text-[10px] text-[var(--text-muted)] font-medium">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(chat.created_at).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {chat.messages.length} msgs</span>
                     </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Column: Replay */}
          <div className="hidden md:flex flex-1 flex-col bg-[var(--bg-base)] overflow-hidden">
            {selectedChat ? (
              <>
                <div className="p-4 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-surface)]/50">
                   <h3 className="font-semibold">{selectedChat.title}</h3>
                   <button 
                     onClick={handleContinue}
                     className="px-4 py-2 bg-[var(--color-brand-accent)] text-black rounded-lg text-sm font-bold hover:bg-opacity-90 shadow-sm"
                   >
                     Continue Chat
                   </button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                   {selectedChat.messages.length === 0 ? (
                     <div className="text-center text-[var(--text-muted)] mt-20">This session is empty.</div>
                   ) : (
                     selectedChat.messages.map((msg, i) => (
                       <div key={i} className={cn("flex w-full", msg.role === 'ai' ? "justify-start" : "justify-end")}>
                         <div className={cn("max-w-[80%] rounded-2xl p-4 text-sm", msg.role === 'ai' ? "glass-card text-[var(--text-base)] rounded-tl-none" : "bg-[var(--color-brand-accent)]/80 text-black rounded-tr-none")}>
                            {msg.role === 'user' ? msg.text : (msg.understanding || msg.raw_text || msg.text)}
                         </div>
                       </div>
                     ))
                   )}
                </div>
              </>
            ) : (
              <div className="m-auto">
                <EmptyState icon={HistoryIcon} title="Select a conversation" subtitle="Choose a chat from the sidebar to view its history here." />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
