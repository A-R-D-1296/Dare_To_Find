import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Save, BookOpen, FileText, ChevronRight } from 'lucide-react';
import { Sidebar } from '../components/layout/Sidebar';
import { GlassCard } from '../components/common/GlassCard';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function Profile() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, updateUser } = useAuthStore();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    state: user?.state || 'Maharashtra'
  });

  const states = ["Andhra Pradesh", "Delhi", "Gujarat", "Karnataka", "Maharashtra", "Tamil Nadu", "Uttar Pradesh", "West Bengal", "Other"];

  const handleSave = (e) => {
    e.preventDefault();
    updateUser(formData);
    toast.success('Profile updated successfully');
  };

  return (
    <div className="flex h-screen bg-[var(--bg-base)]">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar">
        <header className="h-16 border-b border-[var(--border-color)] bg-[var(--bg-surface)] flex items-center px-4 sticky top-0 z-20">
          <button className="md:hidden mr-4 cursor-pointer text-[var(--text-muted)]" onClick={() => setIsSidebarOpen(true)}>
             <User className="w-6 h-6" />
          </button>
          <h1 className="font-semibold text-lg">My Profile</h1>
        </header>

        <div className="max-w-4xl mx-auto w-full px-4 py-8">
          
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left Col: Edit Form */}
            <div className="w-full md:w-2/3">
              <GlassCard className="mb-6">
                <div className="flex items-center gap-6 mb-8 border-b border-[var(--border-color)] pb-6">
                  <div className="relative group cursor-pointer">
                    <div className="w-24 h-24 rounded-full bg-[var(--color-brand-accent)] flex items-center justify-center text-4xl text-black font-bold border-4 border-[var(--bg-surface)] shadow-lg transition-transform group-hover:scale-105">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-xs font-semibold">Change</span>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold font-serif">{user?.name || 'User'}</h2>
                    <p className="text-[var(--text-muted)] mt-1">Member since {new Date().getFullYear()}</p>
                  </div>
                </div>

                <form onSubmit={handleSave} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 block flex items-center gap-2"><User className="w-3 h-3" /> Full Name</label>
                      <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border border-[var(--border-color)] bg-[var(--bg-surface)] rounded-lg focus:border-[var(--color-brand-accent)] focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 block flex items-center gap-2"><Mail className="w-3 h-3" /> Email</label>
                      <input disabled value={formData.email} className="w-full px-4 py-2 border border-[var(--border-color)] bg-[var(--bg-base)] text-[var(--text-muted)] rounded-lg cursor-not-allowed" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 block flex items-center gap-2"><Phone className="w-3 h-3" /> Phone</label>
                      <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2 border border-[var(--border-color)] bg-[var(--bg-surface)] rounded-lg focus:border-[var(--color-brand-accent)] focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 block flex items-center gap-2"><MapPin className="w-3 h-3" /> State</label>
                      <select value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="w-full px-4 py-2 border border-[var(--border-color)] bg-[var(--bg-surface)] rounded-lg focus:border-[var(--color-brand-accent)] focus:outline-none appearance-none">
                        {states.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  
                  <div className="pt-4 flex justify-end">
                    <button type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-[var(--color-brand-accent)] text-black rounded-lg font-bold hover:bg-opacity-90 shadow-md transition-all active:scale-95">
                      <Save className="w-4 h-4" /> Save Changes
                    </button>
                  </div>
                </form>
              </GlassCard>
            </div>

            {/* Right Col: Legal Profile */}
            <div className="w-full md:w-1/3">
              <h3 className="font-serif font-bold text-xl mb-4 ml-1">Legal Profile</h3>
              
              <div className="space-y-4">
                <GlassCard className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded bg-blue-500/20 flex items-center justify-center text-blue-500">
                      <BookmarkIcon className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold">Saved Laws</h4>
                  </div>
                  <ul className="space-y-2 text-sm text-[var(--text-muted)]">
                    <li className="flex justify-between items-center group cursor-pointer hover:text-[var(--text-base)]">
                      <span>Section 420 IPC</span> <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </li>
                    <li className="flex justify-between items-center group cursor-pointer hover:text-[var(--text-base)]">
                      <span>Article 21 Constitution</span> <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </li>
                    <li className="flex justify-between items-center group cursor-pointer hover:text-[var(--text-base)]">
                      <span>Consumer Act S.35</span> <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </li>
                  </ul>
                </GlassCard>

                <GlassCard className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                      <FileText className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold">Generated Docs</h4>
                  </div>
                  <ul className="space-y-2 text-sm text-[var(--text-muted)]">
                    <li className="flex justify-between items-center group cursor-pointer hover:text-[var(--text-base)]">
                      <span className="truncate pr-2">Theft FIR Draft</span> <span className="text-xs shrink-0">Oct 12</span>
                    </li>
                    <li className="flex justify-between items-center group cursor-pointer hover:text-[var(--text-base)]">
                     <span className="truncate pr-2">Flipkart Complaint</span> <span className="text-xs shrink-0">Nov 03</span>
                    </li>
                  </ul>
                </GlassCard>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

// Inline icon component since it wasn't imported
const BookmarkIcon = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
  </svg>
);
