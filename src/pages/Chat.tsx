import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, User, Bot, Loader2, Volume2, Sparkles, Share2, Trash2 } from 'lucide-react';
import { useAppContext } from '../store/AppContext';
import { askKisanMitra, updateFarmerMemory } from '../lib/gemini';
import Markdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

const Chat = () => {
  const { language, weather } = useAppContext();
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('kisan_chat_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [handsFreeMode, setHandsFreeMode] = useState(false);
  const [farmerMemory, setFarmerMemory] = useState<any>(() => {
    const saved = localStorage.getItem('kisan_farmer_memory');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return null;
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const wakeWordRegex = /hey kisan|हे किसान|હે કિસાન|హే కిసాన్|ಹೇ ಕಿಸಾನ್/i;

  const t = {
    en: { 
      title: 'Kisan Mitra', 
      placeholder: 'Ask about crops, weather, diseases...', 
      send: 'Send', 
      empty: 'Hello! I am Kisan Mitra, your AI farming assistant. How can I help you today?',
      quickPrompts: ['What crops to plant in summer?', 'How to treat yellow leaves?', 'Will it rain today?'],
      handsFree: 'Hands-free Mode (Say "Hey Kisan")'
    },
    hi: { 
      title: 'किसान मित्र', 
      placeholder: 'फसल, मौसम, बीमारियों के बारे में पूछें...', 
      send: 'भेजें', 
      empty: 'नमस्ते! मैं किसान मित्र हूं, आपका एआई कृषि सहायक। आज मैं आपकी कैसे मदद कर सकता हूं?',
      quickPrompts: ['गर्मियों में कौन सी फसलें बोएं?', 'पीले पत्तों का इलाज कैसे करें?', 'क्या आज बारिश होगी?'],
      handsFree: 'हैंड्स-फ्री मोड ("हे किसान" बोलें)'
    },
    mr: { 
      title: 'किसान मित्र', 
      placeholder: 'पीक, हवामान, आजारांबद्दल विचारा...', 
      send: 'पाठवा', 
      empty: 'नमस्कार! मी किसान मित्र आहे, तुमचा एआय कृषी सहाय्यक. मी तुम्हाला आज कशी मदत करू शकतो?',
      quickPrompts: ['उन्हाळ्यात कोणती पिके घ्यावीत?', 'पिवळ्या पानांवर काय उपाय करावे?', 'आज पाऊस पडेल का?'],
      handsFree: 'हँड्स-फ्री मोड ("हे किसान" म्हणा)'
    },
    pa: { 
      title: 'ਕਿਸਾਨ ਮਿੱਤਰ', 
      placeholder: 'ਫਸਲਾਂ, ਮੌਸਮ, ਬਿਮਾਰੀਆਂ ਬਾਰੇ ਪੁੱਛੋ...', 
      send: 'ਭੇਜੋ', 
      empty: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਕਿਸਾਨ ਮਿੱਤਰ ਹਾਂ, ਤੁਹਾਡਾ AI ਖੇਤੀ ਸਹਾਇਕ। ਮੈਂ ਅੱਜ ਤੁਹਾਡੀ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?',
      quickPrompts: ['ਗਰਮੀਆਂ ਵਿੱਚ ਕਿਹੜੀਆਂ ਫਸਲਾਂ ਬੀਜਣੀਆਂ ਹਨ?', 'ਪੀਲੇ ਪੱਤਿਆਂ ਦਾ ਇਲਾਜ ਕਿਵੇਂ ਕਰੀਏ?', 'ਕੀ ਅੱਜ ਮੀਂਹ ਪਵੇਗਾ?'],
      handsFree: 'ਹੈਂਡਸ-ਫ੍ਰੀ ਮੋਡ ("ਹੇ ਕਿਸਾਨ" ਕਹੋ)'
    },
    gu: { 
      title: 'કિસાન મિત્ર', 
      placeholder: 'પાક, હવામાન, રોગો વિશે પૂછો...', 
      send: 'મોકલો', 
      empty: 'નમસ્તે! હું કિસાન મિત્ર છું, તમારો AI કૃષિ સહાયક. આજે હું તમારી કેવી રીતે મદદ કરી શકું?',
      quickPrompts: ['ઉનાળામાં કયા પાક વાવવા?', 'પીળા પાંદડાની સારવાર કેવી રીતે કરવી?', 'શું આજે વરસાદ પડશે?'],
      handsFree: 'હેન્ડ્સ-ફ્રી મોડ ("હે કિસાન" કહો)'
    },
    te: { 
      title: 'కిసాన్ మిత్ర', 
      placeholder: 'పంటలు, వాతావరణం, వ్యాధుల గురించి అడగండి...', 
      send: 'పంపండి', 
      empty: 'నమస్కారం! నేను కిసాన్ మిత్ర, మీ AI వ్యవసాయ సహాయకుడు. ఈ రోజు నేను మీకు ఎలా సహాయం చేయగలను?',
      quickPrompts: ['వేసవిలో ఏ పంటలు వేయాలి?', 'పసుపు ఆకులకు ఎలా చికిత్స చేయాలి?', 'ఈ రోజు వర్షం పడుతుందా?'],
      handsFree: 'హ్యాండ్స్-ఫ్రీ మోడ్ ("హే కిసాన్" అని చెప్పండి)'
    },
    kn: { 
      title: 'ಕಿಸಾನ್ ಮಿತ್ರ', 
      placeholder: 'ಬೆಳೆಗಳು, ಹವಾಮಾನ, ರೋಗಗಳ ಬಗ್ಗೆ ಕೇಳಿ...', 
      send: 'ಕಳುಹಿಸಿ', 
      empty: 'ನಮಸ್ಕಾರ! ನಾನು ಕಿಸಾನ್ ಮಿತ್ರ, ನಿಮ್ಮ AI ಕೃಷಿ ಸಹಾಯಕ. ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?',
      quickPrompts: ['ಬೇಸಿಗೆಯಲ್ಲ ಯಾವ ಬೆಳೆಗಳನ್ನು ಬೆಳೆಯಬೇಕು?', 'ಹಳದಿ ಎಲೆಗಳಿಗೆ ಹೇಗೆ ಚಿಕಿತ್ಸೆ ನೀಡಬೇಕು?', 'ಇಂದು ಮಳೆ ಬರುತ್ತದೆಯೇ?'],
      handsFree: 'ಹ್ಯಾಂಡ್ಸ್-ಫ್ರೀ ಮೋಡ್ ("ಹೇ ಕಿಸಾನ್" ಎಂದು ಹೇಳಿ)'
    }
  }[language];

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ id: 'init', role: 'model', text: t.empty }]);
    }
  }, [language, messages.length]);

  useEffect(() => {
    localStorage.setItem('kisan_chat_history', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    // Initialize Speech Recognition
    const initSpeechRecognition = async () => {
      // Check permissions first to prevent crash on Android Chrome v120+
      try {
        if (navigator.permissions && navigator.permissions.query) {
          await navigator.permissions.query({ name: 'microphone' as PermissionName });
        }
      } catch (e) {
        console.warn('Microphone permission query failed or not supported', e);
      }

      if ('webkitSpeechRecognition' in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          const currentTranscript = finalTranscript || interimTranscript;
          
          if (handsFreeMode) {
            if (wakeWordRegex.test(currentTranscript)) {
              const command = currentTranscript.replace(wakeWordRegex, '').trim();
              if (command && event.results[event.results.length - 1].isFinal) {
                handleSend(undefined, command);
                // Restart recognition to clear transcript
                recognitionRef.current.stop();
                setTimeout(() => {
                  if (handsFreeMode) recognitionRef.current?.start();
                }, 1000);
              } else {
                setInput(command);
              }
            }
          } else {
            if (event.results[event.results.length - 1].isFinal) {
               setInput((prev) => prev + ' ' + finalTranscript);
               setIsListening(false);
               recognitionRef.current.stop();
            } else {
               setInput(interimTranscript);
            }
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          if (event.error !== 'no-speech') {
            setIsListening(false);
            setHandsFreeMode(false);
          }
        };

        recognitionRef.current.onend = () => {
          if (handsFreeMode) {
            // Auto-restart in hands-free mode
            try {
              recognitionRef.current?.start();
            } catch (e) {
              console.error(e);
            }
          } else {
            setIsListening(false);
          }
        };
      }
    };

    initSpeechRecognition();
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }
  }, [handsFreeMode, language]);

  useEffect(() => {
    if (recognitionRef.current) {
      // Set language for speech recognition
      switch (language) {
        case 'hi': recognitionRef.current.lang = 'hi-IN'; break;
        case 'mr': recognitionRef.current.lang = 'mr-IN'; break;
        case 'pa': recognitionRef.current.lang = 'pa-IN'; break;
        case 'gu': recognitionRef.current.lang = 'gu-IN'; break;
        case 'te': recognitionRef.current.lang = 'te-IN'; break;
        case 'kn': recognitionRef.current.lang = 'kn-IN'; break;
        default: recognitionRef.current.lang = 'en-IN'; break;
      }
    }
  }, [language]);

  const toggleListening = () => {
    if (handsFreeMode) {
      setHandsFreeMode(false);
      setIsListening(false);
      recognitionRef.current?.stop();
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        setInput('');
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const toggleHandsFree = () => {
    if (handsFreeMode) {
      setHandsFreeMode(false);
      setIsListening(false);
      recognitionRef.current?.stop();
    } else {
      setHandsFreeMode(true);
      setIsListening(true);
      setInput('');
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any ongoing speech
      // Remove markdown formatting for speech
      const cleanText = text.replace(/[*_#`]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      switch (language) {
        case 'hi': utterance.lang = 'hi-IN'; break;
        case 'mr': utterance.lang = 'mr-IN'; break;
        case 'pa': utterance.lang = 'pa-IN'; break;
        case 'gu': utterance.lang = 'gu-IN'; break;
        case 'te': utterance.lang = 'te-IN'; break;
        case 'kn': utterance.lang = 'kn-IN'; break;
        default: utterance.lang = 'en-IN'; break;
      }
      window.speechSynthesis.speak(utterance);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: React.FormEvent, overrideInput?: string) => {
    e?.preventDefault();
    const messageToSend = overrideInput || input.trim();
    if (!messageToSend || isLoading) return;

    if (!overrideInput) setInput('');
    
    const newMessages: Message[] = [...messages, { id: Date.now().toString(), role: 'user', text: messageToSend }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const history = messages.filter(m => m.id !== 'init').map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      // Update memory in background
      updateFarmerMemory(messageToSend, farmerMemory).then(newMemory => {
        if (newMemory) {
          setFarmerMemory(newMemory);
          localStorage.setItem('kisan_farmer_memory', JSON.stringify(newMemory));
        }
      });

      const responseText = await askKisanMitra(messageToSend, language, weather, history, farmerMemory);
      setMessages([...newMessages, { id: (Date.now() + 1).toString(), role: 'model', text: responseText }]);
      speak(responseText);
    } catch (error) {
      console.error(error);
      setMessages([...newMessages, { id: (Date.now() + 1).toString(), role: 'model', text: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async (text: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'KisanAI Query',
          text: text,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    }
  };

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear chat history?')) {
      setMessages([{ id: 'init', role: 'model', text: t.empty }]);
      localStorage.removeItem('kisan_chat_history');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] bg-card rounded-3xl shadow-sm border border-border overflow-hidden">
      <div className="bg-primary p-4 text-primary-foreground flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-2xl backdrop-blur-sm">
            <Bot size={24} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-lg tracking-tight">{t.title}</h2>
              {farmerMemory && (farmerMemory.location || (farmerMemory.crops && farmerMemory.crops.length > 0)) && (
                <span className="text-[10px] font-medium px-2 py-0.5 bg-green-500/20 text-green-100 rounded-full border border-green-400/30 flex items-center gap-1">
                  <Sparkles size={10} />
                  Personalized
                </span>
              )}
            </div>
            <p className="text-primary-foreground/80 text-xs flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse"></span>
              Online 24/7
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={clearHistory}
            className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            title="Clear History"
          >
            <Trash2 size={18} />
          </button>
          <button
            onClick={toggleHandsFree}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors border ${handsFreeMode ? 'bg-red-500 border-red-400 text-white shadow-sm' : 'bg-white/10 border-white/20 hover:bg-white/20 text-white'}`}
            title={t.handsFree}
          >
            {handsFreeMode ? <Mic size={14} className="animate-pulse" /> : <MicOff size={14} />}
            {handsFreeMode ? 'Listening for "Hey Kisan"' : 'Hands-Free'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-muted/30">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`flex-shrink-0 h-10 w-10 rounded-2xl flex items-center justify-center ${msg.role === 'user' ? 'bg-primary/10 text-primary' : 'bg-card border border-border text-primary shadow-sm'}`}>
                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              <div className={`p-4 rounded-3xl relative group ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-sm shadow-sm' : 'bg-card border border-border shadow-sm text-card-foreground rounded-tl-sm'}`}>
                {msg.role === 'user' ? (
                  <>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</p>
                    <div className="absolute -left-20 top-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => speak(msg.text)}
                        className="p-1.5 text-muted-foreground hover:text-primary bg-card rounded-full shadow-sm border border-border"
                        title="Replay query"
                      >
                        <Volume2 size={14} />
                      </button>
                      <button 
                        onClick={() => handleShare(msg.text)}
                        className="p-1.5 text-muted-foreground hover:text-primary bg-card rounded-full shadow-sm border border-border"
                        title="Share query"
                      >
                        <Share2 size={14} />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <Markdown>{msg.text}</Markdown>
                    <div className="absolute -right-12 top-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => speak(msg.text)}
                        className="p-1.5 text-muted-foreground hover:text-primary bg-card rounded-full shadow-sm border border-border"
                        title="Read aloud"
                      >
                        <Volume2 size={14} />
                      </button>
                      <button 
                        onClick={() => handleShare(msg.text)}
                        className="p-1.5 text-muted-foreground hover:text-primary bg-card rounded-full shadow-sm border border-border"
                        title="Share response"
                      >
                        <Share2 size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {/* Quick Prompts - Only show if there's just the initial message */}
        {messages.length === 1 && !isLoading && (
          <div className="flex flex-col gap-3 mt-8 ml-14">
            <p className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5 mb-1 uppercase tracking-wider">
              <Sparkles size={14} className="text-primary" /> Suggested questions
            </p>
            <div className="flex flex-wrap gap-2">
              {t.quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(undefined, prompt)}
                  className="text-sm bg-card border border-border text-foreground px-4 py-2.5 rounded-2xl hover:border-primary hover:text-primary transition-colors shadow-sm text-left font-medium"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Typing Indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-3 max-w-[85%] flex-row">
              <div className="flex-shrink-0 h-10 w-10 rounded-2xl bg-card border border-border text-primary shadow-sm flex items-center justify-center">
                <Bot size={20} />
              </div>
              <div className="p-5 rounded-3xl bg-card border border-border shadow-sm rounded-tl-sm flex items-center gap-1.5">
                <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-card border-t border-border">
        <form onSubmit={(e) => handleSend(e)} className="flex items-center gap-2 bg-muted/50 p-1.5 rounded-full border border-border focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all shadow-inner">
          <button 
            type="button" 
            onClick={toggleListening}
            className={`p-2.5 transition-colors rounded-full hover:bg-card ${isListening && !handsFreeMode ? 'text-red-500 animate-pulse bg-red-50 dark:bg-red-900/20' : 'text-muted-foreground hover:text-primary'}`}
          >
            {isListening && !handsFreeMode ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={handsFreeMode ? 'Say "Hey Kisan" to ask...' : (isListening ? 'Listening...' : t.placeholder)}
            className="flex-1 bg-transparent border-none outline-none px-2 text-sm text-foreground placeholder-muted-foreground font-medium"
            disabled={isLoading || handsFreeMode}
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isLoading}
            className="p-2.5 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <Send size={18} className="ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
