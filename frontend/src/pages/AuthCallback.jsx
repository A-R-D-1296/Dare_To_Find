import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../services/supabaseClient';
import { Scale } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [status, setStatus] = useState('Completing sign in...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase JS client automatically handles the PKCE code exchange
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          toast.error(error.message);
          setStatus('Login failed. Redirecting...');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        if (data?.session) {
          const session = data.session;
          const user = {
            id: session.user.id,
            email: session.user.email,
            name:
              session.user.user_metadata?.full_name ||
              session.user.user_metadata?.name ||
              session.user.email,
          };
          login(session.access_token, user);
          toast.success(`Welcome, ${user.name}!`);
          navigate('/dashboard');
        } else {
          setStatus('No session found. Redirecting...');
          setTimeout(() => navigate('/login'), 2000);
        }
      } catch (err) {
        toast.error('Authentication error. Please try again.');
        navigate('/login');
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-base)] text-[var(--text-base)]">
      <div className="flex flex-col items-center gap-6">
        <Scale className="w-12 h-12 text-[var(--color-brand-accent)] animate-pulse" />
        <span className="text-2xl font-bold font-serif">LexisCo</span>
        <div className="flex items-center gap-3 text-[var(--text-muted)]">
          <svg className="animate-spin w-5 h-5 text-[var(--color-brand-accent)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          <span>{status}</span>
        </div>
      </div>
    </div>
  );
}
