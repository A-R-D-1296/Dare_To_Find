import { useState, useCallback, useEffect } from 'react';
import i18n from '../i18n';

export const useVoice = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      
      rec.onresult = (event) => {
        let finalTrans = '';
        let interimTrans = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTrans += event.results[i][0].transcript;
          } else {
            interimTrans += event.results[i][0].transcript;
          }
        }
        if (finalTrans) {
            setTranscript(prev => prev + ' ' + finalTrans);
        }
      };

      rec.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      setRecognition(rec);
    }
  }, []);

  const toggleRecording = useCallback(() => {
    if (!recognition) {
        alert("Speech recognition is not supported in this browser.");
        return;
    }

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      setTranscript('');
      // Set language based on active i18n setting
      recognition.lang = i18n.language === 'en' ? 'en-IN' : 'hi-IN';
      recognition.start();
      setIsRecording(true);
    }
  }, [isRecording, recognition]);

  return {
    isRecording,
    transcript,
    toggleRecording,
    hasSupport: !!recognition
  };
};
