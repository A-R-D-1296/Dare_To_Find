import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Scale, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { authAPI } from '../services/api';
import { GlassCard } from '../components/common/GlassCard';
import { Spinner } from '../components/common/Spinner';

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Temporary mock login for UI building if backend fails
      const res = await authAPI.login({ email, password }).catch(() => {
        // mock fallback
        if (email === 'test@test.com' && password === 'password') {
          return { data: { token: 'mock-jwt-token', user: { name: 'Test User', email } } };
        }
        throw new Error("Invalid credentials");
      });
      
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid credentials. Please try again.');
      toast.error('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex text-[var(--text-base)]">
      {/* Left side: Illustration */}
      <div className="hidden lg:flex w-1/2 p-12 flex-col justify-between bg-[var(--bg-surface)] border-r border-[var(--border-color)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--color-brand-accent)] opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <Link to="/" className="flex items-center gap-2 z-10">
          <Scale className="w-8 h-8 text-[var(--color-brand-accent)]" />
          <span className="text-2xl font-bold font-serif">LexisCo</span>
        </Link>

        {/* CSS Animated Lottie replacement */}
        <div className="flex-1 flex items-center justify-center z-10 w-full relative">
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
                <Scale className="w-[80%] h-[80%] text-[var(--color-brand-accent)] animate-pulse-ring" />
            </div>
            <div className="text-center z-20 backdrop-blur-sm p-8 rounded-2xl border border-[var(--border-color)]">
              <h2 className="text-3xl font-serif font-bold mb-4">Empowering your pursuit of justice.</h2>
              <p className="text-[var(--text-muted)] text-lg max-w-md mx-auto">Get instantaneous, verified legal guidance from India's smartest AI assistant.</p>
            </div>
        </div>

        <div className="z-10 text-sm text-[var(--text-muted)]">
          &copy; {new Date().getFullYear()} LexisCo. Built for India.
        </div>
      </div>

      {/* Right side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center gap-2 mb-12">
            <Scale className="w-10 h-10 text-[var(--color-brand-accent)]" />
            <span className="text-3xl font-bold font-serif">LexisCo</span>
          </div>

          <GlassCard>
            <div className="mb-8">
              <h1 className="text-3xl font-bold font-serif mb-2">{t('auth.welcome')}</h1>
              <p className="text-[var(--text-muted)]">{t('auth.subtext')}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1 pl-1 opacity-80">{t('auth.email')}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg bg-[var(--bg-base)] border focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-accent)] transition-all ${error ? 'border-[var(--color-brand-danger)]' : 'border-[var(--border-color)]'}`}
                  placeholder="name@example.com"
                />
              </div>

              <div>
                <div className="flex items-center justify-between pl-1 mb-1 opacity-80">
                  <label className="block text-sm font-medium">{t('auth.password')}</label>
                  <a href="#" className="text-sm text-[var(--color-brand-accent)] hover:underline">{t('auth.forgot')}</a>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg bg-[var(--bg-base)] border focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-accent)] transition-all pr-12 ${error ? 'border-[var(--color-brand-danger)]' : 'border-[var(--border-color)]'}`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {error && <p className="text-[var(--color-brand-danger)] text-sm mt-2 pl-1">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 mt-4 bg-[var(--color-brand-accent)] text-black rounded-lg font-bold text-lg hover:bg-opacity-90 transition-all flex items-center justify-center"
              >
                {loading ? <Spinner size="sm" className="border-black border-t-transparent" /> : t('auth.loginBtn')}
              </button>
            </form>

            <div className="mt-8 text-center text-[var(--text-muted)] relative">
              <div className="absolute inset-x-0 top-1/2 h-[1px] bg-[var(--border-color)] z-0" />
              <span className="bg-[var(--bg-surface)] px-4 relative z-10 text-sm">
                {t('auth.or')}
              </span>
            </div>

            <button
              onClick={() => toast.error("Google OAuth not implemented in backend")}
              className="mt-6 w-full py-3 bg-white text-black border border-gray-300 rounded-lg font-semibold flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  <path fill="none" d="M1 1h22v22H1z" />
              </svg>
              Sign in with Google
            </button>

            <div className="mt-8 text-center">
              <p className="text-[var(--text-muted)] text-sm">
                {t('auth.noAccount').split('?')[0]}?{' '}
                <Link to="/signup" className="text-[var(--color-brand-accent)] hover:underline font-medium">
                  {t('auth.noAccount').split('?')[1]?.trim()}
                </Link>
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
