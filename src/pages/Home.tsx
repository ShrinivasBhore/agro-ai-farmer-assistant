import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Camera, Sprout, Landmark, CloudSun, ArrowRight, Droplets, Wind, MapPin, CalendarDays, CheckCircle2, TrendingUp, Activity, FileText, AlertCircle, CheckCircle, Users, Bell, Newspaper } from 'lucide-react';
import { useAppContext } from '../store/AppContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, Legend } from 'recharts';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

const Home = () => {
  const { language, weather, location, locationName, fetchLocationAndWeather } = useAppContext();

  const t = {
    en: {
      greeting: 'Welcome, Kisan!',
      subtitle: 'Your 24/7 Smart Agriculture Assistant',
      weather: 'Current Weather',
      forecast: '7-Day Forecast',
      temp: 'Temperature',
      rain: 'Rainfall',
      wind: 'Wind',
      detectLoc: 'Detect Location',
      quickActions: 'Quick Actions',
      chat: 'Ask Kisan Mitra',
      chatDesc: 'Get instant expert advice',
      scan: 'Disease Scan',
      scanDesc: 'Upload photo for diagnosis',
      plan: 'Crop Planner',
      planDesc: 'Data-driven crop selection',
      schemes: 'Govt Schemes',
      schemesDesc: 'Find benefits you qualify for',
      calendarTitle: 'Farming Calendar',
      currentSeason: 'Zaid (Summer) Season',
      seasonTasks: ['Harvesting Rabi crops', 'Field preparation for summer', 'Sowing summer vegetables (Okra, Gourds)', 'Ensuring proper irrigation'],
      performanceTitle: 'Farm Performance',
      yieldLabel: 'Yield (Q)',
      expenseLabel: 'Expense (₹)',
      timelineTitle: 'Crop Health Timeline',
      reportTitle: 'AI Weekly Report',
      reportContent: 'Your crops are growing well. Soil moisture is optimal. Watch out for early signs of aphids due to rising humidity. Consider applying neem oil spray this weekend.',
      reportDate: 'Week of Mar 25, 2026',
      communityTitle: 'Community Feed',
      communityTips: 'Nearby Farmers',
      communityNews: 'Market News',
      communityAlerts: 'Local Alerts',
    },
    hi: {
      greeting: 'नमस्ते, किसान!',
      subtitle: 'आपका 24/7 स्मार्ट कृषि सहायक',
      weather: 'वर्तमान मौसम',
      forecast: '7-दिवसीय पूर्वानुमान',
      temp: 'तापमान',
      rain: 'वर्षा',
      wind: 'हवा',
      detectLoc: 'स्थान का पता लगाएं',
      quickActions: 'त्वरित कार्रवाई',
      chat: 'किसान मित्र से पूछें',
      chatDesc: 'तुरंत विशेषज्ञ सलाह लें',
      scan: 'रोग स्कैन',
      scanDesc: 'निदान के लिए फोटो अपलोड करें',
      plan: 'फसल योजनाकार',
      planDesc: 'डेटा-संचालित फसल चयन',
      schemes: 'सरकारी योजनाएं',
      schemesDesc: 'वे लाभ खोजें जिनके आप पात्र हैं',
      calendarTitle: 'कृषि कैलेंडर',
      currentSeason: 'ज़ैद (ग्रीष्म) ऋतु',
      seasonTasks: ['रबी फसलों की कटाई', 'गर्मियों के लिए खेत की तैयारी', 'गर्मियों की सब्जियां बोना (भिंडी, लौकी)', 'उचित सिंचाई सुनिश्चित करना'],
      performanceTitle: 'खेत का प्रदर्शन',
      yieldLabel: 'उपज (Q)',
      expenseLabel: 'खर्च (₹)',
      timelineTitle: 'फसल स्वास्थ्य टाइमलाइन',
      reportTitle: 'एआई साप्ताहिक रिपोर्ट',
      reportContent: 'आपकी फसलें अच्छी तरह बढ़ रही हैं। मिट्टी की नमी इष्टतम है। बढ़ती नमी के कारण एफिड्स के शुरुआती लक्षणों पर नज़र रखें। इस सप्ताहांत नीम के तेल का स्प्रे करने पर विचार करें।',
      reportDate: '25 मार्च, 2026 का सप्ताह',
      communityTitle: 'सामुदायिक फ़ीड',
      communityTips: 'आसपास के किसान',
      communityNews: 'बाज़ार समाचार',
      communityAlerts: 'स्थानीय अलर्ट',
    },
    mr: {
      greeting: 'नमस्कार, शेतकरी!',
      subtitle: 'तुमचा 24/7 स्मार्ट कृषी सहाय्यक',
      weather: 'सध्याचे हवामान',
      forecast: '7-दिवसांचा अंदाज',
      temp: 'तापमान',
      rain: 'पाऊस',
      wind: 'वारा',
      detectLoc: 'स्थान शोधा',
      quickActions: 'त्वरित कृती',
      chat: 'किसान मित्राला विचारा',
      chatDesc: 'त्वरित तज्ञांचा सल्ला मिळवा',
      scan: 'रोग स्कॅन',
      scanDesc: 'निदानासाठी फोटो अपलोड करा',
      plan: 'पीक नियोजक',
      planDesc: 'डेटा-चालित पीक निवड',
      schemes: 'सरकारी योजना',
      schemesDesc: 'तुम्ही पात्र असलेले फायदे शोधा',
      calendarTitle: 'कृषी दिनदर्शिका',
      currentSeason: 'उन्हाळी हंगाम',
      seasonTasks: ['रब्बी पिकांची काढणी', 'उन्हाळ्यासाठी शेतीची तयारी', 'उन्हाळी भाज्यांची पेरणी', 'योग्य सिंचन सुनिश्चित करणे'],
      performanceTitle: 'शेतीची कामगिरी',
      yieldLabel: 'उत्पन्न (Q)',
      expenseLabel: 'खर्च (₹)',
      timelineTitle: 'पीक आरोग्य टाइमलाइन',
      reportTitle: 'एआय साप्ताहिक अहवाल',
      reportContent: 'तुमची पिके चांगली वाढत आहेत. जमिनीतील ओलावा इष्टतम आहे. वाढत्या आर्द्रतेमुळे मावा किडीच्या सुरुवातीच्या लक्षणांवर लक्ष ठेवा. या आठवड्याच्या शेवटी कडुनिंबाच्या तेलाची फवारणी करण्याचा विचार करा.',
      reportDate: '२५ मार्च २०२६ चा आठवडा',
      communityTitle: 'समुदाय फीड',
      communityTips: 'जवळपासचे शेतकरी',
      communityNews: 'बाजार बातम्या',
      communityAlerts: 'स्थानिक सूचना',
    },
    pa: {
      greeting: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ, ਕਿਸਾਨ!',
      subtitle: 'ਤੁਹਾਡਾ 24/7 ਸਮਾਰਟ ਖੇਤੀ ਸਹਾਇਕ',
      weather: 'ਮੌਜੂਦਾ ਮੌਸਮ',
      forecast: '7-ਦਿਨਾਂ ਦੀ ਭਵਿੱਖਬਾਣੀ',
      temp: 'ਤਾਪਮਾਨ',
      rain: 'ਮੀਂਹ',
      wind: 'ਹਵਾ',
      detectLoc: 'ਟਿਕਾਣਾ ਲੱਭੋ',
      quickActions: 'ਤੁਰੰਤ ਕਾਰਵਾਈਆਂ',
      chat: 'ਕਿਸਾਨ ਮਿੱਤਰ ਨੂੰ ਪੁੱਛੋ',
      chatDesc: 'ਤੁਰੰਤ ਮਾਹਰ ਸਲਾਹ ਲਓ',
      scan: 'ਬਿਮਾਰੀ ਸਕੈਨ',
      scanDesc: 'ਨਿਦਾਨ ਲਈ ਫੋਟੋ ਅਪਲੋਡ ਕਰੋ',
      plan: 'ਫਸਲ ਯੋਜਨਾਕਾਰ',
      planDesc: 'ਡਾਟਾ-ਅਧਾਰਤ ਫਸਲ ਚੋਣ',
      schemes: 'ਸਰਕਾਰੀ ਸਕੀਮਾਂ',
      schemesDesc: 'ਉਹ ਲਾਭ ਲੱਭੋ ਜਿਨ੍ਹਾਂ ਦੇ ਤੁਸੀਂ ਯੋਗ ਹੋ',
      calendarTitle: 'ਖੇਤੀ ਕੈਲੰਡਰ',
      currentSeason: 'ਜ਼ੈਦ (ਗਰਮੀਆਂ) ਦਾ ਮੌਸਮ',
      seasonTasks: ['ਹਾੜੀ ਦੀਆਂ ਫਸਲਾਂ ਦੀ ਵਾਢੀ', 'ਗਰਮੀਆਂ ਲਈ ਖੇਤ ਦੀ ਤਿਆਰੀ', 'ਗਰਮੀਆਂ ਦੀਆਂ ਸਬਜ਼ੀਆਂ ਬੀਜਣਾ', 'ਸਹੀ ਸਿੰਚਾਈ ਯਕੀਨੀ ਬਣਾਉਣਾ'],
      performanceTitle: 'ਖੇਤ ਦਾ ਪ੍ਰਦਰਸ਼ਨ',
      yieldLabel: 'ਝਾੜ (Q)',
      expenseLabel: 'ਖਰਚਾ (₹)',
      timelineTitle: 'ਫਸਲ ਦੀ ਸਿਹਤ ਟਾਈਮਲਾਈਨ',
      reportTitle: 'AI ਹਫਤਾਵਾਰੀ ਰਿਪੋਰਟ',
      reportContent: 'ਤੁਹਾਡੀਆਂ ਫਸਲਾਂ ਚੰਗੀ ਤਰ੍ਹਾਂ ਵਧ ਰਹੀਆਂ ਹਨ। ਮਿੱਟੀ ਦੀ ਨਮੀ ਅਨੁਕੂਲ ਹੈ। ਵੱਧ ਰਹੀ ਨਮੀ ਕਾਰਨ ਐਫੀਡਜ਼ ਦੇ ਸ਼ੁਰੂਆਤੀ ਲੱਛਣਾਂ ਦਾ ਧਿਆਨ ਰੱਖੋ। ਇਸ ਹਫਤੇ ਦੇ ਅੰਤ ਵਿੱਚ ਨਿੰਮ ਦੇ ਤੇਲ ਦਾ ਸਪਰੇਅ ਕਰਨ ਬਾਰੇ ਵਿਚਾਰ ਕਰੋ।',
      reportDate: '25 ਮਾਰਚ, 2026 ਦਾ ਹਫ਼ਤਾ',
      communityTitle: 'ਕਮਿਊਨਿਟੀ ਫੀਡ',
      communityTips: 'ਨੇੜਲੇ ਕਿਸਾਨ',
      communityNews: 'ਮਾਰਕੀਟ ਨਿਊਜ਼',
      communityAlerts: 'ਸਥਾਨਕ ਅਲਰਟ',
    },
    gu: {
      greeting: 'નમસ્તે, કિસાન!',
      subtitle: 'તમારો 24/7 સ્માર્ટ કૃષિ સહાયક',
      weather: 'વર્તમાન હવામાન',
      forecast: '7-દિવસની આગાહી',
      temp: 'તાપમાન',
      rain: 'વરસાદ',
      wind: 'પવન',
      detectLoc: 'સ્થાન શોધો',
      quickActions: 'ઝડપી ક્રિયાઓ',
      chat: 'કિસાન મિત્રને પૂછો',
      chatDesc: 'તાત્કાલિક નિષ્ણાતની સલાહ લો',
      scan: 'રોગ સ્કેન',
      scanDesc: 'નિદાન માટે ફોટો અપલોડ કરો',
      plan: 'પાક આયોજક',
      planDesc: 'ડેટા-આધારિત પાક પસંદગી',
      schemes: 'સરકારી યોજનાઓ',
      schemesDesc: 'તમે લાયક છો તે લાભો શોધો',
      calendarTitle: 'કૃષિ કેલેન્ડર',
      currentSeason: 'ઝૈદ (ઉનાળો) ઋતુ',
      seasonTasks: ['રવિ પાકની લણણી', 'ઉનાળા માટે ખેતરની તૈયારી', 'ઉનાળાના શાકભાજી વાવવા', 'યોગ્ય સિંચાઈ સુનિશ્ચિત કરવી'],
      performanceTitle: 'ખેતરનું પ્રદર્શન',
      yieldLabel: 'ઉપજ (Q)',
      expenseLabel: 'ખર્ચ (₹)',
      timelineTitle: 'પાક આરોગ્ય ટાઇમલાઇન',
      reportTitle: 'AI સાપ્તાહિક રિપોર્ટ',
      reportContent: 'તમારો પાક સારી રીતે ઉગી રહ્યો છે. જમીનમાં ભેજ શ્રેષ્ઠ છે. વધતા ભેજને કારણે એફિડ્સના પ્રારંભિક ચિહ્નો પર ધ્યાન આપો. આ સપ્તાહના અંતે લીમડાના તેલનો છંટકાવ કરવાનું વિચારો.',
      reportDate: '25 માર્ચ, 2026 નું સપ્તાહ',
      communityTitle: 'સમુદાય ફીડ',
      communityTips: 'નજીકના ખેડૂતો',
      communityNews: 'બજાર સમાચાર',
      communityAlerts: 'સ્થાનિક ચેતવણીઓ',
    },
    te: {
      greeting: 'నమస్కారం, రైతు!',
      subtitle: 'మీ 24/7 స్మార్ట్ వ్యవసాయ సహాయకుడు',
      weather: 'ప్రస్తుత వాతావరణం',
      forecast: '7-రోజుల సూచన',
      temp: 'ఉష్ణోగ్రత',
      rain: 'వర్షపాతం',
      wind: 'గాలి',
      detectLoc: 'స్థానాన్ని గుర్తించండి',
      quickActions: 'త్వరిత చర్యలు',
      chat: 'కిసాన్ మిత్రను అడగండి',
      chatDesc: 'తక్షణ నిపుణుల సలహా పొందండి',
      scan: 'వ్యాధి స్కాన్',
      scanDesc: 'రోగ నిర్ధారణ కోసం ఫోటోను అప్‌లోడ్ చేయండి',
      plan: 'పంట ప్రణాళిక',
      planDesc: 'డేటా-ఆధారిత పంట ఎంపిక',
      schemes: 'ప్రభుత్వ పథకాలు',
      schemesDesc: 'మీరు అర్హత పొందిన ప్రయోజనాలను కనుగొనండి',
      calendarTitle: 'వ్యవసాయ క్యాలెండర్',
      currentSeason: 'జైద్ (వేసవి) సీజన్',
      seasonTasks: ['రబీ పంటల కోత', 'వేసవి కోసం పొలం తయారీ', 'వేసవి కూరగాయలు విత్తడం', 'సరైన నీటిపారుదల నిర్ధారించడం'],
      performanceTitle: 'పొలం పనితీరు',
      yieldLabel: 'దిగుబడి (Q)',
      expenseLabel: 'ఖర్చు (₹)',
      timelineTitle: 'పంట ఆరోగ్య కాలక్రమం',
      reportTitle: 'AI వారపు నివేదిక',
      reportContent: 'మీ పంటలు బాగా పెరుగుతున్నాయి. నేల తేమ సరైనది. పెరుగుతున్న తేమ కారణంగా అఫిడ్స్ యొక్క ప్రారంభ సంకేతాల కోసం చూడండి. ఈ వారాంతంలో వేప నూనె స్ప్రే వేయాలని ఆలోచించండి.',
      reportDate: 'మార్చి 25, 2026 వారం',
      communityTitle: 'కమ్యూనిటీ ఫీడ్',
      communityTips: 'సమీప రైతులు',
      communityNews: 'మార్కెట్ వార్తలు',
      communityAlerts: 'స్థానిక హెచ్చరికలు',
    },
    kn: {
      greeting: 'ನಮಸ್ಕಾರ, ರೈತ!',
      subtitle: 'ನಿಮ್ಮ 24/7 ಸ್ಮಾರ್ಟ್ ಕೃಷಿ ಸಹಾಯಕ',
      weather: 'ಪ್ರಸ್ತುತ ಹವಾಮಾನ',
      forecast: '7-ದಿನಗಳ ಮುನ್ಸೂಚನೆ',
      temp: 'ತಾಪಮಾನ',
      rain: 'ಮಳೆ',
      wind: 'ಗಾಳಿ',
      detectLoc: 'ಸ್ಥಳವನ್ನು ಪತ್ತೆಹಚ್ಚಿ',
      quickActions: 'ತ್ವರಿತ ಕ್ರಿಯೆಗಳು',
      chat: 'ಕಿಸಾನ್ ಮಿತ್ರನನ್ನು ಕೇಳಿ',
      chatDesc: 'ತಕ್ಷಣದ ತಜ್ಞರ ಸಲಹೆ ಪಡೆಯಿರಿ',
      scan: 'ರೋಗ ಸ್ಕ್ಯಾನ್',
      scanDesc: 'ರೋಗನಿರ್ಣಯಕ್ಕಾಗಿ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
      plan: 'ಬೆಳೆ ಯೋಜಕ',
      planDesc: 'ಡೇಟಾ-ಚಾಲಿತ ಬೆಳೆ ಆಯ್ಕೆ',
      schemes: 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು',
      schemesDesc: 'ನೀವು ಅರ್ಹರಾಗಿರುವ ಪ್ರಯೋಜನಗಳನ್ನು ಹುಡುಕಿ',
      calendarTitle: 'ಕೃಷಿ ಕ್ಯಾಲೆಂಡರ್',
      currentSeason: 'ಜೈದ್ (ಬೇಸಿಗೆ) ಋತು',
      seasonTasks: ['ರಬಿ ಬೆಳೆಗಳ ಕೊಯ್ಲು', 'ಬೇಸಿಗೆಗಾಗಿ ಹೊಲ ಸಿದ್ಧತೆ', 'ಬೇಸಿಗೆ ತರಕಾರಿಗಳನ್ನು ಬಿತ್ತುವುದು', 'ಸರಿಯಾದ ನೀರಾವರಿ ಖಚಿತಪಡಿಸಿಕೊಳ್ಳುವುದು'],
      performanceTitle: 'ಕೃಷಿ ಕಾರ್ಯಕ್ಷಮತೆ',
      yieldLabel: 'ಇಳುವರಿ (Q)',
      expenseLabel: 'ವೆಚ್ಚ (₹)',
      timelineTitle: 'ಬೆಳೆ ಆರೋಗ್ಯ ಟೈಮ್‌ಲೈನ್',
      reportTitle: 'AI ಸಾಪ್ತಾಹಿಕ ವರದಿ',
      reportContent: 'ನಿಮ್ಮ ಬೆಳೆಗಳು ಚೆನ್ನಾಗಿ ಬೆಳೆಯುತ್ತಿವೆ. ಮಣ್ಣಿನ ತೇವಾಂಶವು ಸೂಕ್ತವಾಗಿದೆ. ಹೆಚ್ಚುತ್ತಿರುವ ಆರ್ದ್ರತೆಯಿಂದಾಗಿ ಗಿಡಹೇನುಗಳ ಆರಂಭಿಕ ಚಿಹ್ನೆಗಳ ಬಗ್ಗೆ ಗಮನಹರಿಸಿ. ಈ ವಾರಾಂತ್ಯದಲ್ಲಿ ಬೇವಿನ ಎಣ್ಣೆ ಸಿಂಪಡಿಸಲು ಪರಿಗಣಿಸಿ.',
      reportDate: 'ಮಾರ್ಚ್ 25, 2026 ರ ವಾರ',
      communityTitle: 'ಸಮುದಾಯ ಫೀಡ್',
      communityTips: 'ಹತ್ತಿರದ ರೈತರು',
      communityNews: 'ಮಾರುಕಟ್ಟೆ ಸುದ್ದಿ',
      communityAlerts: 'ಸ್ಥಳೀಯ ಎಚ್ಚರಿಕೆಗಳು',
    }
  }[language];

  const actions = [
    { to: '/chat', icon: <MessageSquare size={28} className="text-blue-500 dark:text-blue-400" />, title: t.chat, desc: t.chatDesc, color: 'bg-blue-50 dark:bg-blue-900/20' },
    { to: '/disease', icon: <Camera size={28} className="text-red-500 dark:text-red-400" />, title: t.scan, desc: t.scanDesc, color: 'bg-red-50 dark:bg-red-900/20' },
    { to: '/planner', icon: <Sprout size={28} className="text-primary" />, title: t.plan, desc: t.planDesc, color: 'bg-primary/10' },
    { to: '/schemes', icon: <Landmark size={28} className="text-purple-500 dark:text-purple-400" />, title: t.schemes, desc: t.schemesDesc, color: 'bg-purple-50 dark:bg-purple-900/20' },
  ];

  const chartData = weather?.daily?.time?.map((timeStr: string, index: number) => {
    const date = new Date(timeStr);
    return {
      day: date.toLocaleDateString(language === 'en' ? 'en-US' : 'en-IN', { weekday: 'short' }),
      maxTemp: weather.daily.temperature_2m_max[index],
      minTemp: weather.daily.temperature_2m_min[index],
      rain: weather.daily.precipitation_sum[index],
    };
  }) || [];

  const performanceData = [
    { month: 'Jan', yield: 45, expense: 12000 },
    { month: 'Feb', yield: 52, expense: 15000 },
    { month: 'Mar', yield: 38, expense: 10000 },
    { month: 'Apr', yield: 65, expense: 18000 },
    { month: 'May', yield: 48, expense: 14000 },
    { month: 'Jun', yield: 55, expense: 16000 },
  ];

  const timelineData = [
    { date: 'Mar 20, 2026', event: 'Leaf Blight Detected', action: 'Applied Copper Fungicide', status: 'resolved' },
    { date: 'Mar 15, 2026', event: 'Aphids Spotted', action: 'Sprayed Neem Oil', status: 'resolved' },
    { date: 'Mar 02, 2026', event: 'Nutrient Deficiency', action: 'Added NPK Fertilizer', status: 'resolved' },
  ];

  const communityData = [
    { type: 'tip', author: 'Ramesh P.', distance: '2km away', content: 'Using marigold as a trap crop reduced nematode issues in my tomato field.', time: '2h ago' },
    { type: 'news', author: 'Mandi Update', distance: 'Local APMC', content: 'Onion prices expected to rise by ₹200/qtl next week due to lower arrivals.', time: '5h ago' },
    { type: 'alert', author: 'Agri Dept', distance: 'District Level', content: 'Subsidy for drip irrigation extended till April 15. Apply via portal.', time: '1d ago' },
  ];

  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-primary to-accent rounded-3xl p-8 text-primary-foreground shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10">
          <Badge variant="success" className="mb-4 bg-white/20 text-white border-none backdrop-blur-md">v4.0 Update</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">{t.greeting}</h2>
          <p className="text-primary-foreground/80 text-lg font-medium">{t.subtitle}</p>
        </div>
        {!location && (
          <Button 
            onClick={fetchLocationAndWeather}
            variant="secondary"
            className="relative z-10 bg-white text-primary hover:bg-white/90"
          >
            <MapPin size={18} className="mr-2" />
            {t.detectLoc}
          </Button>
        )}
      </motion.div>

      {/* Weather Dashboard */}
      {weather && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Current Weather Card */}
          <Card className="lg:col-span-1 flex flex-col justify-between bg-gradient-to-b from-card to-muted/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CloudSun className="text-orange-500" />
                {t.weather} {locationName ? `in ${locationName}` : ''}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 mb-8">
                <span className="text-6xl font-bold tracking-tighter text-foreground font-mono">{weather.current_weather.temperature}°</span>
                <span className="text-2xl text-muted-foreground mb-2 font-mono">C</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm bg-muted/50 p-3 rounded-2xl border border-border/50">
                  <div className="flex items-center gap-2 text-muted-foreground"><Wind size={18} className="text-blue-400"/> {t.wind}</div>
                  <span className="font-semibold font-mono">{weather.current_weather.windspeed} km/h</span>
                </div>
                <div className="flex items-center justify-between text-sm bg-muted/50 p-3 rounded-2xl border border-border/50">
                  <div className="flex items-center gap-2 text-muted-foreground"><Droplets size={18} className="text-blue-500"/> {t.rain}</div>
                  <span className="font-semibold font-mono">{weather.daily.precipitation_sum[0]} mm</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Forecast Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">{t.forecast}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.5} />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: 'var(--color-muted-foreground)', fontFamily: 'var(--font-mono)'}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: 'var(--color-muted-foreground)', fontFamily: 'var(--font-mono)'}} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-card)', color: 'var(--color-foreground)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                      itemStyle={{ fontFamily: 'var(--font-mono)' }}
                    />
                    <Area type="monotone" dataKey="maxTemp" name={t.temp} stroke="var(--color-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorTemp)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <h3 className="text-xl font-bold mb-4 px-1">{t.quickActions}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {actions.map((action, idx) => (
              <Link 
                key={idx} 
                to={action.to}
              >
                <Card hoverable className="h-full group border-transparent hover:border-border transition-all">
                  <CardContent className="p-5 flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`${action.color} p-3.5 rounded-2xl group-hover:scale-110 transition-transform duration-300`}>
                        {action.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg group-hover:text-primary transition-colors">{action.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{action.desc}</p>
                      </div>
                    </div>
                    <ArrowRight className="text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-1 transition-all mt-2" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Farming Calendar Widget */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-1"
        >
          <h3 className="text-xl font-bold mb-4 px-1">{t.calendarTitle}</h3>
          <Card className="h-[calc(100%-2.5rem)] flex flex-col">
            <CardContent className="p-6 flex-1 flex flex-col">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
                <div className="bg-yellow-500/10 p-3 rounded-2xl text-yellow-600 dark:text-yellow-500">
                  <CalendarDays size={28} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium font-mono">Mar - May</p>
                  <h4 className="font-bold text-lg">{t.currentSeason}</h4>
                </div>
              </div>
              
              <ul className="space-y-4 flex-1">
                {t.seasonTasks.map((task, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle2 size={20} className="text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-foreground/80 leading-relaxed">{task}</span>
                  </li>
                ))}
              </ul>
              
              <Link to="/planner" className="mt-6">
                <Button variant="outline" className="w-full">
                  {t.plan}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Analytics & Reports Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Farm Performance Analytics */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <h3 className="text-xl font-bold mb-4 px-1 flex items-center gap-2">
            <TrendingUp size={24} className="text-primary" />
            {t.performanceTitle}
          </h3>
          <Card className="h-full">
            <CardContent className="p-6">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.5} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: 'var(--color-muted-foreground)', fontFamily: 'var(--font-mono)'}} dy={10} />
                    <YAxis yAxisId="left" orientation="left" stroke="var(--color-primary)" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: 'var(--color-muted-foreground)', fontFamily: 'var(--font-mono)'}} />
                    <YAxis yAxisId="right" orientation="right" stroke="var(--color-destructive)" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: 'var(--color-muted-foreground)', fontFamily: 'var(--font-mono)'}} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-card)', color: 'var(--color-foreground)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                      itemStyle={{ fontFamily: 'var(--font-mono)' }}
                      cursor={{ fill: 'var(--color-muted)', opacity: 0.4 }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar yAxisId="left" dataKey="yield" name={t.yieldLabel} fill="var(--color-primary)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    <Bar yAxisId="right" dataKey="expense" name={t.expenseLabel} fill="var(--color-destructive)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Weekly Report & Timeline */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-1 flex flex-col gap-6"
        >
          {/* AI Weekly Report */}
          <div>
            <h3 className="text-xl font-bold mb-4 px-1 flex items-center gap-2">
              <FileText size={24} className="text-blue-500" />
              {t.reportTitle}
            </h3>
            <Card className="bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 border-none">
                    {t.reportDate}
                  </Badge>
                </div>
                <p className="text-sm leading-relaxed text-foreground/80">
                  {t.reportContent}
                </p>
                <Button variant="ghost" className="w-full mt-4 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30">
                  Read Full Report
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Crop Health Timeline */}
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-4 px-1 flex items-center gap-2">
              <Activity size={24} className="text-green-500" />
              {t.timelineTitle}
            </h3>
            <Card className="h-full">
              <CardContent className="p-5">
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                  {timelineData.map((item, idx) => (
                    <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                        <CheckCircle size={18} />
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-border bg-card shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-sm text-foreground">{item.event}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2 font-mono">{item.date}</p>
                        <p className="text-sm text-foreground/80">{item.action}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>

      {/* Community Feed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h3 className="text-xl font-bold mb-4 px-1 flex items-center gap-2">
          <Users size={24} className="text-orange-500" />
          {t.communityTitle}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {communityData.map((item, idx) => (
            <Card key={idx} className="h-full hover:shadow-md transition-shadow">
              <CardContent className="p-5 flex flex-col h-full">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {item.type === 'tip' && <Users size={18} className="text-orange-500" />}
                    {item.type === 'news' && <Newspaper size={18} className="text-blue-500" />}
                    {item.type === 'alert' && <Bell size={18} className="text-red-500" />}
                    <span className="font-semibold text-sm text-foreground">{item.author}</span>
                  </div>
                  <Badge variant="outline" className="text-xs font-normal text-muted-foreground border-border">
                    {item.time}
                  </Badge>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed flex-1 mb-4">
                  {item.content}
                </p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-auto">
                  <MapPin size={14} />
                  <span>{item.distance}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
