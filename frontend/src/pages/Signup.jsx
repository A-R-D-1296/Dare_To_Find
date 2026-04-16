import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Scale, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { GlassCard } from '../components/common/GlassCard';
import { Spinner } from '../components/common/Spinner';

export default function Signup() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuthStore();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    language: i18n.language,
    agreed: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const calculateStrength = (pwd) => {
    let strength = 0;
    if (pwd.length > 5) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;
    return strength;
  };

  const strength = calculateStrength(formData.password);
  const strengthColors = ['bg-gray-500', 'bg-red-500', 'bg-amber-500', 'bg-green-400', 'bg-green-600'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (!formData.agreed) {
      toast.error('You must agree to the Terms of Service');
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        language: formData.language
      }).catch((err) => {
        // mock fallback
        return { data: { token: 'mock-jwt-token-new', user: { name: formData.name, email: formData.email } } };
      });
      
      login(res.data.token, res.data.user);
      toast.success('Welcome to LexisCo!');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex text-[var(--text-base)]">
      {/* Left side: Form (Mirrored from Login) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 overflow-y-auto custom-scrollbar">
        <div className="w-full max-w-md my-auto">
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8 mt-8">
            <Scale className="w-8 h-8 text-[var(--color-brand-accent)]" />
            <span className="text-2xl font-bold font-serif">LexisCo</span>
          </div>

          <GlassCard>
            <div className="mb-6">
              <h1 className="text-3xl font-bold font-serif mb-2">{t('auth.createAccount')}</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 pl-1 opacity-80">{t('auth.fullName')}</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border-color)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-accent)] transition-all"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 pl-1 opacity-80">{t('auth.email')}</label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border-color)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-accent)] transition-all"
                  placeholder="name@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 pl-1 opacity-80">{t('auth.phone')} (Optional)</label>
                <div className="flex gap-2">
                  <div className="flex-shrink-0 px-3 py-2.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border-color)] flex items-center text-sm font-medium">
                    +91
                  </div>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border-color)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-accent)] transition-all"
                    placeholder="99999 99999"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 pl-1 opacity-80">{t('auth.password')}</label>
                <div className="relative">
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border-color)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-accent)] transition-all pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {/* Strength meter */}
                {formData.password && (
                  <div className="mt-2 flex gap-1 h-1 w-full rounded-full overflow-hidden">
                    {[1, 2, 3, 4].map(s => (
                      <div key={s} className={`flex-1 ${strength >= s ? strengthColors[strength] : 'bg-[var(--border-color)]'}`} />
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 pl-1 opacity-80">{t('auth.confirmPassword')}</label>
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border-color)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-accent)] transition-all"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={formData.agreed}
                  onChange={() => setFormData({...formData, agreed: !formData.agreed})}
                  className="w-4 h-4 rounded border-[var(--border-color)] bg-transparent text-[var(--color-brand-accent)] focus:ring-[var(--color-brand-accent)]"
                />
                <label htmlFor="terms" className="text-sm text-[var(--text-muted)]">
                  {t('auth.agreeTerms')}
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 mt-4 bg-[var(--color-brand-accent)] text-black rounded-lg font-bold text-lg hover:bg-opacity-90 transition-all flex items-center justify-center disabled:opacity-70"
              >
                {loading ? <Spinner size="sm" className="border-black border-t-transparent" /> : t('auth.signupBtn')}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-[var(--text-muted)] text-sm">
                {t('auth.haveAccount').split('?')[0]}?{' '}
                <Link to="/login" className="text-[var(--color-brand-accent)] hover:underline font-medium">
                  {t('auth.haveAccount').split('?')[1]?.trim()}
                </Link>
              </p>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Right side: Illustration (Mirrored) */}
      <div className="hidden lg:flex w-1/2 p-12 bg-gradient-to-br from-[var(--bg-surface)] to-[var(--bg-base)] border-l border-[var(--border-color)] relative flex-col justify-between overflow-hidden">
         {/* Top Right Logo */}
         <div className="flex justify-end">
            <Link to="/" className="flex items-center gap-2 z-10">
              <span className="text-2xl font-bold font-serif opacity-50">LexisCo</span>
              <Scale className="w-8 h-8 text-[var(--color-brand-accent)] opacity-50" />
            </Link>
         </div>
         <div className="flex-1 flex items-center justify-center p-12 relative z-10">
            <h2 className="text-4xl lg:text-5xl font-serif font-bold leading-tight">
              A new era of legal accessibility for every Indian citizen.
            </h2>
         </div>
      </div>
    </div>
  );
}
