import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { FileText, Download, Copy, Share2, ArrowRight, ArrowLeft, Menu } from 'lucide-react';
import toast from 'react-hot-toast';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { GlassCard } from '../components/common/GlassCard';
import { Spinner } from '../components/common/Spinner';
import { Modal } from '../components/common/Modal';
import { documentAPI } from '../services/api';

export default function FIRGenerator() {
  const [activeTab, setActiveTab] = useState('fir');
  const [step, setStep] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDoc, setGeneratedDoc] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form Data State
  const [formData, setFormData] = useState({
    complainantName: '',
    fatherName: '',
    address: '',
    phone: '',
    dateOfIncident: '',
    timeOfIncident: '',
    location: '',
    natureOfOffence: '',
    accusedName: '',
    description: '',
    evidence: []
  });

  const evidenceOptions = ['CCTV', 'Photos', 'Documents', 'Witness Testimony', 'Digital Records'];

  const handleNext = () => setStep(s => Math.min(s + 1, 3));
  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  const toggleEvidence = (ev) => {
    setFormData(prev => ({
      ...prev,
      evidence: prev.evidence.includes(ev) 
        ? prev.evidence.filter(e => e !== ev) 
        : [...prev.evidence, ev]
    }));
  };

  const generateDocument = async () => {
    setIsGenerating(true);
    try {
      let docType = 'FIR';
      if (activeTab === 'complaint') docType = 'COMPLAINT';
      if (activeTab === 'notice') docType = 'LEGAL NOTICE';

      const response = await documentAPI.generateDocument({
        type: docType,
        ...formData
      });
      
      setGeneratedDoc(response.data.document);
      setIsGenerating(false);
      setIsModalOpen(true);
      toast.success('Document Generated Successfully');
    } catch (error) {
      console.error(error);
      setIsGenerating(false);
      toast.error('Failed to generate document');
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    
    const splitText = doc.splitTextToSize(generatedDoc, 180);
    
    let y = 20;
    for (let i = 0; i < splitText.length; i++) {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(splitText[i], 15, y);
      y += 6; 
    }
    
    doc.save(`LexisCo_${activeTab.toUpperCase()}_Draft.pdf`);
    toast.success('Downloaded as PDF');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedDoc);
    toast.success('Copied to clipboard');
  };

  const shareViaWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(generatedDoc)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-base)]">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto custom-scrollbar">
        <header className="h-16 border-b border-[var(--border-color)] bg-[var(--bg-surface)] flex items-center px-4 sticky top-0 z-20">
          <Menu className="w-6 h-6 md:hidden mr-4 cursor-pointer text-[var(--text-muted)]" onClick={() => setIsSidebarOpen(true)} />
          <h1 className="font-semibold text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-[var(--color-brand-accent)]" />
            Document Generator
          </h1>
        </header>

        <div className="max-w-3xl mx-auto w-full px-4 py-8">


          <GlassCard className="p-0 overflow-hidden">
            {/* Progress Bar */}
            <div className="flex bg-[var(--bg-surface)] border-b border-[var(--border-color)]">
              {[1, 2, 3].map(i => (
                <div key={i} className={`flex-1 text-center py-3 text-sm font-semibold transition-colors ${step >= i ? 'text-[var(--color-brand-accent)] border-b-2 border-[var(--color-brand-accent)]' : 'text-[var(--text-muted)] border-b-2 border-transparent'}`}>
                  Step {i}
                </div>
              ))}
            </div>

            <div className="p-6 md:p-8">
              {step === 1 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                  <div className="mb-6 mb-8">
                    <label className="block text-sm font-bold mb-2 opacity-90">Select Document Type *</label>
                    <select
                      className="w-full px-4 py-3 rounded-lg bg-[var(--bg-base)] border border-[var(--border-color)] focus:border-[var(--color-brand-accent)] outline-none appearance-none font-semibold text-[var(--text-base)] shadow-sm"
                      value={activeTab}
                      onChange={e => setActiveTab(e.target.value)}
                    >
                      <option value="fir">First Information Report (FIR)</option>
                      <option value="notice">Legal Notice</option>
                      <option value="complaint">Consumer Complaint</option>
                    </select>
                  </div>
                  <h3 className="text-xl font-serif font-bold mb-4 pt-4 border-t border-[var(--border-color)]">Incident / Issue Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm mb-1 opacity-80">Complainant Name *</label>
                      <input className="w-full px-4 py-2 rounded-lg bg-[var(--bg-base)] border border-[var(--border-color)] focus:border-[var(--color-brand-accent)] outline-none" value={formData.complainantName} onChange={e => setFormData({...formData, complainantName: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm mb-1 opacity-80">Father's / Spouse's Name</label>
                      <input className="w-full px-4 py-2 rounded-lg bg-[var(--bg-base)] border border-[var(--border-color)] focus:border-[var(--color-brand-accent)] outline-none" value={formData.fatherName} onChange={e => setFormData({...formData, fatherName: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm mb-1 opacity-80">Phone Number</label>
                    <input type="tel" className="w-full px-4 py-2 rounded-lg bg-[var(--bg-base)] border border-[var(--border-color)] focus:border-[var(--color-brand-accent)] outline-none" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm mb-1 opacity-80">Address</label>
                    <textarea className="w-full px-4 py-2 rounded-lg bg-[var(--bg-base)] border border-[var(--border-color)] focus:border-[var(--color-brand-accent)] outline-none resize-none" rows="2" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}></textarea>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm mb-1 opacity-80">Date of Incident</label>
                      <input type="date" className="w-full px-4 py-2 rounded-lg bg-[var(--bg-base)] border border-[var(--border-color)] focus:border-[var(--color-brand-accent)] outline-none" value={formData.dateOfIncident} onChange={e => setFormData({...formData, dateOfIncident: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm mb-1 opacity-80">Time of Incident</label>
                      <input type="time" className="w-full px-4 py-2 rounded-lg bg-[var(--bg-base)] border border-[var(--border-color)] focus:border-[var(--color-brand-accent)] outline-none" value={formData.timeOfIncident} onChange={e => setFormData({...formData, timeOfIncident: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm mb-1 opacity-80">Location of Incident</label>
                    <input className="w-full px-4 py-2 rounded-lg bg-[var(--bg-base)] border border-[var(--border-color)] focus:border-[var(--color-brand-accent)] outline-none" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                  <h3 className="text-xl font-serif font-bold mb-6">Incident Description</h3>
                  <div>
                    <label className="block text-sm mb-1 opacity-80">Nature of {activeTab === 'fir' ? 'Offence' : activeTab === 'notice' ? 'Notice' : 'Issue'} *</label>
                    <select className="w-full px-4 py-2 rounded-lg bg-[var(--bg-base)] border border-[var(--border-color)] focus:border-[var(--color-brand-accent)] outline-none appearance-none" value={formData.natureOfOffence} onChange={e => setFormData({...formData, natureOfOffence: e.target.value})}>
                      <option value="">Select option...</option>
                      <option value="Theft">Theft / Fraud</option>
                      <option value="Assault">Assault / Harassment</option>
                      <option value="Defective Product">Defective Product (Consumer)</option>
                      <option value="Poor Service">Poor Service (Consumer)</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm mb-1 opacity-80">Accused / Company Name (if known)</label>
                    <input className="w-full px-4 py-2 rounded-lg bg-[var(--bg-base)] border border-[var(--border-color)] focus:border-[var(--color-brand-accent)] outline-none" value={formData.accusedName} onChange={e => setFormData({...formData, accusedName: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm mb-1 opacity-80">Detailed Description *</label>
                    <textarea 
                      className="w-full px-4 py-2 rounded-lg bg-[var(--bg-base)] border border-[var(--border-color)] focus:border-[var(--color-brand-accent)] outline-none resize-none" 
                      rows="5" 
                      placeholder="Please explain sequentially what happened..."
                      value={formData.description} 
                      onChange={e => setFormData({...formData, description: e.target.value})}
                    ></textarea>
                    <p className="text-xs text-[var(--text-muted)] mt-1">{formData.description.length} chars (min 100 recommended)</p>
                  </div>
                  <div>
                    <label className="block text-sm mb-2 opacity-80">Evidence Available</label>
                    <div className="flex flex-wrap gap-2">
                      {evidenceOptions.map(ev => (
                        <button
                          key={ev}
                          onClick={() => toggleEvidence(ev)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors border ${formData.evidence.includes(ev) ? 'bg-[var(--color-brand-accent)] text-black border-[var(--color-brand-accent)]' : 'bg-[var(--bg-base)] text-[var(--text-muted)] border-[var(--border-color)] hover:border-[var(--color-brand-accent)]'}`}
                        >
                          {ev}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 text-center py-8">
                  <div className="w-20 h-20 mx-auto rounded-full bg-[var(--color-brand-accent)]/20 flex items-center justify-center mb-6">
                    <FileText className="w-10 h-10 text-[var(--color-brand-accent)]" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold mb-2">Ready to Draft</h3>
                  <p className="text-[var(--text-muted)] mb-8 max-w-md mx-auto">
                    We have collected the necessary details. Our AI will now format this into a legally sound draft suitable for submission.
                  </p>
                  
                  <button
                    onClick={generateDocument}
                    disabled={isGenerating || !formData.complainantName}
                    className="px-8 py-3 bg-[var(--color-brand-accent)] text-black rounded-lg font-bold text-lg hover:bg-opacity-90 transition-all flex items-center gap-2 mx-auto disabled:opacity-50"
                  >
                    {isGenerating ? <Spinner size="sm" className="border-black border-t-transparent" /> : "Generate Draft"}
                  </button>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="p-6 border-t border-[var(--border-color)] bg-[var(--bg-surface)] flex justify-between">
              <button 
                onClick={handleBack} 
                className={`flex items-center gap-2 px-4 py-2 font-semibold text-[var(--text-muted)] hover:text-[var(--text-base)] ${step === 1 ? 'invisible' : ''}`}
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              
              {step < 3 && (
                <button 
                  onClick={handleNext} 
                  className="flex items-center gap-2 px-6 py-2 bg-[var(--bg-base)] border border-[var(--border-color)] hover:border-[var(--color-brand-accent)] hover:text-[var(--color-brand-accent)] rounded-lg font-semibold transition-colors"
                >
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </GlassCard>
        </div>
      </main>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Document Draft">
        <div className="bg-[var(--bg-base)] p-4 rounded-lg font-mono text-sm leading-relaxed border border-[var(--border-color)] whitespace-pre-wrap">
          {generatedDoc}
        </div>
        <div className="flex flex-wrap gap-3 mt-6 justify-end">
          <button onClick={shareViaWhatsApp} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] hover:bg-[#25D366]/20 hover:text-[#25D366] hover:border-[#25D366] transition-colors text-sm font-semibold text-[var(--text-muted)]">
            <Share2 className="w-4 h-4" /> Share
          </button>
          <button onClick={copyToClipboard} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] hover:text-[var(--color-brand-accent)] transition-colors text-sm font-semibold text-[var(--text-muted)]">
            <Copy className="w-4 h-4" /> Copy
          </button>
          <button onClick={downloadPDF} className="flex items-center gap-2 px-6 py-2 rounded-lg bg-[var(--color-brand-accent)] text-black hover:bg-opacity-90 shadow-lg transition-all font-bold text-sm">
            <Download className="w-4 h-4" /> Download PDF
          </button>
        </div>
      </Modal>

    </div>
  );
}
