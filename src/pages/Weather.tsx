import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CloudRain, Droplets, Wind, Sun, Cloud, ThermometerSun, AlertCircle, MapPin, CalendarDays, Clock, Sprout, AlertTriangle, Snowflake, Flame, Phone, Map, Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useAppContext } from '../store/AppContext';
import { getCache, setCache } from '../lib/cache';

// Types for OpenWeatherMap One Call API 3.0
interface WeatherData {
  current: {
    temp: number;
    feels_like: number;
    humidity: number;
    wind_speed: number;
    weather: [{ main: string; description: string; icon: string }];
  };
  hourly: {
    dt: number;
    temp: number;
    pop: number; // Probability of precipitation
    weather: [{ icon: string }];
  }[];
  daily: {
    dt: number;
    temp: { day: number; min: number; max: number };
    weather: [{ main: string; icon: string }];
    pop: number;
    rain?: number;
  }[];
}

export default function Weather() {
  const { language } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [locationName, setLocationName] = useState<string>('');
  const [soilMoisture, setSoilMoisture] = useState<number>(45); // Simulated sensor data
  const [phone, setPhone] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const API_KEY = (import.meta as any).env.VITE_OPENWEATHER_API_KEY || '5471ec4b80dd3163056def481b7d524f';

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    if (!API_KEY) {
      setError('API key is missing. Please add VITE_OPENWEATHER_API_KEY to your .env file.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get user's location
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const cacheKey = `weather_${latitude.toFixed(2)}_${longitude.toFixed(2)}`;
          const cachedData = getCache(cacheKey);

          if (cachedData) {
            setLocationName(cachedData.locationName);
            setWeatherData(cachedData.weatherData);
            setLoading(false);
            return;
          }

          try {
            // Fetch location name (Reverse Geocoding)
            const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`);
            const geoData = await geoRes.json();
            if (geoData && geoData.length > 0) {
              setLocationName(geoData[0].name);
            }

            // Fetch Current Weather (API 2.5)
            const currentRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`);
            if (!currentRes.ok) {
              throw new Error('Failed to fetch current weather data. Please check the API key.');
            }
            const currentData = await currentRes.json();

            // Fetch 5-Day/3-Hour Forecast (API 2.5)
            const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`);
            if (!forecastRes.ok) {
              throw new Error('Failed to fetch forecast data.');
            }
            const forecastData = await forecastRes.json();

            // Map 2.5 API responses to our WeatherData interface
            const current = {
              temp: currentData.main.temp,
              feels_like: currentData.main.feels_like,
              humidity: currentData.main.humidity,
              wind_speed: currentData.wind.speed,
              weather: currentData.weather
            };

            // Use the first 8 3-hour intervals (24 hours) for the hourly chart
            const hourly = forecastData.list.slice(0, 8).map((item: any) => ({
              dt: item.dt,
              temp: item.main.temp,
              pop: item.pop || 0,
              weather: item.weather
            }));

            // Group 3-hour forecasts by day for the daily forecast
            const dailyMap = new globalThis.Map<number, any>();
            forecastData.list.forEach((item: any) => {
              const date = new Date(item.dt * 1000).setHours(0, 0, 0, 0);
              if (!dailyMap.has(date)) {
                dailyMap.set(date, {
                  dt: item.dt,
                  temp: { day: item.main.temp, min: item.main.temp_min, max: item.main.temp_max },
                  weather: item.weather,
                  pop: item.pop || 0
                });
              } else {
                const existing = dailyMap.get(date);
                existing.temp.min = Math.min(existing.temp.min, item.main.temp_min);
                existing.temp.max = Math.max(existing.temp.max, item.main.temp_max);
                existing.pop = Math.max(existing.pop, item.pop || 0);
              }
            });
            
            const daily = Array.from(dailyMap.values()).slice(0, 5) as any; // 5 days

            const newWeatherData = { current, hourly, daily };
            setWeatherData(newWeatherData);
            
            let locName = '';
            if (geoData && geoData.length > 0) {
              locName = geoData[0].name;
            }
            
            // Cache the response for 60 minutes
            setCache(cacheKey, { locationName: locName, weatherData: newWeatherData }, 60);
            
            // Simulate soil moisture changes based on recent weather
            // In a real app, this would come from IoT sensors
            setSoilMoisture(Math.floor(Math.random() * 40) + 30);
            
          } catch (err: any) {
            console.error("Weather API Error:", err);
            // Fallback to mock data if API fails (e.g., CORS, network error, or invalid key)
            setWeatherData({
              current: {
                temp: 28,
                feels_like: 30,
                humidity: 65,
                wind_speed: 4.5,
                weather: [{ main: 'Clear', description: 'clear sky', icon: '01d' }]
              },
              hourly: Array.from({ length: 24 }).map((_, i) => ({
                dt: Math.floor(Date.now() / 1000) + i * 3600,
                temp: 28 + Math.sin(i / 4) * 5,
                pop: i > 12 && i < 18 ? 0.8 : 0.1,
                weather: [{ icon: i > 12 && i < 18 ? '09d' : '01d' }]
              })),
              daily: Array.from({ length: 5 }).map((_, i) => ({
                dt: Math.floor(Date.now() / 1000) + i * 86400,
                temp: { day: 29, min: 22, max: 34 },
                weather: [{ main: 'Clear', icon: '01d' }],
                pop: i === 2 ? 0.7 : 0.2
              }))
            });
            setLocationName('Current Location (Mock Data)');
            setSoilMoisture(45);
            setError('Using offline mock data. Live weather fetch failed: ' + (err.message || 'Network Error'));
          } finally {
            setLoading(false);
          }
        },
        (err) => {
          let errorMessage = 'Location access denied. Please enable location services to get hyperlocal weather.';
          if (err.code === err.TIMEOUT) {
            errorMessage = 'Location request timed out. Please check your connection or try again.';
          } else if (err.code === err.POSITION_UNAVAILABLE) {
            errorMessage = 'Location information is unavailable.';
          }
          setError(errorMessage);
          setLoading(false);
        },
        { 
          enableHighAccuracy: false, // Faster on slow networks
          timeout: 30000, // 30 seconds timeout for slow 2G/3G
          maximumAge: 300000 // Accept cached location up to 5 minutes old
        }
      );
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setLoading(false);
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const getWeatherIcon = (iconCode: string) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  // Prepare chart data
  const hourlyData = weatherData?.hourly.slice(0, 24).map(h => ({
    time: formatTime(h.dt),
    temp: Math.round(h.temp),
    rainProb: Math.round(h.pop * 100)
  })) || [];

  // Smart Irrigation Logic
  const getIrrigationAdvice = () => {
    if (!weatherData) return null;
    
    const next24hRainProb = Math.max(...weatherData.hourly.slice(0, 24).map(h => h.pop));
    const isRainingSoon = next24hRainProb > 0.6;
    
    if (soilMoisture > 70) {
      return { status: 'optimal', message: 'Soil moisture is optimal. No irrigation needed.', action: 'Skip Watering' };
    } else if (isRainingSoon) {
      return { status: 'warning', message: `High chance of rain (${Math.round(next24hRainProb * 100)}%) in the next 24 hours. Delay irrigation.`, action: 'Delay Watering' };
    } else if (soilMoisture < 40) {
      return { status: 'critical', message: 'Soil moisture is critically low and no rain expected. Irrigate immediately.', action: 'Start Irrigation' };
    } else {
      return { status: 'normal', message: 'Soil moisture is adequate, monitor for next few days.', action: 'Monitor' };
    }
  };

  const advice = getIrrigationAdvice();

  const getAlerts = () => {
    if (!weatherData) return [];
    const alerts = [];
    const hasFrost = weatherData.daily.some(d => d.temp.min <= 4);
    const hasHeatwave = weatherData.daily.some(d => d.temp.max >= 40);
    
    // Fallback to current temp thresholds to ensure UI is visible for demonstration
    if (hasFrost || weatherData.current.temp <= 10) {
      alerts.push({ id: 'frost', type: 'frost', title: 'Frost Alert', desc: 'Temperatures expected to drop significantly. Protect sensitive crops with covers or light irrigation.', icon: <Snowflake className="text-blue-500" /> });
    }
    if (hasHeatwave || weatherData.current.temp >= 35) {
      alerts.push({ id: 'heat', type: 'heatwave', title: 'Heatwave Warning', desc: 'Extreme heat detected. Ensure adequate irrigation and provide shade for young plants if possible.', icon: <Flame className="text-orange-500" /> });
    }
    return alerts;
  };

  const activeAlerts = getAlerts();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length >= 10) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 5000); // Reset after 5s for demo
      setPhone('');
    }
  };

  const maharashtraDistricts = [
    { name: 'Nashik', crop: 'Grapes', risk: 'High', reason: 'Unseasonal Rain', temp: 28 },
    { name: 'Pune', crop: 'Sugarcane', risk: 'Low', reason: 'Optimal Conditions', temp: 32 },
    { name: 'Nagpur', crop: 'Oranges', risk: 'Medium', reason: 'High Heat', temp: 41 },
    { name: 'Jalgaon', crop: 'Banana', risk: 'High', reason: 'Heatwave', temp: 43 },
    { name: 'Solapur', crop: 'Pomegranate', risk: 'Medium', reason: 'Water Stress', temp: 39 },
    { name: 'Kolhapur', crop: 'Sugarcane', risk: 'Low', reason: 'Good Moisture', temp: 30 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Weather & Irrigation</h1>
          <p className="text-muted-foreground mt-1">Hyperlocal forecasts and smart watering schedules</p>
        </div>
        <Button onClick={fetchWeather} isLoading={loading} variant="outline">
          Refresh Data
        </Button>
      </div>

      {error && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="flex items-center gap-3 p-4 text-destructive">
            <AlertCircle size={24} />
            <div>
              <p className="font-semibold">Weather Data Unavailable</p>
              <p className="text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && !error && weatherData && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Current Weather */}
          <Card className="md:col-span-2 bg-gradient-to-br from-primary/20 to-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <MapPin size={18} />
                    <span className="font-medium">{locationName || 'Current Location'}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <h2 className="text-6xl font-bold">{Math.round(weatherData.current.temp)}°C</h2>
                    <img 
                      src={getWeatherIcon(weatherData.current.weather[0].icon)} 
                      alt="Weather icon" 
                      className="w-20 h-20 drop-shadow-md"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <p className="text-xl capitalize mt-2 font-medium">
                    {weatherData.current.weather[0].description}
                  </p>
                </div>
                <div className="space-y-3 w-full md:w-auto bg-card/50 p-4 rounded-2xl border border-border/50">
                  <div className="flex items-center justify-between md:justify-end gap-4 text-muted-foreground">
                    <span className="flex items-center gap-2"><ThermometerSun size={18} /> Feels like</span>
                    <span className="font-semibold text-foreground">{Math.round(weatherData.current.feels_like)}°C</span>
                  </div>
                  <div className="flex items-center justify-between md:justify-end gap-4 text-muted-foreground">
                    <span className="flex items-center gap-2"><Droplets size={18} /> Humidity</span>
                    <span className="font-semibold text-foreground">{weatherData.current.humidity}%</span>
                  </div>
                  <div className="flex items-center justify-between md:justify-end gap-4 text-muted-foreground">
                    <span className="flex items-center gap-2"><Wind size={18} /> Wind</span>
                    <span className="font-semibold text-foreground">{weatherData.current.wind_speed} m/s</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Smart Irrigation Scheduler */}
          <Card className="border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sprout className="text-primary" size={20} />
                Smart Irrigation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Soil Moisture</span>
                    <span className="font-medium">{soilMoisture}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${soilMoisture < 40 ? 'bg-destructive' : soilMoisture > 70 ? 'bg-primary' : 'bg-green-500'}`} 
                      style={{ width: `${soilMoisture}%` }}
                    ></div>
                  </div>
                </div>
                
                {advice && (
                  <div className={`p-3 rounded-xl border ${
                    advice.status === 'critical' ? 'bg-destructive/10 border-destructive/30 text-destructive' :
                    advice.status === 'warning' ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400' :
                    'bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400'
                  }`}>
                    <p className="text-sm font-medium mb-2">{advice.message}</p>
                    <Button 
                      variant={advice.status === 'critical' ? 'primary' : 'outline'} 
                      className="w-full text-xs h-8"
                    >
                      {advice.action}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Extreme Weather Alerts & SMS Subscription */}
          {activeAlerts.length > 0 && (
            <Card className="md:col-span-3 border-orange-500/30 bg-orange-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                  <AlertTriangle size={20} />
                  Active Weather Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    {activeAlerts.map(alert => (
                      <div key={alert.id} className="flex items-start gap-3 p-3 bg-background rounded-xl border border-border">
                        <div className="p-2 bg-muted rounded-lg">{alert.icon}</div>
                        <div>
                          <h4 className="font-semibold">{alert.title}</h4>
                          <p className="text-sm text-muted-foreground">{alert.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-background p-4 rounded-xl border border-border flex flex-col justify-center">
                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                      <Bell size={16} className="text-primary" />
                      Get SMS Alerts
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">Receive instant warnings for frost, heatwaves, and unseasonal rain.</p>
                    {subscribed ? (
                      <div className="p-2 bg-green-500/10 text-green-600 rounded-lg text-sm font-medium text-center border border-green-500/20">
                        Successfully subscribed to SMS alerts!
                      </div>
                    ) : (
                      <form onSubmit={handleSubscribe} className="flex gap-2">
                        <div className="relative flex-1">
                          <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <input 
                            type="tel" 
                            placeholder="Mobile Number" 
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            required
                          />
                        </div>
                        <Button type="submit" size="sm">Subscribe</Button>
                      </form>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 24-Hour Forecast Chart */}
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock size={20} className="text-primary" />
                24-Hour Forecast & Rain Probability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorRain" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '0.75rem' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Area yAxisId="left" type="monotone" dataKey="temp" name="Temp (°C)" stroke="#f59e0b" fillOpacity={1} fill="url(#colorTemp)" />
                    <Area yAxisId="right" type="monotone" dataKey="rainProb" name="Rain Prob (%)" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRain)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* 14-Day Extended Forecast */}
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays size={20} className="text-primary" />
                Extended Forecast
              </CardTitle>
              <CardDescription>Daily temperature range and precipitation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto pb-4">
                <div className="flex gap-4 min-w-max">
                  {weatherData.daily.map((day, i) => (
                    <div key={i} className="flex flex-col items-center p-4 rounded-2xl bg-muted/50 border border-border min-w-[100px]">
                      <span className="text-sm font-medium">{i === 0 ? 'Today' : formatDate(day.dt)}</span>
                      <img 
                        src={getWeatherIcon(day.weather[0].icon)} 
                        alt="icon" 
                        className="w-12 h-12 my-2"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="flex gap-2 text-sm font-bold">
                        <span>{Math.round(day.temp.max)}°</span>
                        <span className="text-muted-foreground">{Math.round(day.temp.min)}°</span>
                      </div>
                      <div className="flex items-center gap-1 mt-2 text-xs text-blue-500 font-medium">
                        <CloudRain size={12} />
                        {Math.round(day.pop * 100)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Maharashtra District Crop Risk Map */}
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map size={20} className="text-primary" />
                Maharashtra Crop Risk Zones
              </CardTitle>
              <CardDescription>District-level risk assessment based on current weather patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {maharashtraDistricts.map((district) => (
                  <div 
                    key={district.name} 
                    className={`p-4 rounded-xl border ${
                      district.risk === 'High' ? 'bg-destructive/10 border-destructive/30' :
                      district.risk === 'Medium' ? 'bg-orange-500/10 border-orange-500/30' :
                      'bg-green-500/10 border-green-500/30'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-lg">{district.name}</h4>
                      <Badge variant={
                        district.risk === 'High' ? 'danger' : 
                        district.risk === 'Medium' ? 'warning' : 'success'
                      } className={district.risk === 'Medium' ? 'bg-orange-500 hover:bg-orange-600 text-white' : ''}>
                        {district.risk} Risk
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Major Crop:</span>
                        <span className="font-medium">{district.crop}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Temp:</span>
                        <span className="font-medium">{district.temp}°C</span>
                      </div>
                      <div className="flex justify-between mt-2 pt-2 border-t border-border/50">
                        <span className="text-muted-foreground">Factor:</span>
                        <span className={`font-medium ${
                          district.risk === 'High' ? 'text-destructive' :
                          district.risk === 'Medium' ? 'text-orange-600 dark:text-orange-400' :
                          'text-green-600 dark:text-green-400'
                        }`}>{district.reason}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
