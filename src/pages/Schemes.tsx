import React, { useState, useEffect } from 'react';
import { Landmark, Loader2, CheckCircle2, Search } from 'lucide-react';
import { useAppContext } from '../store/AppContext';
import { getGovernmentSchemes } from '../lib/gemini';
import Markdown from 'react-markdown';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { motion } from 'motion/react';

const Schemes = () => {
  const { language } = useAppContext();
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState({
    state: 'Maharashtra',
    category: 'General',
    landSize: 2,
    gender: 'Male'
  });

  const t = {
    en: { title: 'Government Schemes', desc: 'Check eligibility and application deadlines for welfare programs.', loading: 'Fetching personalized schemes...', result: 'Eligible Schemes', check: 'Check Eligibility', state: 'State', category: 'Category', landSize: 'Land Size (Acres)', gender: 'Gender' },
    hi: { title: 'सरकारी योजनाएं', desc: 'कल्याणकारी कार्यक्रमों के लिए पात्रता और आवेदन की समय सीमा की जांच करें।', loading: 'व्यक्तिगत योजनाएं प्राप्त कर रहा है...', result: 'पात्र योजनाएं', check: 'पात्रता जांचें', state: 'राज्य', category: 'श्रेणी', landSize: 'भूमि का आकार (एकड़)', gender: 'लिंग' },
    mr: { title: 'सरकारी योजना', desc: 'कल्याणकारी कार्यक्रमांसाठी पात्रता आणि अर्जाची अंतिम मुदत तपासा.', loading: 'वैयक्तिकृत योजना आणत आहे...', result: 'पात्र योजना', check: 'पात्रता तपासा', state: 'राज्य', category: 'वर्ग', landSize: 'जमिनीचा आकार (एकर)', gender: 'लिंग' },
    pa: { title: 'ਸਰਕਾਰੀ ਸਕੀਮਾਂ', desc: 'ਭਲਾਈ ਪ੍ਰੋਗਰਾਮਾਂ ਲਈ ਯੋਗਤਾ ਅਤੇ ਅਰਜ਼ੀ ਦੀਆਂ ਆਖਰੀ ਤਰੀਕਾਂ ਦੀ ਜਾਂਚ ਕਰੋ।', loading: 'ਵਿਅਕਤੀਗਤ ਸਕੀਮਾਂ ਪ੍ਰਾਪਤ ਕਰ ਰਿਹਾ ਹੈ...', result: 'ਯੋਗ ਸਕੀਮਾਂ', check: 'ਯੋਗਤਾ ਦੀ ਜਾਂਚ ਕਰੋ', state: 'ਰਾਜ', category: 'ਸ਼੍ਰੇਣੀ', landSize: 'ਜ਼ਮੀਨ ਦਾ ਆਕਾਰ (ਏਕੜ)', gender: 'ਲਿੰਗ' },
    gu: { title: 'સરકારી યોજનાઓ', desc: 'કલ્યાણ કાર્યક્રમો માટે પાત્રતા અને અરજીની અંતિમ તારીખ તપાસો.', loading: 'વ્યક્તિગત યોજનાઓ લાવી રહ્યું છે...', result: 'પાત્ર યોજનાઓ', check: 'પાત્રતા તપાસો', state: 'રાજ્ય', category: 'શ્રેણી', landSize: 'જમીનનું કદ (એકર)', gender: 'લિંગ' },
    te: { title: 'ప్రభుత్వ పథకాలు', desc: 'సంక్షేమ కార్యక్రమాల కోసం అర్హత మరియు దరఖాస్తు గడువులను తనిఖీ చేయండి.', loading: 'వ్యక్తిగతీకరించిన పథకాలను పొందుతోంది...', result: 'అర్హత ఉన్న పథకాలు', check: 'అర్హతను తనిఖీ చేయండి', state: 'రాష్ట్రం', category: 'వర్గం', landSize: 'భూమి పరిమాణం (ఎకరాలు)', gender: 'లింగం' },
    kn: { title: 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು', desc: 'ಕಲ್ಯಾಣ ಕಾರ್ಯಕ್ರಮಗಳಿಗೆ ಅರ್ಹತೆ ಮತ್ತು ಅರ್ಜಿ ಸಲ್ಲಿಸುವ ಕೊನೆಯ ದಿನಾಂಕಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.', loading: 'ವೈಯಕ್ತಿಕಗೊಳಿಸಿದ ಯೋಜನೆಗಳನ್ನು ತರಲಾಗುತ್ತಿದೆ...', result: 'ಅರ್ಹ ಯೋಜನೆಗಳು', check: 'ಅರ್ಹತೆಯನ್ನು ಪರಿಶೀಲಿಸಿ', state: 'ರಾಜ್ಯ', category: 'ವರ್ಗ', landSize: 'ಭೂಮಿಯ ಗಾತ್ರ (ಎಕರೆ)', gender: 'ಲಿಂಗ' }
  }[language];

  const fetchSchemes = async (useProfile = false) => {
    setIsLoading(true);
    setResult(null);
    try {
      const schemes = await getGovernmentSchemes(language, useProfile ? profile : undefined);
      setResult(schemes);
    } catch (error) {
      console.error(error);
      setResult('Failed to load schemes. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes(false);
  }, [language]); // Re-fetch default schemes when language changes

  const handleCheckEligibility = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSchemes(true);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-primary/10 p-2.5 rounded-xl">
                <Landmark size={24} className="text-primary" />
              </div>
              <CardTitle className="text-2xl">{t.title}</CardTitle>
            </div>
            <CardDescription className="text-base">{t.desc}</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleCheckEligibility} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 bg-muted/30 p-4 rounded-xl border border-border">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{t.state}</label>
                <select 
                  value={profile.state}
                  onChange={(e) => setProfile({...profile, state: e.target.value})}
                  className="w-full p-2 rounded-md border border-input bg-background text-foreground"
                >
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{t.category}</label>
                <select 
                  value={profile.category}
                  onChange={(e) => setProfile({...profile, category: e.target.value})}
                  className="w-full p-2 rounded-md border border-input bg-background text-foreground"
                >
                  <option value="General">General</option>
                  <option value="OBC">OBC</option>
                  <option value="SC/ST">SC/ST</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{t.landSize}</label>
                <input 
                  type="number" 
                  min="0"
                  step="0.1"
                  value={profile.landSize}
                  onChange={(e) => setProfile({...profile, landSize: parseFloat(e.target.value) || 0})}
                  className="w-full p-2 rounded-md border border-input bg-background text-foreground"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{t.gender}</label>
                <select 
                  value={profile.gender}
                  onChange={(e) => setProfile({...profile, gender: e.target.value})}
                  className="w-full p-2 rounded-md border border-input bg-background text-foreground"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div className="md:col-span-2 lg:col-span-4 flex justify-end mt-2">
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                  {t.check}
                </button>
              </div>
            </form>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 text-primary">
                <Loader2 size={40} className="animate-spin mb-4" />
                <p className="font-medium text-muted-foreground">{t.loading}</p>
              </div>
            ) : result ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mt-4"
              >
                <div className="flex items-center gap-2 mb-6">
                  <CheckCircle2 size={24} className="text-primary" />
                  <h3 className="text-xl font-bold text-foreground">{t.result}</h3>
                </div>
                <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-foreground/90">
                  <Markdown>{result}</Markdown>
                </div>
              </motion.div>
            ) : null}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Schemes;
