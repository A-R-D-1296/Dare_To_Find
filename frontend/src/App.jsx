import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useThemeStore } from './store/themeStore';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { GlassCard } from './components/common/GlassCard';
import { Spinner } from './components/common/Spinner';

// Lazy loaded pages to optimize bundle size
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const About = lazy(() => import('./pages/About'));

const Dashboard = lazy(() => import('./pages/Dashboard'));
const History = lazy(() => import('./pages/History'));
const FIRGenerator = lazy(() => import('./pages/FIRGenerator'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center p-4">
    <GlassCard className="flex flex-col items-center justify-center p-8 gap-4 w-64 h-64">
      <Spinner size="lg" />
      <span className="text-[var(--text-muted)] animate-pulse">Loading...</span>
    </GlassCard>
  </div>
);

function App() {
  const { theme } = useThemeStore();

  useEffect(() => {
    // Initial theme setup handled by ThemeToggle and the HTML element
    const root = window.document.documentElement;
    if (theme === 'system') {
      root.classList.add(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  return (
    <BrowserRouter>
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: 'var(--bg-surface)',
            color: 'var(--text-base)',
            border: '1px solid var(--border-color)',
            backdropFilter: 'blur(20px)',
          },
          success: {
            iconTheme: {
              primary: 'var(--color-brand-success)',
              secondary: 'var(--bg-surface)',
            },
          },
          error: {
            iconTheme: {
              primary: 'var(--color-brand-danger)',
              secondary: 'var(--bg-surface)',
            },
          },
        }}
      />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/about" element={<About />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/history" element={<History />} />
            <Route path="/fir-generator" element={<FIRGenerator />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
