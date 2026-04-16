import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { GlassCard } from '../components/common/GlassCard';

export default function About() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-32 pb-16 max-w-4xl mx-auto px-6 w-full">
        <h1 className="text-4xl md:text-5xl font-bold font-serif mb-8 text-center">About LexisCo</h1>
        
        <GlassCard className="p-8 md:p-12 space-y-6 text-lg text-[var(--text-muted)] leading-relaxed">
          <p>
            <strong className="text-[var(--text-base)]">LexisCo</strong> was born from a simple observation: the Indian legal system, while comprehensive and fair, is often inaccessible to the common citizen due to complex terminology, high consultation costs, and bureaucratic hurdles.
          </p>
          <p>
            Our mission is to bridge this gap using advanced Artificial Intelligence. We've built an AI assistant specifically trained on the Indian Penal Code (IPC), Bharatiya Nyaya Sanhita (BNS), Consumer Protection Act, and various other essential Indian laws.
          </p>
          <h3 className="text-2xl font-serif text-[var(--text-base)] mt-8 mb-4">What Sets Us Apart</h3>
          <ul className="list-disc pl-6 space-y-3">
            <li><strong>Action-Oriented:</strong> We don't just explain the law. We tell you the exact steps you need to take.</li>
            <li><strong>Anti-Hallucination:</strong> Our AI is grounded. It references real sections and acts, reducing the risk of bad advice.</li>
            <li><strong>Bilingual Accessibility:</strong> Law available in English and Hindi to ensure a wider reach.</li>
          </ul>
          <div className="p-6 bg-[var(--bg-base)] rounded-xl mt-8 border border-[var(--border-color)]">
            <h4 className="font-bold text-[var(--color-brand-danger)] mb-2">Important Disclaimer</h4>
            <p className="text-sm">LexisCo is intended to provide legal guidance, educational information, and structural drafts. It does not replace a licensed advocate. For any actual legal proceedings, always consult with a registered legal professional in your jurisdiction.</p>
          </div>
        </GlassCard>
      </main>
      <Footer />
    </div>
  );
}
