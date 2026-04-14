import React, { useState, useEffect } from 'react';
import { 
  Scale, 
  Search, 
  MessageSquare, 
  FileText, 
  ChevronRight, 
  CheckCircle2, 
  Flag, 
  Mic, 
  Send,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const App = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { title: "Describe Issue", icon: <MessageSquare className="w-4 h-4" /> },
    { title: "Legal Analysis", icon: <Search className="w-4 h-4" /> },
    { title: "Draft Action", icon: <FileText className="w-4 h-4" /> },
    { title: "Take Action", icon: <Flag className="w-4 h-4" /> }
  ];

  const handleSend = () => {
    if (!input.trim()) return;
    
    const newMsg = { role: 'user', content: input };
    setMessages([...messages, newMsg]);
    setInput('');
    
    if (!isStarted) setIsStarted(true);

    // Mock response after delay
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: "I've analyzed your situation based on the Bharatiya Nyaya Sanhita (BNS) and Consumer Protection Act. Let's proceed step-by-step.",
        sections: ["BNS Section 318 (Cheating)", "Consumer Protection Act 2019"],
        recommendation: "Generate a formal consumer complaint notice."
      }]);
      setCurrentStep(1);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="h-16 border-b border-zinc-800 flex items-center justify-between px-8 bg-background sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Scale className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight">Lexis<span className="text-primary">Co</span></span>
        </div>
        <div className="flex items-center gap-6 text-sm text-zinc-400">
          <a href="#" className="hover:text-primary transition-colors">How it works</a>
          <a href="#" className="hover:text-primary transition-colors">Resources</a>
          <button className="px-4 py-2 bg-zinc-800 text-white rounded-full hover:bg-zinc-700 transition-colors border border-zinc-700">
            Sign In
          </button>
        </div>
      </nav>

      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar - Step Guide */}
        {isStarted && (
          <motion.aside 
            initial={{ x: -250 }}
            animate={{ x: 0 }}
            className="w-80 border-r border-zinc-800 p-6 hidden lg:block overflow-y-auto"
          >
            <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-6">Action Roadmap</h3>
            <div className="space-y-0">
              {steps.map((step, idx) => (
                <div key={idx} className="step-indicator">
                  <div className={`step-dot ${idx <= currentStep ? 'step-dot-active' : ''}`}>
                    {idx < currentStep ? <CheckCircle2 className="w-4 h-4 text-white" /> : step.icon}
                  </div>
                  <div className="ml-2">
                    <h4 className={`text-sm font-medium ${idx === currentStep ? 'text-white' : 'text-zinc-500'}`}>
                      {step.title}
                    </h4>
                    {idx === currentStep && (
                      <p className="text-xs text-zinc-400 mt-1">Step {idx + 1} is in progress</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 p-4 rounded-xl bg-zinc-900 border border-zinc-800">
              <div className="flex items-center gap-2 text-primary mb-2">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-xs font-bold uppercase">Safe AI Guard</span>
              </div>
              <p className="text-[10px] text-zinc-500 italic">
                All guidance is grounded in verified legal documents. I will not hallucinate laws.
              </p>
            </div>
          </motion.aside>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col relative">
          {!isStarted ? (
            <div className="flex-1 flex flex-center flex-col items-center justify-center p-8 max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6 inline-block border border-primary/20">
                  Justice. Accessible. Everywhere.
                </span>
                <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
                  Solve your <span className="gradient-text">legal problems</span> step-by-step.
                </h1>
                <p className="text-zinc-400 text-lg mb-12 max-w-2xl mx-auto">
                  Explain your issue in simple Hindi or English. Our AI mentor guides you from understanding the law to taking real legal action.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 w-full max-w-3xl">
                  {[
                    "Unfair refund refusal",
                    "How to file an RTI?",
                    "FIR process for theft"
                  ].map((example, i) => (
                    <button 
                      key={i}
                      onClick={() => setInput(example)}
                      className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-300 hover:border-primary/50 transition-all text-left"
                    >
                      "{example}"
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 max-w-4xl mx-auto w-full">
              <AnimatePresence>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] rounded-2xl p-4 ${
                      msg.role === 'user' 
                        ? 'bg-primary text-white ml-12' 
                        : 'glass-morphism border border-zinc-800 mr-12'
                    }`}>
                      <p className="text-sm md:text-base leading-relaxed">{msg.content}</p>
                      
                      {msg.sections && (
                        <div className="mt-4 pt-4 border-t border-zinc-800">
                          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">Relevant Sections</span>
                          <div className="flex flex-wrap gap-2">
                            {msg.sections.map((s, idx) => (
                              <span key={idx} className="bg-zinc-800 text-zinc-300 px-2 py-1 rounded text-[11px] border border-zinc-700">
                                {s}
                              </span>
                            ))}
                          </div>
                          {msg.recommendation && (
                            <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-emerald-400 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-xs font-semibold text-emerald-400 uppercase">Action Recommendation</p>
                                <p className="text-sm text-zinc-100">{msg.recommendation}</p>
                                <button className="mt-2 text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1">
                                  Generate Notice <ChevronRight className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 md:p-8 border-t border-zinc-800 bg-background/80 backdrop-blur-sm sticky bottom-0">
            <div className="max-w-4xl mx-auto relative group">
              <input 
                type="text"
                placeholder="Explain your situation in Hindi or English..."
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl px-6 py-4 pr-16 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-white placeholder:text-zinc-500"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              />
              <div className="absolute right-3 top-3 flex items-center gap-2">
                <button className="p-2 text-zinc-500 hover:text-white transition-colors">
                  <Mic className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleSend}
                  className="p-2 bg-primary text-white rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-primary/20"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
            <p className="text-center text-[10px] text-zinc-600 mt-4 uppercase tracking-tighter">
              ⚠️ Disclaimer: LexisCo provides legal guidance, not formal legal advice. Please consult a lawyer.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
