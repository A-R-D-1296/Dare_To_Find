import React, { useState } from 'react';
import { Settings as SettingsIcon, Bell, Shield, Download, Trash2, Globe, Bug } from 'lucide-react';
import { Sidebar } from '../components/layout/Sidebar';
import { GlassCard } from '../components/common/GlassCard';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { LanguageToggle } from '../components/common/LanguageToggle';
import { useTranslation } from 'react-i18next';
import { useChatStore } from '../store/chatStore';
import toast from 'react-hot-toast';

export default function Settings() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { t } = useTranslation();
  const { setChats } = useChatStore();

  const [toggles, setToggles] = useState({
    emailNotifs: true,
    newsletter: false,
    compactChat: false
  });

  const handleToggle = (key) => setToggles(p => ({ ...p, [key]: !p[key] }));

  const exportData = () => {
    const data = localStorage.getItem('lexisco-chat');
    const blob = new Blob([data || '{}'], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lexisco_data_export.json';
    a.click();
    toast.success('Data exported successfully');
  };

  const deleteHistory = () => {
    if (window.confirm('Are you strictly sure you want to delete all chat history? This cannot be undone.')) {
      setChats([]);
      toast.success('Chat history wiped');
    }
  };

  return (
    <div className="flex h-screen bg-[var(--bg-base)] text-[var(--text-base)]">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar">
        <header className="h-16 border-b border-[var(--border-color)] bg-[var(--bg-surface)] flex items-center px-4 sticky top-0 z-20">
          <button className="md:hidden mr-4 cursor-pointer text-[var(--text-muted)]" onClick={() => setIsSidebarOpen(true)}>
             <SettingsIcon className="w-6 h-6" />
          </button>
          <h1 className="font-semibold text-lg">Settings & Preferences</h1>
        </header>

        <div className="max-w-3xl mx-auto w-full px-4 py-8 space-y-6">
          
          {/* Appearance */}
          <GlassCard className="p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] mb-6 flex items-center gap-2">
              <SettingsIcon className="w-4 h-4" /> Appearance
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Interface Theme</div>
                  <div className="text-sm text-[var(--text-muted)]">Toggle dark mode</div>
                </div>
                <ThemeToggle />
              </div>
              <div className="w-full h-px bg-[var(--border-color)]" />
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Compact Chat Density</div>
                  <div className="text-sm text-[var(--text-muted)]">Reduce spacing in chat bubbles</div>
                </div>
                <button 
                  onClick={() => handleToggle('compactChat')}
                  className={`w-12 h-6 rounded-full transition-colors relative ${toggles.compactChat ? 'bg-[var(--color-brand-accent)]' : 'bg-[var(--bg-base)] border border-[var(--border-color)]'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${toggles.compactChat ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </GlassCard>

          {/* Language & Region */}
          <GlassCard className="p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] mb-6 flex items-center gap-2">
              <Globe className="w-4 h-4" /> Language & Region
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Interface Language</div>
                  <div className="text-sm text-[var(--text-muted)]">Change text language immediately</div>
                </div>
                <LanguageToggle />
              </div>
              <div className="w-full h-px bg-[var(--border-color)]" />
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Legal Jurisdiction</div>
                  <div className="text-sm text-[var(--text-muted)]">For localized state rules</div>
                </div>
                <select className="px-3 py-1.5 border border-[var(--border-color)] bg-[var(--bg-base)] rounded-lg text-sm outline-none">
                  <option>All India (Central Acts)</option>
                  <option disabled>State Specific (Coming Soon)</option>
                </select>
              </div>
            </div>
          </GlassCard>

          {/* Notifications */}
          <GlassCard className="p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] mb-6 flex items-center gap-2">
              <Bell className="w-4 h-4" /> Notifications
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Email Notifications</div>
                  <div className="text-sm text-[var(--text-muted)]">Receive chat exports via email</div>
                </div>
                <button 
                  onClick={() => handleToggle('emailNotifs')}
                  className={`w-12 h-6 rounded-full transition-colors relative ${toggles.emailNotifs ? 'bg-[var(--color-brand-accent)]' : 'bg-[var(--bg-base)] border border-[var(--border-color)]'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${toggles.emailNotifs ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Legal Updates</div>
                  <div className="text-sm text-[var(--text-muted)]">Quarterly newsletter on Indian laws</div>
                </div>
                <button 
                  onClick={() => handleToggle('newsletter')}
                  className={`w-12 h-6 rounded-full transition-colors relative ${toggles.newsletter ? 'bg-[var(--color-brand-accent)]' : 'bg-[var(--bg-base)] border border-[var(--border-color)]'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${toggles.newsletter ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </GlassCard>

          {/* Privacy & Data */}
          <GlassCard className="p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] mb-6 flex items-center gap-2">
              <Shield className="w-4 h-4" /> Privacy & Data
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <button onClick={exportData} className="flex items-center justify-center py-3 border border-[var(--border-color)] bg-[var(--bg-base)] hover:bg-[var(--bg-surface)] hover:text-[var(--color-brand-accent)] rounded-xl gap-2 font-medium transition-colors">
                  <Download className="w-4 h-4" /> Export My Data
               </button>
               <button onClick={deleteHistory} className="flex items-center justify-center py-3 border border-red-500/30 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl gap-2 font-medium transition-colors">
                  <Trash2 className="w-4 h-4" /> Delete Chat History
               </button>
            </div>
          </GlassCard>

          {/* About */}
          <div className="text-center text-sm text-[var(--text-muted)] py-4">
             <div className="font-bold font-serif text-[var(--text-base)] mb-1">LexisCo v1.0.0</div>
             <div className="flex items-center justify-center gap-4 mb-2">
               <a href="#" className="hover:underline">Privacy Policy</a>
               <span>&bull;</span>
               <a href="#" className="hover:underline">Terms of Service</a>
             </div>
             <a href="#" className="flex items-center justify-center gap-1 hover:text-[var(--color-brand-accent)] transition-colors"><Bug className="w-3 h-3" /> Report a Bug</a>
          </div>

        </div>
      </main>
    </div>
  );
}
