import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Shield, FileText, CheckCircle, ArrowRight, Play, Scale, ChevronRight } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { GlassCard } from '../components/common/GlassCard';
import { Modal } from '../components/common/Modal';

const ParticleBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-[var(--color-brand-accent)] rounded-full opacity-20"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            y: [null, Math.random() * -500],
            opacity: [0.2, 0.8, 0],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--bg-base)]" />
    </div>
  );
};

const StatCounter = ({ end, label, suffix = "" }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime;
    const duration = 2000;
    
    const animate = (time) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);
      
      setCount(Math.floor(progress * end));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [end]);

  return (
    <div className="flex flex-col items-center">
      <div className="text-4xl md:text-5xl font-bold font-serif text-[var(--color-brand-accent)] mb-2">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm text-[var(--text-muted)] tracking-wider uppercase font-semibold">{label}</div>
    </div>
  );
};

export default function Landing() {
  const { t } = useTranslation();
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <ParticleBackground />
      <Navbar />

      <main className="flex-grow pt-32 pb-16">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 mb-24 md:mb-32">
          <div className="text-center max-w-4xl mx-auto mt-16 md:mt-24">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl md:text-7xl font-bold font-serif leading-tight mb-6"
            >
              {t('hero.title')}
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg md:text-xl text-[var(--text-muted)] mb-10"
            >
              {t('hero.subtitle')}
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link 
                to="/signup" 
                className="w-full sm:w-auto px-8 py-4 bg-[var(--color-brand-accent)] text-black rounded-xl font-bold text-lg hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(226,185,111,0.4)]"
              >
                {t('hero.startCase')}
              </Link>
              <button 
                onClick={() => setIsDemoOpen(true)}
                className="w-full sm:w-auto px-8 py-4 border border-[var(--border-color)] rounded-xl font-bold text-lg hover:bg-[var(--bg-surface)] transition-all flex items-center justify-center gap-2 text-[var(--text-base)]"
              >
                <Play className="w-5 h-5" />
                {t('hero.watchDemo')}
              </button>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="mt-12 flex flex-wrap items-center justify-center gap-4 md:gap-8 text-sm font-medium text-[var(--text-muted)]"
            >
              <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[var(--color-brand-success)]" /> {t('trust.coverage')}</span>
              <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[var(--color-brand-success)]" /> {t('trust.languages')}</span>
              <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[var(--color-brand-success)]" /> {t('trust.guidance')}</span>
            </motion.div>
          </div>
        </section>

        {/* Feature Cards */}
        <section id="features" className="max-w-7xl mx-auto px-6 mb-32 z-10 relative">
          <div className="grid md:grid-cols-3 gap-6">
            <GlassCard className="translate-y-0 hover:-translate-y-2 transition-transform duration-300">
              <Shield className="w-10 h-10 text-[var(--color-brand-accent)] mb-4" />
              <h3 className="text-xl font-bold font-serif mb-2">{t('features.step1Title')}</h3>
              <div className="flex gap-2 mt-4">
                {[1, 2, 3, 4].map(num => (
                  <div key={num} className="w-6 h-6 rounded-full border border-[var(--color-brand-accent)] flex items-center justify-center text-xs text-[var(--color-brand-accent)]">
                    {num}
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="translate-y-0 hover:-translate-y-2 transition-transform duration-300">
              <FileText className="w-10 h-10 text-[var(--color-brand-accent)] mb-4" />
              <h3 className="text-xl font-bold font-serif mb-2">{t('features.step2Title')}</h3>
              <p className="text-[var(--text-muted)]">{t('features.step2Desc')}</p>
            </GlassCard>

            <GlassCard className="translate-y-0 hover:-translate-y-2 transition-transform duration-300">
              <Scale className="w-10 h-10 text-[var(--color-brand-accent)] mb-4" />
              <h3 className="text-xl font-bold font-serif mb-2">{t('features.step3Title')}</h3>
              <p className="text-[var(--text-muted)]">{t('features.step3Desc')}</p>
            </GlassCard>
          </div>
        </section>

        {/* How it Works Stepper */}
        <section className="max-w-5xl mx-auto px-6 mb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-serif mb-4">How LexisCo Works</h2>
            <p className="text-[var(--text-muted)] text-lg">From confusion to clarity in four simple steps.</p>
          </div>

          <div className="flex flex-col md:flex-row justify-between relative">
            <div className="hidden md:block absolute top-[28px] left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-[var(--color-brand-accent)] to-transparent opacity-30 -z-10" />
            
            {[
              { title: "Describe", desc: "Explain your matter in plain Hindi or English" },
              { title: "Identify", desc: "AI instantly finds the exact Indian law" },
              { title: "Plan", desc: "Get a clear strategy on what to do" },
              { title: "Act", desc: "Generate FIRs or Legal Notices instantly" }
            ].map((step, idx) => (
              <div key={idx} className="flex flex-col items-center text-center mb-8 md:mb-0 relative z-10 w-full md:w-1/4 px-4">
                <div className="w-14 h-14 rounded-full bg-[var(--bg-surface)] border-2 border-[var(--color-brand-accent)] flex items-center justify-center text-xl font-bold text-[var(--color-brand-accent)] mb-4 shadow-[0_0_15px_rgba(226,185,111,0.2)]">
                  {idx + 1}
                </div>
                <h4 className="text-lg font-bold mb-2">{step.title}</h4>
                <p className="text-sm text-[var(--text-muted)]">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="max-w-6xl mx-auto px-6 py-12 border-t border-b border-[var(--border-color)] bg-[var(--bg-surface)]/30 backdrop-blur-sm rounded-3xl mb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCounter end={50000} label="Queries Answered" suffix="+" />
            <StatCounter end={15} label="Indian Acts Covered" suffix="+" />
            <StatCounter end={4} label="Languages" />
            <StatCounter end={98} label="Satisfaction" suffix="%" />
          </div>
        </section>
      </main>

      <Footer />

      <Modal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} title="LexisCo Demo">
        <div className="aspect-video bg-black rounded-lg flex items-center justify-center border border-[var(--border-color)]">
          <div className="text-[var(--text-muted)] flex flex-col items-center">
            <Play className="w-12 h-12 mb-4 opacity-50" />
            <p>Demo Video Placeholder</p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
