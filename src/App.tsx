import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, 
  MessageSquare, 
  Camera, 
  BookOpen, 
  PhoneCall, 
  Languages, 
  Mic, 
  Send, 
  User, 
  Video, 
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Volume2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Markdown from 'react-markdown';

import { Language, translations, Translation } from './types';
import { GOVERNMENT_SCHEMES, EXPERTS, TOLL_FREE_NUMBER } from './constants';
import { analyzeCropDisease, getChatbotResponse } from './services/gemini';
import { fileToBase64 } from './utils';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Tab = 'home' | 'chat' | 'detect' | 'schemes' | 'support';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [lang, setLang] = useState<Language>('en');
  const [showLangSelector, setShowLangSelector] = useState(false);
  const t = translations[lang];

  // Disease Detection State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Chat State
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setSelectedImage(`data:image/jpeg;base64,${base64}`);
      setIsAnalyzing(true);
      setAnalysisResult(null);
      
      const result = await analyzeCropDisease(base64, lang);
      setAnalysisResult(result);
      setIsAnalyzing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;
    
    const userMsg = currentMessage;
    setCurrentMessage('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsChatLoading(true);

    try {
      const history = chatMessages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
      const response = await getChatbotResponse(userMsg, lang, history);
      setChatMessages(prev => [...prev, { role: 'model', text: response || 'Sorry, I could not understand that.' }]);
    } catch (error) {
      setChatMessages(prev => [...prev, { role: 'model', text: 'Error connecting to AI assistant.' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Voice Assistant State
  const [isListening, setIsListening] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setVoiceTranscript(transcript);
        handleVoiceInput(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
    }
  }, [lang]);

  useEffect(() => {
    if (showVoiceModal) {
      startListening();
    }
  }, [showVoiceModal]);

  const startListening = () => {
    if (recognitionRef.current) {
      // Set language for recognition based on current app language
      recognitionRef.current.lang = lang === 'hi' ? 'hi-IN' : lang === 'mr' ? 'mr-IN' : 'en-IN';
      setIsListening(true);
      setVoiceTranscript('');
      recognitionRef.current.start();
    } else {
      alert('Speech recognition not supported in this browser.');
    }
  };

  const handleVoiceInput = async (text: string) => {
    setIsChatLoading(true);
    try {
      const response = await getChatbotResponse(text, lang, []);
      setChatMessages(prev => [...prev, { role: 'user', text }, { role: 'model', text: response || '' }]);
      speakText(response || '');
    } catch (error) {
      console.error('Voice assistant error', error);
    } finally {
      setIsChatLoading(false);
    }
  };

  const speakText = (text: string) => {
    window.speechSynthesis.cancel(); // Stop any current speech
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Simple language detection for TTS voice selection
    // Marathi characters range: \u0900-\u097F (shared with Hindi, but we can try to be smart)
    // For simplicity, we use the app's current lang or detect script
    if (/[\u0900-\u097F]/.test(text)) {
      // If it contains Devanagari, it's likely Hindi or Marathi
      // We'll use the app language as a hint, or default to Hindi if unsure
      utterance.lang = lang === 'mr' ? 'mr-IN' : 'hi-IN';
    } else {
      utterance.lang = 'en-IN';
    }
    
    utterance.rate = 0.9; // Medium speaking speed
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="p-4 space-y-6 pb-24">
            <header className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-emerald-800">{t.welcome}</h1>
                <p className="text-emerald-600 font-medium">{t.appName}</p>
              </div>
              <button 
                onClick={() => setShowLangSelector(true)}
                className="p-3 bg-emerald-100 rounded-full text-emerald-700 hover:bg-emerald-200 transition-colors"
              >
                <Languages size={24} />
              </button>
            </header>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setActiveTab('detect')}
                className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border border-emerald-100 space-y-3 hover:bg-emerald-50 transition-all active:scale-95"
              >
                <div className="p-4 bg-emerald-100 rounded-full text-emerald-600">
                  <Camera size={32} />
                </div>
                <span className="font-bold text-emerald-900 text-lg">{t.detect}</span>
              </button>
              <button 
                onClick={() => setActiveTab('chat')}
                className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border border-emerald-100 space-y-3 hover:bg-emerald-50 transition-all active:scale-95"
              >
                <div className="p-4 bg-emerald-100 rounded-full text-emerald-600">
                  <MessageSquare size={32} />
                </div>
                <span className="font-bold text-emerald-900 text-lg">{t.chat}</span>
              </button>
              <button 
                onClick={() => setActiveTab('schemes')}
                className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border border-emerald-100 space-y-3 hover:bg-emerald-50 transition-all active:scale-95"
              >
                <div className="p-4 bg-emerald-100 rounded-full text-emerald-600">
                  <BookOpen size={32} />
                </div>
                <span className="font-bold text-emerald-900 text-lg">{t.schemes}</span>
              </button>
              <button 
                onClick={() => setActiveTab('support')}
                className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border border-emerald-100 space-y-3 hover:bg-emerald-50 transition-all active:scale-95"
              >
                <div className="p-4 bg-emerald-100 rounded-full text-emerald-600">
                  <PhoneCall size={32} />
                </div>
                <span className="font-bold text-emerald-900 text-lg">{t.support}</span>
              </button>
            </div>

            <div className="bg-emerald-800 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2">{t.voiceAssistant}</h3>
                <p className="text-emerald-100 mb-4">Click to talk to your smart assistant in Hindi or Marathi</p>
                <button 
                  onClick={() => setShowVoiceModal(true)}
                  className="flex items-center gap-2 bg-white text-emerald-800 px-6 py-3 rounded-full font-bold hover:bg-emerald-50 transition-all active:scale-95 shadow-md"
                >
                  <Mic size={20} className="animate-pulse" />
                  <span>Start Talking</span>
                </button>
              </div>
              <Mic className="absolute -right-4 -bottom-4 text-white/10 w-32 h-32" />
            </div>
          </div>
        );

      case 'detect':
        return (
          <div className="p-4 space-y-6 pb-24">
            <h2 className="text-2xl font-bold text-emerald-900">{t.diseaseDetection}</h2>
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square w-full bg-emerald-50 border-4 border-dashed border-emerald-200 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-emerald-100 transition-all overflow-hidden relative"
            >
              {selectedImage ? (
                <img src={selectedImage} alt="Selected Leaf" className="w-full h-full object-cover" />
              ) : (
                <>
                  <Camera size={64} className="text-emerald-400 mb-4" />
                  <p className="text-emerald-700 font-bold text-center px-8">{t.uploadImage}</p>
                </>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                className="hidden" 
                accept="image/*" 
                capture="environment"
              />
            </div>

            {isAnalyzing && (
              <div className="flex items-center justify-center gap-3 text-emerald-700 font-bold p-4 bg-emerald-50 rounded-2xl">
                <Loader2 className="animate-spin" />
                <span>{t.analyzing}</span>
              </div>
            )}

            {analysisResult && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-emerald-100">
                  <div className="flex items-center gap-2 text-emerald-700 mb-2">
                    <AlertCircle size={20} />
                    <span className="font-bold uppercase tracking-wider text-sm">{t.diseaseName}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-emerald-900 mb-4">{analysisResult.diseaseName}</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-bold text-emerald-800 mb-2">{t.causes}</h4>
                      <ul className="list-disc list-inside text-emerald-700 space-y-1">
                        {analysisResult.causes.map((cause: string, i: number) => (
                          <li key={i}>{cause}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-emerald-800 mb-2">{t.treatment}</h4>
                      <ul className="list-disc list-inside text-emerald-700 space-y-1">
                        {analysisResult.treatment.map((treat: string, i: number) => (
                          <li key={i}>{treat}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        );

      case 'chat':
        return (
          <div className="flex flex-col h-[calc(100vh-80px)]">
            <div className="p-4 border-b bg-white">
              <h2 className="text-xl font-bold text-emerald-900">{t.askChatbot}</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.length === 0 && (
                <div className="text-center py-12 text-emerald-500">
                  <MessageSquare size={48} className="mx-auto mb-4 opacity-20" />
                  <p>How can I help you today?</p>
                </div>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} className={cn(
                  "flex w-full",
                  msg.role === 'user' ? "justify-end" : "justify-start"
                )}>
                  <div className={cn(
                    "max-w-[85%] p-4 rounded-2xl shadow-sm",
                    msg.role === 'user' 
                      ? "bg-emerald-600 text-white rounded-tr-none" 
                      : "bg-white text-emerald-900 border border-emerald-100 rounded-tl-none"
                  )}>
                    <div className="prose prose-sm max-w-none">
                      <Markdown>{msg.text}</Markdown>
                    </div>
                    {msg.role === 'model' && (
                      <button 
                        onClick={() => speakText(msg.text)}
                        className="mt-2 text-emerald-500 hover:text-emerald-700"
                      >
                        <Volume2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white p-4 rounded-2xl border border-emerald-100 rounded-tl-none">
                    <Loader2 className="animate-spin text-emerald-500" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 bg-white border-t pb-24">
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={t.typeMessage}
                  className="flex-1 bg-emerald-50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-emerald-500"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={isChatLoading}
                  className="bg-emerald-600 text-white p-3 rounded-2xl hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-50"
                >
                  <Send size={24} />
                </button>
              </div>
            </div>
          </div>
        );

      case 'schemes':
        return (
          <div className="p-4 space-y-6 pb-24">
            <h2 className="text-2xl font-bold text-emerald-900">{t.governmentSchemes}</h2>
            <div className="space-y-4">
              {GOVERNMENT_SCHEMES.map((scheme) => (
                <div key={scheme.id} className="bg-white p-6 rounded-3xl shadow-sm border border-emerald-100">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-emerald-900">{scheme.name[lang]}</h3>
                    <button 
                      onClick={() => speakText(`${scheme.name[lang]}. ${scheme.description[lang]}`)}
                      className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-full"
                    >
                      <Volume2 size={20} />
                    </button>
                  </div>
                  <p className="text-emerald-700 mb-4">{scheme.description[lang]}</p>
                  
                  <div className="space-y-3 pt-4 border-t border-emerald-50">
                    <div>
                      <span className="text-xs font-bold uppercase text-emerald-500 tracking-wider">{t.eligibility}</span>
                      <p className="text-emerald-800 font-medium">{scheme.eligibility[lang]}</p>
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase text-emerald-500 tracking-wider">{t.benefits}</span>
                      <p className="text-emerald-800 font-medium">{scheme.benefits[lang]}</p>
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase text-emerald-500 tracking-wider">{t.howToApply}</span>
                      <p className="text-emerald-800 font-medium">{scheme.howToApply[lang]}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'support':
        return (
          <div className="p-4 space-y-6 pb-24">
            <h2 className="text-2xl font-bold text-emerald-900">{t.support}</h2>
            
            <div className="bg-emerald-600 text-white p-8 rounded-3xl shadow-lg text-center space-y-4">
              <PhoneCall size={48} className="mx-auto mb-2" />
              <h3 className="text-xl font-bold">{t.tollFree}</h3>
              <p className="text-3xl font-black tracking-tighter">{TOLL_FREE_NUMBER}</p>
              <button className="bg-white text-emerald-700 px-8 py-3 rounded-full font-bold hover:bg-emerald-50 transition-colors">
                {t.call}
              </button>
            </div>

            <h3 className="text-xl font-bold text-emerald-900 mt-8">{t.expertConsultants}</h3>
            <div className="space-y-4">
              {EXPERTS.map((expert) => (
                <div key={expert.id} className="bg-white p-4 rounded-3xl shadow-sm border border-emerald-100 flex gap-4 items-center">
                  <img src={expert.image} alt={expert.name} className="w-20 h-20 rounded-2xl object-cover" />
                  <div className="flex-1">
                    <h4 className="font-bold text-emerald-900 text-lg">{expert.name}</h4>
                    <p className="text-emerald-600 font-medium text-sm">{expert.specialty[lang]}</p>
                    <p className="text-emerald-400 text-xs">{expert.experience}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100">
                      <PhoneCall size={20} />
                    </button>
                    <button className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100">
                      <Video size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF9] font-sans text-emerald-950">
      <main className="max-w-md mx-auto min-h-screen relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-emerald-100 px-2 py-3 z-50">
          <div className="max-w-md mx-auto flex justify-between items-center">
            <NavButton 
              active={activeTab === 'home'} 
              onClick={() => setActiveTab('home')} 
              icon={<Home size={24} />} 
              label={t.home} 
            />
            <NavButton 
              active={activeTab === 'detect'} 
              onClick={() => setActiveTab('detect')} 
              icon={<Camera size={24} />} 
              label={t.detect} 
            />
            <NavButton 
              active={activeTab === 'chat'} 
              onClick={() => setActiveTab('chat')} 
              icon={<MessageSquare size={24} />} 
              label={t.chat} 
            />
            <NavButton 
              active={activeTab === 'schemes'} 
              onClick={() => setActiveTab('schemes')} 
              icon={<BookOpen size={24} />} 
              label={t.schemes} 
            />
            <NavButton 
              active={activeTab === 'support'} 
              onClick={() => setActiveTab('support')} 
              icon={<PhoneCall size={24} />} 
              label={t.support} 
            />
          </div>
        </nav>

        {/* Language Selector Modal */}
        {showLangSelector && (
          <div className="fixed inset-0 bg-black/50 z-[100] flex items-end justify-center">
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              className="bg-white w-full max-w-md rounded-t-[3rem] p-8 space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-emerald-900">{t.selectLanguage}</h3>
                <button onClick={() => setShowLangSelector(false)} className="text-emerald-400 font-bold">Close</button>
              </div>
              <div className="grid gap-4">
                <LangButton 
                  active={lang === 'en'} 
                  onClick={() => { setLang('en'); setShowLangSelector(false); }} 
                  label="English" 
                />
                <LangButton 
                  active={lang === 'hi'} 
                  onClick={() => { setLang('hi'); setShowLangSelector(false); }} 
                  label="हिन्दी (Hindi)" 
                />
                <LangButton 
                  active={lang === 'mr'} 
                  onClick={() => { setLang('mr'); setShowLangSelector(false); }} 
                  label="मराठी (Marathi)" 
                />
              </div>
            </motion.div>
          </div>
        )}
        {/* Voice Assistant Modal */}
        <AnimatePresence>
          {showVoiceModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-emerald-950/90 z-[110] flex flex-col items-center justify-center p-6 text-white"
            >
              <button 
                onClick={() => {
                  setShowVoiceModal(false);
                  setIsListening(false);
                  window.speechSynthesis.cancel();
                }}
                className="absolute top-8 right-8 p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <ChevronRight size={32} className="rotate-90" />
              </button>

              <div className="flex-1 flex flex-col items-center justify-center space-y-8 w-full max-w-sm text-center">
                <div className="relative">
                  <motion.div 
                    animate={isListening ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className={cn(
                      "w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500",
                      isListening ? "bg-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.5)]" : "bg-emerald-800"
                    )}
                  >
                    <Mic size={48} />
                  </motion.div>
                  {isListening && (
                    <div className="absolute inset-0 rounded-full border-4 border-emerald-400 animate-ping" />
                  )}
                </div>

                <div className="space-y-2">
                  <h2 className="text-3xl font-bold">
                    {isListening ? "Listening..." : isChatLoading ? "Thinking..." : "Voice Assistant"}
                  </h2>
                  <p className="text-emerald-300 text-lg min-h-[1.5em]">
                    {voiceTranscript || "How can I help you today?"}
                  </p>
                </div>

                {chatMessages.length > 0 && chatMessages[chatMessages.length - 1].role === 'model' && !isChatLoading && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/10 p-6 rounded-3xl border border-white/10 w-full"
                  >
                    <p className="text-xl font-medium leading-relaxed">
                      {chatMessages[chatMessages.length - 1].text}
                    </p>
                  </motion.div>
                )}

                <div className="flex gap-4">
                  {!isListening && !isChatLoading && (
                    <button 
                      onClick={startListening}
                      className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg flex items-center gap-2 transition-all active:scale-95"
                    >
                      <Mic size={24} />
                      Talk Again
                    </button>
                  )}
                </div>
              </div>

              <div className="pb-12 text-emerald-400 text-sm font-medium flex items-center gap-2">
                <Languages size={16} />
                Supports Hindi, Marathi & English
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 px-3 py-1 rounded-2xl transition-all",
        active ? "text-emerald-700 bg-emerald-50" : "text-emerald-400"
      )}
    >
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </button>
  );
}

function LangButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full p-5 rounded-2xl text-left font-bold text-lg transition-all flex justify-between items-center",
        active ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-900 hover:bg-emerald-100"
      )}
    >
      {label}
      {active && <CheckCircle2 size={24} />}
    </button>
  );
}
