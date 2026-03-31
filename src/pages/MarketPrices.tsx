import React, { useState } from 'react';
import { TrendingUp, MapPin, Search, Loader2, IndianRupee, Calendar, AlertCircle, Sprout } from 'lucide-react';
import { useAppContext } from '../store/AppContext';
import { forecastCropPrices } from '../lib/gemini';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface ForecastData {
  date: string;
  price: number;
  trend: string;
  confidence: number;
}

interface ForecastResponse {
  summary: string;
  forecast: ForecastData[];
}

const MarketPrices = () => {
  const { language } = useAppContext();
  const [crop, setCrop] = useState('');
  const [market, setMarket] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forecastData, setForecastData] = useState<ForecastResponse | null>(null);

  const t = {
    en: {
      title: 'AI Price Forecast',
      desc: 'Predict mandi crop prices 30 days ahead using AI.',
      cropLabel: 'Crop Name (e.g., Wheat, Tomato)',
      marketLabel: 'Mandi/Market Location (e.g., Azadpur, Delhi)',
      predictBtn: 'Generate Forecast',
      loading: 'Analyzing market trends...',
      pricePerQuintal: 'Price (₹/Quintal)',
      summary: 'Market Outlook',
      error: 'Failed to generate forecast. Please try again.',
      date: 'Date',
      price: 'Price',
      trend: 'Trend',
      confidence: 'Confidence'
    },
    hi: {
      title: 'AI मूल्य पूर्वानुमान',
      desc: 'AI का उपयोग करके 30 दिन आगे मंडी फसल की कीमतों की भविष्यवाणी करें।',
      cropLabel: 'फसल का नाम (उदा., गेहूं, टमाटर)',
      marketLabel: 'मंडी/बाजार स्थान (उदा., आजादपुर, दिल्ली)',
      predictBtn: 'पूर्वानुमान उत्पन्न करें',
      loading: 'बाजार के रुझानों का विश्लेषण कर रहा है...',
      pricePerQuintal: 'मूल्य (₹/क्विंटल)',
      summary: 'बाजार का दृष्टिकोण',
      error: 'पूर्वानुमान उत्पन्न करने में विफल। कृपया पुन: प्रयास करें।',
      date: 'तारीख',
      price: 'मूल्य',
      trend: 'रुझान',
      confidence: 'आत्मविश्वास'
    },
    mr: {
      title: 'AI किंमत अंदाज',
      desc: 'AI वापरून 30 दिवस पुढे बाजार समितीच्या पिकांच्या किमतींचा अंदाज घ्या.',
      cropLabel: 'पिकाचे नाव (उदा., गहू, टोमॅटो)',
      marketLabel: 'बाजार समिती/स्थान (उदा., आझादपूर, दिल्ली)',
      predictBtn: 'अंदाज तयार करा',
      loading: 'बाजारातील ट्रेंडचे विश्लेषण करत आहे...',
      pricePerQuintal: 'किंमत (₹/क्विंटल)',
      summary: 'बाजाराचा दृष्टिकोन',
      error: 'अंदाज तयार करण्यात अयशस्वी. कृपया पुन्हा प्रयत्न करा.',
      date: 'तारीख',
      price: 'किंमत',
      trend: 'कल',
      confidence: 'आत्मविश्वास'
    },
    pa: {
      title: 'AI ਕੀਮਤ ਪੂਰਵ ਅਨੁਮਾਨ',
      desc: 'AI ਦੀ ਵਰਤੋਂ ਕਰਕੇ 30 ਦਿਨ ਅੱਗੇ ਮੰਡੀ ਦੀਆਂ ਫਸਲਾਂ ਦੀਆਂ ਕੀਮਤਾਂ ਦੀ ਭਵਿੱਖਬਾਣੀ ਕਰੋ।',
      cropLabel: 'ਫਸਲ ਦਾ ਨਾਮ (ਜਿਵੇਂ, ਕਣਕ, ਟਮਾਟਰ)',
      marketLabel: 'ਮੰਡੀ/ਬਾਜ਼ਾਰ ਸਥਾਨ (ਜਿਵੇਂ, ਆਜ਼ਾਦਪੁਰ, ਦਿੱਲੀ)',
      predictBtn: 'ਪੂਰਵ ਅਨੁਮਾਨ ਤਿਆਰ ਕਰੋ',
      loading: 'ਬਾਜ਼ਾਰ ਦੇ ਰੁਝਾਨਾਂ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰ ਰਿਹਾ ਹੈ...',
      pricePerQuintal: 'ਕੀਮਤ (₹/ਕੁਇੰਟਲ)',
      summary: 'ਬਾਜ਼ਾਰ ਦਾ ਨਜ਼ਰੀਆ',
      error: 'ਪੂਰਵ ਅਨੁਮਾਨ ਤਿਆਰ ਕਰਨ ਵਿੱਚ ਅਸਫਲ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
      date: 'ਤਾਰੀਖ',
      price: 'ਕੀਮਤ',
      trend: 'ਰੁਝਾਨ',
      confidence: 'ਵਿਸ਼ਵਾਸ'
    },
    gu: {
      title: 'AI ભાવની આગાહી',
      desc: 'AI નો ઉપયોગ કરીને 30 દિવસ આગળ મંડી પાકના ભાવની આગાહી કરો.',
      cropLabel: 'પાકનું નામ (દા.ત., ઘઉં, ટામેટા)',
      marketLabel: 'મંડી/બજાર સ્થાન (દા.ત., આઝાદપુર, દિલ્હી)',
      predictBtn: 'આગાહી બનાવો',
      loading: 'બજારના વલણોનું વિશ્લેષણ કરી રહ્યું છે...',
      pricePerQuintal: 'કિંમત (₹/ક્વિન્ટલ)',
      summary: 'બજારનો દૃષ્ટિકોણ',
      error: 'આગાહી બનાવવામાં નિષ્ફળ. કૃપા કરીને ફરી પ્રયાસ કરો.',
      date: 'તારીખ',
      price: 'કિંમત',
      trend: 'વલણ',
      confidence: 'આત્મવિશ્વાસ'
    },
    te: {
      title: 'AI ధర సూచన',
      desc: 'AIని ఉపయోగించి 30 రోజుల ముందు మండి పంట ధరలను అంచనా వేయండి.',
      cropLabel: 'పంట పేరు (ఉదా., గోధుమ, టమోటా)',
      marketLabel: 'మండి/మార్కెట్ స్థానం (ఉదా., ఆజాద్‌పూర్, ఢిల్లీ)',
      predictBtn: 'సూచనను రూపొందించండి',
      loading: 'మార్కెట్ ట్రెండ్‌లను విశ్లేషిస్తోంది...',
      pricePerQuintal: 'ధర (₹/క్వింటాల్)',
      summary: 'మార్కెట్ దృక్పథం',
      error: 'సూచనను రూపొందించడంలో విఫలమైంది. దయచేసి మళ్లీ ప్రయత్నించండి.',
      date: 'తేదీ',
      price: 'ధర',
      trend: 'ట్రెండ్',
      confidence: 'నమ్మకం'
    },
    kn: {
      title: 'AI ಬೆಲೆ ಮುನ್ಸೂಚನೆ',
      desc: 'AI ಬಳಸಿ 30 ದಿನಗಳ ಮುಂದಿನ ಮಂಡಿ ಬೆಳೆ ಬೆಲೆಗಳನ್ನು ಊಹಿಸಿ.',
      cropLabel: 'ಬೆಳೆಯ ಹೆಸರು (ಉದಾ., ಗೋಧಿ, ಟೊಮೆಟೊ)',
      marketLabel: 'ಮಂಡಿ/ಮಾರುಕಟ್ಟೆ ಸ್ಥಳ (ಉದಾ., ಆಜಾದ್‌ಪುರ, ದೆಹಲಿ)',
      predictBtn: 'ಮುನ್ಸೂಚನೆ ರಚಿಸಿ',
      loading: 'ಮಾರುಕಟ್ಟೆ ಪ್ರವೃತ್ತಿಗಳನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...',
      pricePerQuintal: 'ಬೆಲೆ (₹/ಕ್ವಿಂಟಾಲ್)',
      summary: 'ಮಾರುಕಟ್ಟೆ ದೃಷ್ಟಿಕೋನ',
      error: 'ಮುನ್ಸೂಚನೆ ರಚಿಸಲು ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
      date: 'ದಿನಾಂಕ',
      price: 'ಬೆಲೆ',
      trend: 'ಪ್ರವೃತ್ತಿ',
      confidence: 'ವಿಶ್ವಾಸ'
    }
  }[language];

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!crop.trim() || !market.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const data = await forecastCropPrices(crop, market, language);
      setForecastData(data);
    } catch (err) {
      console.error(err);
      setError(t.error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-3 rounded-lg shadow-lg">
          <p className="font-medium mb-1">{formatDate(label)}</p>
          <p className="text-primary font-bold">
            ₹{payload[0].value} / Quintal
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {t.confidence}: {payload[0].payload.confidence}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Card className="overflow-hidden border-none shadow-md">
        <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500" />
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2.5 rounded-2xl">
              <IndianRupee size={26} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <CardTitle className="text-2xl">{t.title}</CardTitle>
          </div>
          <CardDescription className="text-base">{t.desc}</CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handlePredict} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Sprout size={16} className="text-muted-foreground" />
                  {t.cropLabel}
                </label>
                <input
                  type="text"
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  placeholder="e.g., Onion, Tomato, Wheat"
                  className="w-full p-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <MapPin size={16} className="text-muted-foreground" />
                  {t.marketLabel}
                </label>
                <input
                  type="text"
                  value={market}
                  onChange={(e) => setMarket(e.target.value)}
                  placeholder="e.g., Lasalgaon, Azadpur"
                  className="w-full p-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full md:w-auto py-6 px-8 rounded-xl text-lg font-medium shadow-lg hover:shadow-xl transition-all"
              disabled={isLoading || !crop.trim() || !market.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {t.loading}
                </>
              ) : (
                <>
                  <TrendingUp className="mr-2 h-5 w-5" />
                  {t.predictBtn}
                </>
              )}
            </Button>
          </form>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-3 border border-red-200 dark:border-red-800/30"
            >
              <AlertCircle size={20} />
              <p>{error}</p>
            </motion.div>
          )}

          {forecastData && !isLoading && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 space-y-6"
            >
              <div className="p-5 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
                <h3 className="font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2 mb-2">
                  <TrendingUp size={18} />
                  {t.summary}
                </h3>
                <p className="text-emerald-700 dark:text-emerald-400/90 leading-relaxed">
                  {forecastData.summary}
                </p>
              </div>

              <div className="bg-card border border-border rounded-2xl p-4 md:p-6 shadow-sm">
                <h3 className="font-semibold mb-6 flex items-center gap-2">
                  <Calendar size={18} className="text-muted-foreground" />
                  30-Day Forecast: {crop} at {market}
                </h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={forecastData.forecast} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={formatDate}
                        tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                        axisLine={false}
                        tickLine={false}
                        minTickGap={30}
                      />
                      <YAxis 
                        tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => `₹${value}`}
                        width={60}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area 
                        type="monotone" 
                        dataKey="price" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorPrice)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketPrices;
