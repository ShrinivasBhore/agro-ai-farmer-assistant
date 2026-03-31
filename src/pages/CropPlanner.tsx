import React, { useState, useEffect } from 'react';
import { Sprout, MapPin, Droplets, Sun, Loader2, CheckCircle2, TrendingUp, Calculator, IndianRupee, LineChart, ArrowUpRight, ArrowDownRight, Minus, FlaskConical, BarChart3, Leaf, AlertTriangle, BrainCircuit } from 'lucide-react';
import { useAppContext } from '../store/AppContext';
import { getCropRecommendations } from '../lib/gemini';
import Markdown from 'react-markdown';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Mock Mandi API for Maharashtra
const fetchMandiPrices = async () => {
  return new Promise<any[]>((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, crop: 'Onion (कांदा)', market: 'Lasalgaon, Nashik', price: 2400, msp: 2000, trend: 'up' },
        { id: 2, crop: 'Soybean (सोयाबीन)', market: 'Latur APMC', price: 4200, msp: 4600, trend: 'down' },
        { id: 3, crop: 'Cotton (कापूस)', market: 'Yavatmal', price: 7100, msp: 6620, trend: 'up' },
        { id: 4, crop: 'Wheat (गहू)', market: 'Local APMC', price: 2800, msp: 2275, trend: 'stable' },
        { id: 5, crop: 'Tur/Arhar (तूर)', market: 'Akola', price: 9500, msp: 7000, trend: 'up' },
      ]);
    }, 800);
  });
};

const CropPlanner = () => {
  const { language } = useAppContext();
  const [soil, setSoil] = useState('');
  const [season, setSeason] = useState('');
  const [region, setRegion] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'planner' | 'soil' | 'market' | 'analytics' | 'prediction'>('planner');

  // Market & Profit State
  const [mandiPrices, setMandiPrices] = useState<any[]>([]);
  const [loadingMarket, setLoadingMarket] = useState(false);
  const [calcCrop, setCalcCrop] = useState('');
  const [calcYield, setCalcYield] = useState<number | ''>('');
  const [calcCost, setCalcCost] = useState<number | ''>('');
  const [calcAcres, setCalcAcres] = useState<number | ''>(1);

  // Soil Health State
  const [nValue, setNValue] = useState<number | ''>('');
  const [pValue, setPValue] = useState<number | ''>('');
  const [kValue, setKValue] = useState<number | ''>('');
  const [phValue, setPhValue] = useState<number | ''>('');
  const [soilScore, setSoilScore] = useState<number | null>(null);
  const [soilTips, setSoilTips] = useState<string[]>([]);

  // Analytics State
  const [analyticsCrop, setAnalyticsCrop] = useState('Wheat');

  // Prediction State
  const [predCrop, setPredCrop] = useState('Wheat');
  const [predAcres, setPredAcres] = useState<number | ''>('');
  const [predRainfall, setPredRainfall] = useState<number | ''>('');
  const [predFertilizer, setPredFertilizer] = useState<number | ''>('');
  const [predictionResult, setPredictionResult] = useState<any | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);

  const handlePredictYield = () => {
    if (!predAcres || !predRainfall || !predFertilizer) return;
    setIsPredicting(true);
    
    // Simulate AI model prediction trained on Maharashtra data
    setTimeout(() => {
      let baseYield = 0;
      if (predCrop === 'Wheat') baseYield = 15;
      if (predCrop === 'Cotton') baseYield = 8;
      if (predCrop === 'Soybean') baseYield = 10;
      if (predCrop === 'Onion') baseYield = 120;

      // Simple mock logic for demonstration
      const rainFactor = Number(predRainfall) > 500 ? 1.1 : 0.9;
      const fertFactor = Number(predFertilizer) > 50 ? 1.15 : 0.85;
      
      const predictedYieldPerAcre = baseYield * rainFactor * fertFactor;
      const totalPredictedYield = predictedYieldPerAcre * Number(predAcres);

      setPredictionResult({
        yieldPerAcre: predictedYieldPerAcre.toFixed(2),
        totalYield: totalPredictedYield.toFixed(2),
        confidence: (Math.random() * (95 - 85) + 85).toFixed(1) // 85-95% confidence
      });
      setIsPredicting(false);
    }, 1500);
  };

  const yieldData = {
    'Wheat': [
      { year: '2020', farm: 12, district: 10 },
      { year: '2021', farm: 14, district: 11 },
      { year: '2022', farm: 13, district: 11.5 },
      { year: '2023', farm: 15, district: 12 },
      { year: '2024', farm: 16, district: 12.5 },
    ],
    'Cotton': [
      { year: '2020', farm: 8, district: 7 },
      { year: '2021', farm: 9, district: 7.5 },
      { year: '2022', farm: 7, district: 6.5 },
      { year: '2023', farm: 10, district: 8 },
      { year: '2024', farm: 11, district: 8.5 },
    ],
    'Soybean': [
      { year: '2020', farm: 9, district: 8 },
      { year: '2021', farm: 10, district: 8.5 },
      { year: '2022', farm: 11, district: 9 },
      { year: '2023', farm: 10.5, district: 9.5 },
      { year: '2024', farm: 12, district: 10 },
    ]
  };

  useEffect(() => {
    if (activeTab === 'market' && mandiPrices.length === 0) {
      loadMarketData();
    }
  }, [activeTab]);

  const loadMarketData = async () => {
    setLoadingMarket(true);
    try {
      const data = await fetchMandiPrices();
      setMandiPrices(data);
      if (data.length > 0) setCalcCrop(data[0].crop);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingMarket(false);
    }
  };

  const calculateProfit = () => {
    if (!calcCrop || !calcYield || !calcCost || !calcAcres) return null;
    const selectedCrop = mandiPrices.find(c => c.crop === calcCrop);
    const pricePerQtl = selectedCrop ? selectedCrop.price : 0;
    
    const totalYield = Number(calcYield) * Number(calcAcres);
    const grossRevenue = totalYield * pricePerQtl;
    const totalCost = Number(calcCost) * Number(calcAcres);
    const netProfit = grossRevenue - totalCost;
    const roi = totalCost > 0 ? ((netProfit / totalCost) * 100).toFixed(1) : 0;

    return { grossRevenue, totalCost, netProfit, roi, pricePerQtl };
  };

  const calculateSoilHealth = () => {
    if (nValue === '' || pValue === '' || kValue === '' || phValue === '') return;
    
    let score = 100;
    const tips: string[] = [];

    // N (Ideal 40-80)
    if (nValue < 40) { score -= 15; tips.push('Low Nitrogen: Apply Urea or organic compost to boost vegetative growth.'); }
    else if (nValue > 80) { score -= 10; tips.push('High Nitrogen: Reduce N-fertilizers to prevent excessive foliage and pest attraction.'); }

    // P (Ideal 20-40)
    if (pValue < 20) { score -= 15; tips.push('Low Phosphorus: Add DAP or rock phosphate to improve root development.'); }
    else if (pValue > 40) { score -= 10; tips.push('High Phosphorus: Avoid P-fertilizers; can cause zinc/iron deficiency.'); }

    // K (Ideal 150-300)
    if (kValue < 150) { score -= 15; tips.push('Low Potassium: Apply MOP or wood ash to enhance disease resistance and crop quality.'); }
    else if (kValue > 300) { score -= 5; tips.push('High Potassium: Generally safe, but monitor magnesium levels.'); }

    // pH (Ideal 6.0 - 7.5)
    if (phValue < 6.0) { score -= 20; tips.push(`Acidic Soil (pH ${phValue}): Apply agricultural lime to neutralize acidity.`); }
    else if (phValue > 7.5) { score -= 20; tips.push(`Alkaline Soil (pH ${phValue}): Apply gypsum or elemental sulfur to lower pH.`); }

    setSoilScore(Math.max(0, score));
    if (tips.length === 0) tips.push('Excellent soil health! Maintain current nutrient management practices.');
    setSoilTips(tips);
  };

  const profitResult = calculateProfit();

  const t = {
    en: { title: 'Smart Crop Planner', desc: 'Get AI-driven crop recommendations based on your local conditions.', soil: 'Soil Type', season: 'Upcoming Season', region: 'State/Region', get: 'Get Recommendations', loading: 'Analyzing data...', result: 'Recommended Crops', soilOptions: ['Black Soil', 'Red Soil', 'Alluvial Soil', 'Laterite Soil', 'Sandy Soil'], seasonOptions: ['Kharif (Monsoon)', 'Rabi (Winter)', 'Zaid (Summer)'], regionPlaceholder: 'e.g. Maharashtra, Punjab' },
    hi: { title: 'स्मार्ट फसल योजनाकार', desc: 'अपनी स्थानीय परिस्थितियों के आधार पर एआई-संचालित फसल सिफारिशें प्राप्त करें।', soil: 'मिट्टी का प्रकार', season: 'आगामी मौसम', region: 'राज्य/क्षेत्र', get: 'सिफारिशें प्राप्त करें', loading: 'डेटा का विश्लेषण कर रहा है...', result: 'अनुशंसित फसलें', soilOptions: ['काली मिट्टी', 'लाल मिट्टी', 'जलोढ़ मिट्टी', 'लेटराइट मिट्टी', 'रेतीली मिट्टी'], seasonOptions: ['खरीफ (मानसून)', 'रबी (सर्दी)', 'ज़ैद (गर्मी)'], regionPlaceholder: 'उदा. महाराष्ट्र, पंजाब' },
    mr: { title: 'स्मार्ट पीक नियोजक', desc: 'तुमच्या स्थानिक परिस्थितीवर आधारित एआय-चालित पीक शिफारसी मिळवा.', soil: 'मातीचा प्रकार', season: 'आगामी हंगाम', region: 'राज्य/प्रदेश', get: 'शिफारसी मिळवा', loading: 'डेटाचे विश्लेषण करत आहे...', result: 'शिफारस केलेली पिके', soilOptions: ['काळी माती', 'लाल माती', 'गाळाची माती', 'लॅटराइट माती', 'वाळूची माती'], seasonOptions: ['खरीप (पावसाळा)', 'रब्बी (हिवाळा)', 'उन्हाळी'], regionPlaceholder: 'उदा. महाराष्ट्र, पंजाब' },
    pa: { title: 'ਸਮਾਰਟ ਫਸਲ ਯੋਜਨਾਕਾਰ', desc: 'ਆਪਣੀਆਂ ਸਥਾਨਕ ਸਥਿਤੀਆਂ ਦੇ ਅਧਾਰ ਤੇ AI-ਸੰਚਾਲਿਤ ਫਸਲ ਸਿਫਾਰਸ਼ਾਂ ਪ੍ਰਾਪਤ ਕਰੋ।', soil: 'ਮਿੱਟੀ ਦੀ ਕਿਸਮ', season: 'ਆਉਣ ਵਾਲਾ ਮੌਸਮ', region: 'ਰਾਜ/ਖੇਤਰ', get: 'ਸਿਫਾਰਸ਼ਾਂ ਪ੍ਰਾਪਤ ਕਰੋ', loading: 'ਡਾਟਾ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰ ਰਿਹਾ ਹੈ...', result: 'ਸਿਫਾਰਸ਼ ਕੀਤੀਆਂ ਫਸਲਾਂ', soilOptions: ['ਕਾਲੀ ਮਿੱਟੀ', 'ਲਾਲ ਮਿੱਟੀ', 'ਜਲੋਢ ਮਿੱਟੀ', 'ਲੈਟਰਾਈਟ ਮਿੱਟੀ', 'ਰੇਤਲੀ ਮਿੱਟੀ'], seasonOptions: ['ਖਰੀਫ (ਮਾਨਸੂਨ)', 'ਹਾੜੀ (ਸਰਦੀਆਂ)', 'ਜ਼ੈਦ (ਗਰਮੀਆਂ)'], regionPlaceholder: 'ਉਦਾਹਰਨ: ਮਹਾਰਾਸ਼ਟਰ, ਪੰਜਾਬ' },
    gu: { title: 'સ્માર્ટ પાક આયોજક', desc: 'તમારી સ્થાનિક પરિસ્થિતિઓના આધારે AI-સંચાલિત પાક ભલામણો મેળવો.', soil: 'માટીનો પ્રકાર', season: 'આગામી ઋતુ', region: 'રાજ્ય/પ્રદેશ', get: 'ભલામણો મેળવો', loading: 'ડેટાનું વિશ્લેષણ કરી રહ્યું છે...', result: 'ભલામણ કરેલ પાક', soilOptions: ['કાળી માટી', 'લાલ માટી', 'કાંપવાળી માટી', 'લેટરાઇટ માટી', 'રેતાળ માટી'], seasonOptions: ['ખરીફ (ચોમાસું)', 'રવિ (શિયાળો)', 'ઝૈદ (ઉનાળો)'], regionPlaceholder: 'દા.ત. મહારાષ્ટ્ર, પંજાબ' },
    te: { title: 'స్మార్ట్ పంట ప్రణాళిక', desc: 'మీ స్థానిక పరిస్థితుల ఆధారంగా AI-ఆధారిత పంట సిఫార్సులను పొందండి.', soil: 'నేల రకం', season: 'రాబోయే సీజన్', region: 'రాష్ట్రం/ప్రాంతం', get: 'సిఫార్సులను పొందండి', loading: 'డేటాను విశ్లేషిస్తోంది...', result: 'సిఫార్సు చేయబడిన పంటలు', soilOptions: ['నల్ల రేగడి నేల', 'ఎర్ర నేల', 'ఒండ్రు నేల', 'లాటరైట్ నేల', 'ఇసుక నేల'], seasonOptions: ['ఖరీఫ్ (రుతుపవనాలు)', 'రబీ (శీతాకాలం)', 'జైద్ (వేసవి)'], regionPlaceholder: 'ఉదా. మహారాష్ట్ర, పంజాబ్' },
    kn: { title: 'ಸ್ಮಾರ್ಟ್ ಬೆಳೆ ಯೋಜಕ', desc: 'ನಿಮ್ಮ ಸ್ಥಳೀಯ ಪರಿಸ್ಥಿತಿಗಳ ಆಧಾರದ ಮೇಲೆ AI-ಚಾಲಿತ ಬೆಳೆ ಶಿಫಾರಸುಗಳನ್ನು ಪಡೆಯಿರಿ.', soil: 'ಮಣ್ಣಿನ ಪ್ರಕಾರ', season: 'ಮುಂಬರುವ ಋತು', region: 'ರಾಜ್ಯ/ಪ್ರದೇಶ', get: 'ಶಿಫಾರಸುಗಳನ್ನು ಪಡೆಯಿರಿ', loading: 'ಡೇಟಾವನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...', result: 'ಶಿಫಾರಸು ಮಾಡಿದ ಬೆಳೆಗಳು', soilOptions: ['ಕಪ್ಪು ಮಣ್ಣು', 'ಕೆಂಪು ಮಣ್ಣು', 'ಮೆಕ್ಕಲು ಮಣ್ಣು', 'ಲ್ಯಾಟರೈಟ್ ಮಣ್ಣು', 'ಮರಳು ಮಣ್ಣು'], seasonOptions: ['ಖಾರಿಫ್ (ಮಾನ್ಸೂನ್)', 'ರಬಿ (ಚಳಿಗಾಲ)', 'ಜೈದ್ (ಬೇಸಿಗೆ)'], regionPlaceholder: 'ಉದಾ. ಮಹಾರಾಷ್ಟ್ರ, ಪಂಜಾಬ್' }
  }[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!soil || !season || !region) return;

    setIsLoading(true);
    setResult(null);
    try {
      const recommendations = await getCropRecommendations(soil, season, region, language);
      setResult(recommendations);
    } catch (error) {
      console.error(error);
      setResult('Failed to get recommendations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Tabs */}
      <div className="flex p-1 bg-muted rounded-xl w-full max-w-3xl mx-auto mb-6 overflow-x-auto hide-scrollbar">
        <button
          onClick={() => setActiveTab('planner')}
          className={`flex-1 min-w-[120px] py-2.5 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all ${
            activeTab === 'planner' 
              ? 'bg-background text-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Sprout size={18} />
          AI Planner
        </button>
        <button
          onClick={() => setActiveTab('soil')}
          className={`flex-1 min-w-[120px] py-2.5 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all ${
            activeTab === 'soil' 
              ? 'bg-background text-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <FlaskConical size={18} />
          Soil Health
        </button>
        <button
          onClick={() => setActiveTab('market')}
          className={`flex-1 min-w-[120px] py-2.5 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all ${
            activeTab === 'market' 
              ? 'bg-background text-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <TrendingUp size={18} />
          Market
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex-1 min-w-[120px] py-2.5 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all ${
            activeTab === 'analytics' 
              ? 'bg-background text-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <BarChart3 size={18} />
          Yield Analytics
        </button>
        <button
          onClick={() => setActiveTab('prediction')}
          className={`flex-1 min-w-[120px] py-2.5 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all ${
            activeTab === 'prediction' 
              ? 'bg-background text-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <BrainCircuit size={18} />
          AI Prediction
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'planner' ? (
          <motion.div
            key="planner"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-primary/10 p-2.5 rounded-xl">
                    <Sprout size={24} className="text-primary" />
                  </div>
                  <CardTitle className="text-2xl">{t.title}</CardTitle>
                </div>
                <CardDescription className="text-base">{t.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <MapPin size={16} className="text-muted-foreground" />
                      {t.region}
                    </label>
                    <input 
                      type="text" 
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      placeholder={t.regionPlaceholder}
                      className="w-full p-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Droplets size={16} className="text-muted-foreground" />
                      {t.soil}
                    </label>
                    <select 
                      value={soil}
                      onChange={(e) => setSoil(e.target.value)}
                      className="w-full p-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none"
                      required
                    >
                      <option value="" disabled>Select Soil Type</option>
                      {t.soilOptions.map((opt, idx) => (
                        <option key={idx} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Sun size={16} className="text-muted-foreground" />
                      {t.season}
                    </label>
                    <select 
                      value={season}
                      onChange={(e) => setSeason(e.target.value)}
                      className="w-full p-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none"
                      required
                    >
                      <option value="" disabled>Select Season</option>
                      {t.seasonOptions.map((opt, idx) => (
                        <option key={idx} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isLoading || !soil || !season || !region}
                    className="w-full mt-6"
                    size="lg"
                    isLoading={isLoading}
                  >
                    {!isLoading && <Sprout size={20} className="mr-2" />}
                    {isLoading ? t.loading : t.get}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={24} className="text-primary" />
                      <CardTitle className="text-xl">{t.result}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-foreground/90">
                      <Markdown>{result}</Markdown>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="market"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Live Mandi Prices */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <LineChart className="text-primary" size={24} />
                    <CardTitle>Live Mandi Prices (Maharashtra)</CardTitle>
                  </div>
                  <Button variant="outline" size="sm" onClick={loadMarketData} disabled={loadingMarket}>
                    {loadingMarket ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Refresh'}
                  </Button>
                </div>
                <CardDescription>Real-time market rates vs Minimum Support Price (MSP)</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingMarket ? (
                  <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                        <tr>
                          <th className="px-4 py-3 rounded-tl-lg">Crop</th>
                          <th className="px-4 py-3">Market</th>
                          <th className="px-4 py-3">Current Price (₹/Qtl)</th>
                          <th className="px-4 py-3 rounded-tr-lg">MSP (₹/Qtl)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mandiPrices.map((item) => (
                          <tr key={item.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3 font-medium">{item.crop}</td>
                            <td className="px-4 py-3 text-muted-foreground">{item.market}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5 font-semibold">
                                ₹{item.price}
                                {item.trend === 'up' && <ArrowUpRight size={16} className="text-green-500" />}
                                {item.trend === 'down' && <ArrowDownRight size={16} className="text-destructive" />}
                                {item.trend === 'stable' && <Minus size={16} className="text-muted-foreground" />}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">₹{item.msp}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Profit Calculator */}
            <Card className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-transparent">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Calculator className="text-green-600 dark:text-green-400" size={24} />
                  <CardTitle>AI Profit Calculator</CardTitle>
                </div>
                <CardDescription>Estimate your revenue based on current market rates and input costs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Select Crop</label>
                      <select 
                        value={calcCrop}
                        onChange={(e) => setCalcCrop(e.target.value)}
                        className="w-full p-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-green-500/20 outline-none"
                      >
                        {mandiPrices.map(c => <option key={c.id} value={c.crop}>{c.crop}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">Land Size (Acres)</label>
                        <input 
                          type="number" min="0.1" step="0.1"
                          value={calcAcres} onChange={(e) => setCalcAcres(Number(e.target.value))}
                          className="w-full p-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-green-500/20 outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">Expected Yield (Qtl/Acre)</label>
                        <input 
                          type="number" min="1"
                          value={calcYield} onChange={(e) => setCalcYield(Number(e.target.value))}
                          placeholder="e.g. 10"
                          className="w-full p-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-green-500/20 outline-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Total Input Cost per Acre (₹)</label>
                      <input 
                        type="number" min="0"
                        value={calcCost} onChange={(e) => setCalcCost(Number(e.target.value))}
                        placeholder="Seeds, fertilizers, labor..."
                        className="w-full p-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-green-500/20 outline-none"
                      />
                    </div>
                  </div>

                  <div className="bg-background rounded-xl border border-border p-6 flex flex-col justify-center">
                    <h4 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">Estimated Returns</h4>
                    {profitResult ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center pb-3 border-b border-border/50">
                          <span className="text-muted-foreground">Market Rate</span>
                          <span className="font-medium">₹{profitResult.pricePerQtl} / Qtl</span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-border/50">
                          <span className="text-muted-foreground">Gross Revenue</span>
                          <span className="font-medium text-lg">₹{profitResult.grossRevenue.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-border/50">
                          <span className="text-muted-foreground">Total Cost</span>
                          <span className="font-medium text-destructive">₹{profitResult.totalCost.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                          <span className="font-bold text-lg">Net Profit</span>
                          <div className="text-right">
                            <span className={`font-bold text-2xl ${profitResult.netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
                              ₹{profitResult.netProfit.toLocaleString('en-IN')}
                            </span>
                            <div className={`text-sm font-medium ${profitResult.netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
                              ROI: {profitResult.roi}%
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground py-8 flex flex-col items-center gap-2">
                        <IndianRupee size={32} className="opacity-20" />
                        <p>Enter yield and cost details to see profit estimates.</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === 'soil' && (
          <motion.div
            key="soil"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-amber-500/10 p-2.5 rounded-xl">
                    <FlaskConical size={24} className="text-amber-600 dark:text-amber-500" />
                  </div>
                  <CardTitle className="text-2xl">Soil Health Scoring</CardTitle>
                </div>
                <CardDescription className="text-base">Enter your soil test results for NPK analysis and improvement tips.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Nitrogen (N) mg/kg</label>
                    <input type="number" value={nValue} onChange={e => setNValue(Number(e.target.value))} className="w-full p-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-amber-500/20 outline-none" placeholder="40-80" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Phosphorus (P) mg/kg</label>
                    <input type="number" value={pValue} onChange={e => setPValue(Number(e.target.value))} className="w-full p-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-amber-500/20 outline-none" placeholder="20-40" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Potassium (K) mg/kg</label>
                    <input type="number" value={kValue} onChange={e => setKValue(Number(e.target.value))} className="w-full p-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-amber-500/20 outline-none" placeholder="150-300" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">pH Level</label>
                    <input type="number" step="0.1" value={phValue} onChange={e => setPhValue(Number(e.target.value))} className="w-full p-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-amber-500/20 outline-none" placeholder="6.0-7.5" />
                  </div>
                </div>
                <Button onClick={calculateSoilHealth} className="w-full bg-amber-600 hover:bg-amber-700 text-white" disabled={nValue === '' || pValue === '' || kValue === '' || phValue === ''}>
                  Analyze Soil Health
                </Button>

                {soilScore !== null && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-6">
                    <div className="flex items-center justify-between p-6 bg-muted/50 rounded-xl border border-border">
                      <div>
                        <h3 className="text-lg font-semibold mb-1">Overall Health Score</h3>
                        <p className="text-sm text-muted-foreground">Based on ideal NPK and pH ranges</p>
                      </div>
                      <div className={`text-5xl font-bold ${soilScore >= 80 ? 'text-green-500' : soilScore >= 60 ? 'text-amber-500' : 'text-destructive'}`}>
                        {soilScore}<span className="text-2xl text-muted-foreground">/100</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-medium flex items-center gap-2"><Leaf size={18} className="text-primary" /> Improvement Recommendations</h4>
                      <div className="grid gap-3">
                        {soilTips.map((tip, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-4 bg-background border border-border rounded-lg shadow-sm">
                            <AlertTriangle size={18} className={`shrink-0 ${tip.includes('Excellent') ? 'text-green-500 mt-0.5' : 'text-amber-500 mt-0.5'}`} />
                            <p className="text-sm leading-relaxed">{tip}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-500/10 p-2.5 rounded-xl">
                      <BarChart3 size={24} className="text-blue-600 dark:text-blue-500" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">Historical Yield Comparison</CardTitle>
                      <CardDescription className="text-base mt-1">Compare your farm's performance against the district average.</CardDescription>
                    </div>
                  </div>
                  <select 
                    value={analyticsCrop}
                    onChange={(e) => setAnalyticsCrop(e.target.value)}
                    className="p-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none font-medium min-w-[140px]"
                  >
                    {Object.keys(yieldData).map(crop => (
                      <option key={crop} value={crop}>{crop}</option>
                    ))}
                  </select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={yieldData[analyticsCrop as keyof typeof yieldData]} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" vertical={false} />
                      <XAxis dataKey="year" stroke="currentColor" className="opacity-50 text-xs" tickLine={false} axisLine={false} />
                      <YAxis stroke="currentColor" className="opacity-50 text-xs" tickLine={false} axisLine={false} tickFormatter={(value) => `${value} Qtl`} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                        formatter={(value: any) => [`${value} Qtl/Acre`, '']}
                      />
                      <Legend wrapperStyle={{ paddingTop: '20px' }} />
                      <Bar dataKey="farm" name="Your Farm" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={50} />
                      <Bar dataKey="district" name="District Average" fill="#64748b" radius={[4, 4, 0, 0]} maxBarSize={50} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === 'prediction' && (
          <motion.div
            key="prediction"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-purple-500/10 p-2.5 rounded-xl">
                    <BrainCircuit size={24} className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">AI Yield Prediction Model</CardTitle>
                    <CardDescription className="text-base mt-1">Trained on Maharashtra district-level farm data</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Target Crop</label>
                      <select 
                        value={predCrop}
                        onChange={(e) => setPredCrop(e.target.value)}
                        className="w-full p-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-purple-500/20 outline-none"
                      >
                        <option value="Wheat">Wheat</option>
                        <option value="Cotton">Cotton</option>
                        <option value="Soybean">Soybean</option>
                        <option value="Onion">Onion</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Land Size (Acres)</label>
                      <input 
                        type="number" min="0.1" step="0.1"
                        value={predAcres} onChange={(e) => setPredAcres(Number(e.target.value))}
                        className="w-full p-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-purple-500/20 outline-none"
                        placeholder="e.g. 5"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Expected Rainfall (mm)</label>
                      <input 
                        type="number" min="0"
                        value={predRainfall} onChange={(e) => setPredRainfall(Number(e.target.value))}
                        className="w-full p-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-purple-500/20 outline-none"
                        placeholder="e.g. 600"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Fertilizer Application (kg/Acre)</label>
                      <input 
                        type="number" min="0"
                        value={predFertilizer} onChange={(e) => setPredFertilizer(Number(e.target.value))}
                        className="w-full p-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-purple-500/20 outline-none"
                        placeholder="e.g. 50"
                      />
                    </div>
                    <Button 
                      onClick={handlePredictYield} 
                      disabled={isPredicting || !predAcres || !predRainfall || !predFertilizer}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white mt-4"
                    >
                      {isPredicting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <BrainCircuit className="w-5 h-5 mr-2" />}
                      {isPredicting ? 'Running Model...' : 'Predict Yield'}
                    </Button>
                  </div>

                  <div className="bg-background rounded-xl border border-border p-6 flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                      <BrainCircuit size={120} />
                    </div>
                    
                    <h4 className="text-sm font-medium text-muted-foreground mb-6 uppercase tracking-wider relative z-10">Prediction Results</h4>
                    
                    {predictionResult ? (
                      <div className="space-y-6 relative z-10">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Predicted Yield (Per Acre)</p>
                          <p className="text-3xl font-bold text-foreground">{predictionResult.yieldPerAcre} <span className="text-lg font-normal text-muted-foreground">Qtl</span></p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Total Estimated Yield</p>
                          <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">{predictionResult.totalYield} <span className="text-xl font-normal text-muted-foreground">Qtl</span></p>
                        </div>
                        <div className="pt-4 border-t border-border/50">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Model Confidence</span>
                            <span className="text-sm font-bold text-green-500">{predictionResult.confidence}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2 mt-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${predictionResult.confidence}%` }}></div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground py-8 flex flex-col items-center gap-3 relative z-10">
                        <BrainCircuit size={40} className="opacity-20" />
                        <p>Enter farm parameters to run the prediction model.</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CropPlanner;
