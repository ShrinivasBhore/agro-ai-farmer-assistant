import React from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { useAppContext } from '../store/AppContext';
import { TrendingUp, Droplets, IndianRupee } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Analytics = () => {
  const { language } = useAppContext();

  const t = {
    en: { title: 'Farm Analytics', yield: 'Yield Trends', rain: 'Rainfall History', profit: 'Profit/Loss Analysis' },
    hi: { title: 'खेत विश्लेषण', yield: 'उपज के रुझान', rain: 'वर्षा का इतिहास', profit: 'लाभ/हानि विश्लेषण' },
    mr: { title: 'शेती विश्लेषण', yield: 'उत्पन्नाचे कल', rain: 'पावसाचा इतिहास', profit: 'नफा/तोटा विश्लेषण' },
    pa: { title: 'ਖੇਤ ਵਿਸ਼ਲੇਸ਼ਣ', yield: 'ਝਾੜ ਦੇ ਰੁਝਾਨ', rain: 'ਮੀਂਹ ਦਾ ਇਤਿਹਾਸ', profit: 'ਲਾਭ/ਨੁਕਸਾਨ ਵਿਸ਼ਲੇਸ਼ਣ' },
    gu: { title: 'ખેતર વિશ્લેષણ', yield: 'ઉપજના વલણો', rain: 'વરસાદનો ઇતિહાસ', profit: 'નફો/નુકસાન વિશ્લેષણ' },
    te: { title: 'పొలం విశ్లేషణ', yield: 'దిగుబడి పోకడలు', rain: 'వర్షపాతం చరిత్ర', profit: 'లాభం/నష్టం విశ్లేషణ' },
    kn: { title: 'ಕೃಷಿ ವಿಶ್ಲೇಷಣೆ', yield: 'ಇಳುವರಿ ಪ್ರವೃತ್ತಿಗಳು', rain: 'ಮಳೆಯ ಇತಿಹಾಸ', profit: 'ಲಾಭ/ನಷ್ಟ ವಿಶ್ಲೇಷಣೆ' }
  }[language];

  const yieldData = {
    labels: ['2019', '2020', '2021', '2022', '2023', '2024'],
    datasets: [
      {
        label: 'Wheat Yield (Quintals/Acre)',
        data: [15, 16.5, 14, 18, 17.5, 19],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const rainData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Monthly Rainfall (mm)',
        data: [10, 5, 15, 30, 80, 200, 350, 300, 150, 50, 20, 5],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderRadius: 4,
      },
    ],
  };

  const profitData = {
    labels: ['Kharif 2022', 'Rabi 2022', 'Kharif 2023', 'Rabi 2023', 'Kharif 2024'],
    datasets: [
      {
        label: 'Revenue (₹)',
        data: [120000, 150000, 110000, 160000, 140000],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
      },
      {
        label: 'Input Costs (₹)',
        data: [50000, 60000, 55000, 65000, 58000],
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#888',
          font: { family: 'monospace' }
        }
      },
    },
    scales: {
      y: {
        grid: { color: 'rgba(150, 150, 150, 0.1)' },
        ticks: { color: '#888', font: { family: 'monospace' } }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#888', font: { family: 'monospace' } }
      }
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">{t.title}</h2>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="text-green-500" />
                {t.yield}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <Line data={yieldData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplets className="text-blue-500" />
                {t.rain}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <Bar data={rainData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IndianRupee className="text-yellow-500" />
                {t.profit}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] w-full">
                <Bar data={profitData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;
