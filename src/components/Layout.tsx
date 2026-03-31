import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, MessageSquare, Camera, Sprout, Landmark, Languages, Moon, Sun, CloudRain, Mic, MicOff, TrendingUp, IndianRupee, LogOut } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../store/AppContext';
import { useTheme } from './ThemeProvider';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';

const Layout = () => {
  const { language, setLanguage, user } = useAppContext();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isListeningGlobal, setIsListeningGlobal] = useState(false);
  const globalRecognitionRef = useRef<any>(null);

  useEffect(() => {
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
        globalRecognitionRef.current = new SpeechRecognition();
        globalRecognitionRef.current.continuous = false;
        globalRecognitionRef.current.interimResults = false;
        
        globalRecognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript.toLowerCase();
          
          if (transcript.includes('disease check') || transcript.includes('scan') || transcript.includes('रोग')) {
            navigate('/disease');
          } else if (transcript.includes('weather update') || transcript.includes('weather') || transcript.includes('मौसम') || transcript.includes('हवामान')) {
            navigate('/weather');
          } else if (transcript.includes('home') || transcript.includes('होम')) {
            navigate('/');
          } else if (transcript.includes('chat') || transcript.includes('mitra') || transcript.includes('मित्र')) {
            navigate('/chat');
          } else if (transcript.includes('planner') || transcript.includes('plan') || transcript.includes('योजना')) {
            navigate('/planner');
          } else if (transcript.includes('schemes') || transcript.includes('योजनाएं')) {
            navigate('/schemes');
          } else if (transcript.includes('analytics') || transcript.includes('विश्लेषण')) {
            navigate('/analytics');
          } else if (transcript.includes('price') || transcript.includes('market') || transcript.includes('भाव') || transcript.includes('मंडी')) {
            navigate('/prices');
          }
          setIsListeningGlobal(false);
        };

        globalRecognitionRef.current.onerror = () => {
          setIsListeningGlobal(false);
        };

        globalRecognitionRef.current.onend = () => {
          setIsListeningGlobal(false);
        };
      }
    };

    initSpeechRecognition();

    return () => {
      if (globalRecognitionRef.current) {
        globalRecognitionRef.current.stop();
      }
    };
  }, [navigate]);

  useEffect(() => {
    if (globalRecognitionRef.current) {
      switch (language) {
        case 'hi': globalRecognitionRef.current.lang = 'hi-IN'; break;
        case 'mr': globalRecognitionRef.current.lang = 'mr-IN'; break;
        case 'pa': globalRecognitionRef.current.lang = 'pa-IN'; break;
        case 'gu': globalRecognitionRef.current.lang = 'gu-IN'; break;
        case 'te': globalRecognitionRef.current.lang = 'te-IN'; break;
        case 'kn': globalRecognitionRef.current.lang = 'kn-IN'; break;
        default: globalRecognitionRef.current.lang = 'en-IN'; break;
      }
    }
  }, [language]);

  const toggleGlobalVoice = () => {
    if (isListeningGlobal) {
      globalRecognitionRef.current?.stop();
      setIsListeningGlobal(false);
    } else {
      try {
        globalRecognitionRef.current?.start();
        setIsListeningGlobal(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navItems = [
    { path: '/', icon: <Home size={22} />, label: { en: 'Home', hi: 'होम', mr: 'मुख्यपृष्ठ', pa: 'ਮੁੱਖ ਪੰਨਾ', gu: 'ઘર', te: 'హోమ్', kn: 'ಮುಖಪುಟ' } },
    { path: '/chat', icon: <MessageSquare size={22} />, label: { en: 'Mitra', hi: 'मित्र', mr: 'मित्र', pa: 'ਮਿੱਤਰ', gu: 'મિત્ર', te: 'మిత్ర', kn: 'ಮಿತ್ರ' } },
    { path: '/disease', icon: <Camera size={22} />, label: { en: 'Scan', hi: 'स्कॅन', mr: 'स्कॅन', pa: 'ਸਕੈਨ', gu: 'સ્કેન', te: 'స్కాన్', kn: 'ಸ್ಕ್ಯಾನ್' } },
    { path: '/weather', icon: <CloudRain size={22} />, label: { en: 'Weather', hi: 'मौसम', mr: 'हवामान', pa: 'ਮੌਸਮ', gu: 'હવામાન', te: 'వాతావరణం', kn: 'ಹವಾಮಾನ' } },
    { path: '/planner', icon: <Sprout size={22} />, label: { en: 'Plan', hi: 'योजना', mr: 'नियोजन', pa: 'ਯੋਜਨਾ', gu: 'યોજના', te: 'ప్రణాళిక', kn: 'ಯೋಜನೆ' } },
    { path: '/schemes', icon: <Landmark size={22} />, label: { en: 'Schemes', hi: 'योजनाएं', mr: 'योजना', pa: 'ਸਕੀਮਾਂ', gu: 'યોજનાઓ', te: 'పథకాలు', kn: 'ಯೋಜನೆಗಳು' } },
    { path: '/prices', icon: <IndianRupee size={22} />, label: { en: 'Prices', hi: 'भाव', mr: 'भाव', pa: 'ਕੀਮਤਾਂ', gu: 'ભાવ', te: 'ధరలు', kn: 'ಬೆಲೆಗಳು' } },
    { path: '/analytics', icon: <TrendingUp size={22} />, label: { en: 'Analytics', hi: 'विश्लेषण', mr: 'विश्लेषण', pa: 'ਵਿਸ਼ਲੇਸ਼ਣ', gu: 'વિશ્લેષણ', te: 'విశ్లేషణ', kn: 'ವಿಶ್ಲೇಷಣೆ' } },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Header */}
      <header className="bg-card border-b border-border p-4 sticky top-0 z-30 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-xl">
            <Sprout size={24} className="text-primary" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">KisanAI</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={toggleGlobalVoice}
            className={`p-2 rounded-full transition-colors ${isListeningGlobal ? 'bg-red-500 text-white animate-pulse' : 'hover:bg-muted text-muted-foreground'}`}
            aria-label="Voice Navigation"
            title="Voice Navigation (Say 'disease check' or 'weather update')"
          >
            {isListeningGlobal ? <Mic size={20} /> : <MicOff size={20} />}
          </button>

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <div className="flex items-center gap-2 bg-muted rounded-full px-3 py-1.5 border border-border">
            <Languages size={16} className="text-muted-foreground" />
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value as any)}
              className="bg-transparent text-sm font-medium outline-none cursor-pointer appearance-none pr-2 text-foreground"
            >
              <option value="en" className="bg-card text-foreground">English</option>
              <option value="hi" className="bg-card text-foreground">हिन्दी</option>
              <option value="mr" className="bg-card text-foreground">मराठी</option>
              <option value="pa" className="bg-card text-foreground">ਪੰਜਾਬી</option>
              <option value="gu" className="bg-card text-foreground">ગુજરાતી</option>
              <option value="te" className="bg-card text-foreground">తెలుగు</option>
              <option value="kn" className="bg-card text-foreground">ಕನ್ನಡ</option>
            </select>
          </div>

          {user && (
            <button
              onClick={handleLogout}
              className="p-2 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground ml-2"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24 md:pb-8 md:pl-64 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="max-w-5xl mx-auto p-4 md:p-6"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="md:hidden fixed bottom-0 w-full bg-card/80 backdrop-blur-lg border-t border-border flex justify-around items-center pb-safe pt-2 px-2 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.1)] z-40">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path}
              className={`relative flex flex-col items-center p-2 rounded-2xl transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {isActive && (
                <motion.div 
                  layoutId="bottom-nav-indicator"
                  className="absolute inset-0 bg-primary/10 rounded-2xl -z-10"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <div className={`${isActive ? 'scale-110' : ''} transition-transform duration-200 mb-1`}>
                {item.icon}
              </div>
              <span className="text-[10px] font-semibold tracking-wide">{item.label[language]}</span>
            </Link>
          );
        })}
      </nav>

      {/* Side Navigation (Desktop) */}
      <aside className="hidden md:flex flex-col fixed left-0 top-[73px] bottom-0 w-64 bg-card border-r border-border p-4 shadow-sm z-20">
        <div className="space-y-2 mt-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className={`relative flex items-center gap-3 p-3 rounded-xl transition-colors overflow-hidden ${isActive ? 'text-primary font-semibold' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="side-nav-indicator"
                    className="absolute inset-0 bg-primary/10 -z-10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                {item.icon}
                <span>{item.label[language]}</span>
              </Link>
            );
          })}
        </div>
      </aside>
    </div>
  );
};

export default Layout;
