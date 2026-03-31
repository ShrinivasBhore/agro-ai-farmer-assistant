import React, { useState, useRef } from 'react';
import { Camera, Upload, ImageIcon, Loader2, AlertCircle, CheckCircle2, X, Sparkles } from 'lucide-react';
import { useAppContext } from '../store/AppContext';
import { detectDisease } from '../lib/gemini';
import Markdown from 'react-markdown';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const DiseaseDetection = () => {
  const { language } = useAppContext();
  const [image, setImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = {
    en: { title: 'Multimodal Crop Scan', desc: 'Upload a photo of an affected leaf, a full field view, drone imagery, or soil condition.', upload: 'Upload Photo', take: 'Take Photo', scanning: 'Analyzing image...', result: 'Diagnosis & Insights', error: 'Failed to analyze image. Please try again with a clearer photo.' },
    hi: { title: 'मल्टीमॉडल फसल स्कैन', desc: 'प्रभावित पत्ती, पूरे खेत का दृश्य, ड्रोन इमेजरी, या मिट्टी की स्थिति की तस्वीर अपलोड करें।', upload: 'फोटो अपलोड करें', take: 'फोटो लें', scanning: 'छवि का विश्लेषण कर रहा है...', result: 'निदान और अंतर्दृष्टि', error: 'छवि का विश्लेषण करने में विफल। कृपया एक स्पष्ट तस्वीर के साथ पुनः प्रयास करें।' },
    mr: { title: 'मल्टीमॉडल पीक स्कॅन', desc: 'बाधित पान, संपूर्ण शेताचे दृश्य, ड्रोन इमेजरी किंवा मातीच्या स्थितीचा फोटो अपलोड करा.', upload: 'फोटो अपलोड करा', take: 'फोटो काढा', scanning: 'प्रतिमेचे विश्लेषण करत आहे...', result: 'निदान आणि अंतर्दृष्टी', error: 'प्रतिमेचे विश्लेषण करण्यात अयशस्वी. कृपया स्पष्ट फोटोसह पुन्हा प्रयत्न करा.' },
    pa: { title: 'ਮਲਟੀਮੋਡਲ ਫਸਲ ਸਕੈਨ', desc: 'ਪ੍ਰਭਾਵਿਤ ਪੱਤੇ, ਪੂਰੇ ਖੇਤ ਦਾ ਦ੍ਰਿਸ਼, ਡਰੋਨ ਇਮੇਜਰੀ, ਜਾਂ ਮਿੱਟੀ ਦੀ ਸਥਿਤੀ ਦੀ ਫੋਟੋ ਅਪਲੋਡ ਕਰੋ।', upload: 'ਫੋਟੋ ਅਪਲੋਡ ਕਰੋ', take: 'ਫੋਟੋ ਲਓ', scanning: 'ਚਿੱਤਰ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰ ਰਿਹਾ ਹੈ...', result: 'ਨਿਦਾਨ ਅਤੇ ਸੂਝ', error: 'ਚਿੱਤਰ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰਨ ਵਿੱਚ ਅਸਫਲ। ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਸਪਸ਼ਟ ਫੋਟੋ ਨਾਲ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।' },
    gu: { title: 'મલ્ટિમોડલ પાક સ્કેન', desc: 'અસરગ્રસ્ત પાંદડા, સંપૂર્ણ ખેતરનું દૃશ્ય, ડ્રોન ઇમેજરી અથવા જમીનની સ્થિતિનો ફોટો અપલોડ કરો.', upload: 'ફોટો અપલોડ કરો', take: 'ફોટો લો', scanning: 'છબીનું વિશ્લેષણ કરી રહ્યું છે...', result: 'નિદાન અને આંતરદૃષ્ટિ', error: 'છબીનું વિશ્લેષણ કરવામાં નિષ્ફળ. કૃપા કરીને સ્પષ્ટ ફોટા સાથે ફરી પ્રયાસ કરો.' },
    te: { title: 'మల్టీమోడల్ పంట స్కాన్', desc: 'ప్రభావిత ఆకు, పూర్తి పొలం వీక్షణ, డ్రోన్ ఇమేజరీ లేదా నేల పరిస్థితి యొక్క ఫోటోను అప్‌లోడ్ చేయండి.', upload: 'ఫోటో అప్‌లోడ్ చేయండి', take: 'ఫోటో తీయండి', scanning: 'చిత్రాన్ని విశ్లేషిస్తోంది...', result: 'రోగ నిర్ధారణ & అంతర్దృష్టులు', error: 'చిత్రాన్ని విశ్లేషించడంలో విఫలమైంది. దయచేసి స్పష్టమైన ఫోటోతో మళ్లీ ప్రయత్నించండి.' },
    kn: { title: 'ಮಲ್ಟಿಮೋಡಲ್ ಬೆಳೆ ಸ್ಕ್ಯಾನ್', desc: 'ಬಾಧಿತ ಎಲೆ, ಸಂಪೂರ್ಣ ಹೊಲದ ನೋಟ, ಡ್ರೋನ್ ಇಮೇಜರಿ ಅಥವಾ ಮಣ್ಣಿನ ಸ್ಥಿತಿಯ ಫೋಟೋವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.', upload: 'ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ', take: 'ಫೋಟೋ ತೆಗೆದುಕೊಳ್ಳಿ', scanning: 'ಚಿತ್ರವನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...', result: 'ರೋಗನಿರ್ಣಯ ಮತ್ತು ಒಳನೋಟಗಳು', error: 'ಚಿತ್ರವನ್ನು ವಿಶ್ಲೇಷಿಸಲು ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಸ್ಪಷ್ಟವಾದ ಫೋಟೋದೊಂದಿಗೆ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.' }
  }[language];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Max dimensions for compression
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Compress to WebP
        const webpDataUrl = canvas.toDataURL('image/webp', 0.8);
        const match = webpDataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
        
        if (match) {
          setMimeType(match[1]);
          setImage(match[2]);
          setResult(null);
          setError(null);
        } else {
          setError('Failed to compress image');
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!image) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const analysis = await detectDisease(image, mimeType, language);
      setResult(analysis);
    } catch (err) {
      setError(t.error);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearImage = () => {
    setImage(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Card className="overflow-hidden border-none shadow-md">
        <div className="h-2 bg-gradient-to-r from-red-500 to-orange-500" />
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 dark:bg-red-900/30 p-2.5 rounded-2xl">
                <Camera size={26} className="text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-2xl">{t.title}</CardTitle>
            </div>
            <span className="text-xs font-medium px-2.5 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full border border-blue-200 dark:border-blue-800 flex items-center gap-1">
              <Sparkles size={12} />
              Drone Supported
            </span>
          </div>
          <CardDescription className="text-base">{t.desc}</CardDescription>
        </CardHeader>
        
        <CardContent>
          {!image ? (
            <motion.div 
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="border-2 border-dashed border-border rounded-3xl p-10 text-center hover:bg-muted/50 transition-colors cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleImageUpload}
                capture="environment"
              />
              <div className="flex flex-col items-center gap-4">
                <div className="bg-primary/10 p-5 rounded-full group-hover:scale-110 transition-transform duration-300">
                  <Upload size={36} className="text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-lg text-foreground">{t.upload} / {t.take}</p>
                  <p className="text-sm text-muted-foreground mt-1.5 font-mono">JPEG, PNG up to 5MB</p>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-6">
              <div className="relative rounded-2xl overflow-hidden border border-border bg-muted/30 flex justify-center group">
                <img 
                  src={`data:${mimeType};base64,${image}`} 
                  alt="Crop" 
                  className="max-h-80 object-contain"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                />
                <button 
                  onClick={clearImage}
                  className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white p-2 rounded-full hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X size={18} />
                </button>
              </div>

              {!result && !isLoading && (
                <Button 
                  onClick={handleAnalyze}
                  className="w-full text-lg h-14"
                  size="lg"
                >
                  <ImageIcon size={22} className="mr-2" />
                  Analyze Image
                </Button>
              )}

              {isLoading && (
                <div className="bg-primary/10 border border-primary/20 rounded-2xl p-5 flex items-center justify-center gap-3 text-primary">
                  <Loader2 size={24} className="animate-spin" />
                  <span className="font-semibold text-lg">{t.scanning}</span>
                </div>
              )}

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-5 flex items-start gap-3 text-red-700 dark:text-red-400">
                  <AlertCircle size={24} className="flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-green-200 dark:border-green-900/50 shadow-md">
            <CardHeader className="pb-2 border-b border-border bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 dark:bg-green-900/40 p-2 rounded-xl">
                  <CheckCircle2 size={24} className="text-green-600 dark:text-green-400" />
                </div>
                <CardTitle>{t.result}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="prose prose-green dark:prose-invert max-w-none text-foreground/90 text-sm md:text-base leading-relaxed">
                <Markdown>{result}</Markdown>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default DiseaseDetection;
