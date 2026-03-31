export const getWeather = async (lat: number, lon: number) => {
  try {
    const API_KEY = (import.meta as any).env.VITE_OPENWEATHER_API_KEY || '5471ec4b80dd3163056def481b7d524f';
    
    const [currentRes, forecastRes] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`),
      fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`)
    ]);

    if (!currentRes.ok || !forecastRes.ok) {
      throw new Error('Failed to fetch weather data');
    }

    const currentData = await currentRes.json();
    const forecastData = await forecastRes.json();

    // Group 3-hour forecasts by day
    const dailyMap = new Map<string, any>();
    forecastData.list.forEach((item: any) => {
      const dateStr = item.dt_txt.split(' ')[0]; // YYYY-MM-DD
      if (!dailyMap.has(dateStr)) {
        dailyMap.set(dateStr, {
          temp_max: item.main.temp_max,
          temp_min: item.main.temp_min,
          precipitation: item.rain ? (item.rain['3h'] || 0) : 0
        });
      } else {
        const existing = dailyMap.get(dateStr);
        existing.temp_max = Math.max(existing.temp_max, item.main.temp_max);
        existing.temp_min = Math.min(existing.temp_min, item.main.temp_min);
        existing.precipitation += item.rain ? (item.rain['3h'] || 0) : 0;
      }
    });

    const dates = Array.from(dailyMap.keys()).slice(0, 7);
    const dailyValues = Array.from(dailyMap.values()).slice(0, 7);

    return {
      current_weather: {
        temperature: Math.round(currentData.main.temp),
        windspeed: Math.round(currentData.wind.speed * 3.6), // convert m/s to km/h
        weathercode: currentData.weather[0].id
      },
      daily: {
        time: dates,
        temperature_2m_max: dailyValues.map(v => Math.round(v.temp_max)),
        temperature_2m_min: dailyValues.map(v => Math.round(v.temp_min)),
        precipitation_sum: dailyValues.map(v => Math.round(v.precipitation * 10) / 10)
      }
    };
  } catch (error) {
    console.error('Error fetching weather:', error);
    return null;
  }
};
