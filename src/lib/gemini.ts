import { GoogleGenAI, Type } from "@google/genai";
import { getCache, setCache } from "./cache";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const getLanguageInstruction = (lang: string) => {
  switch (lang) {
    case 'hi': return "Respond entirely in Hindi (Devanagari script). Use simple, easy-to-understand language suitable for a farmer.";
    case 'mr': return "Respond entirely in Marathi (Devanagari script). Use simple, easy-to-understand language suitable for a farmer.";
    case 'pa': return "Respond entirely in Punjabi (Gurmukhi script). Use simple, easy-to-understand language suitable for a farmer.";
    case 'gu': return "Respond entirely in Gujarati (Gujarati script). Use simple, easy-to-understand language suitable for a farmer.";
    case 'te': return "Respond entirely in Telugu (Telugu script). Use simple, easy-to-understand language suitable for a farmer.";
    case 'kn': return "Respond entirely in Kannada (Kannada script). Use simple, easy-to-understand language suitable for a farmer.";
    default: return "Respond entirely in English. Use simple, easy-to-understand language suitable for a farmer.";
  }
};

export const askKisanMitra = async (message: string, language: string, weatherContext: any, history: { role: string, parts: { text: string }[] }[] = [], memory: any = null) => {
  try {
    let weatherInfo = '';
    if (weatherContext && weatherContext.current_weather) {
      weatherInfo = `Current Weather Context: Temperature is ${weatherContext.current_weather.temperature}°C, Wind Speed is ${weatherContext.current_weather.windspeed} km/h.`;
    }

    let memoryInfo = '';
    if (memory && (memory.location || (memory.crops && memory.crops.length > 0) || (memory.pastIssues && memory.pastIssues.length > 0))) {
      memoryInfo = `Farmer Profile Memory:
      - Location: ${memory.location || 'Unknown'}
      - Crops Grown: ${memory.crops?.join(', ') || 'Unknown'}
      - Past/Current Issues: ${memory.pastIssues?.join(', ') || 'None recorded'}
      Use this memory to provide highly personalized advice.`;
    }

    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: `You are Kisan Mitra, an expert AI agricultural assistant for Indian farmers. 
        You provide accurate, timely, and actionable advice on farming, crop management, pest control, weather preparation, and government schemes.
        Be empathetic, encouraging, and practical.
        ${weatherInfo}
        ${memoryInfo}
        ${getLanguageInstruction(language)}`,
        tools: [{ googleSearch: {} }],
      },
    });

    let fullPrompt = message;
    if (history.length > 0) {
       const historyText = history.map(h => `${h.role === 'user' ? 'Farmer' : 'Kisan Mitra'}: ${h.parts[0].text}`).join('\\n');
       fullPrompt = `Previous conversation:\\n${historyText}\\n\\nFarmer: ${message}`;
    }

    const response = await chat.sendMessage({ message: fullPrompt });
    return response.text || '';
  } catch (error) {
    console.error("Error in askKisanMitra:", error);
    throw new Error("Failed to get response from Kisan Mitra.");
  }
};

export const updateFarmerMemory = async (message: string, currentMemory: any) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Extract farming details from this message to update the farmer's profile.
Current Profile: ${JSON.stringify(currentMemory || {})}
Message: "${message}"
Update the profile with any new crops mentioned, location details, or past/current issues. If nothing new is mentioned, return the current profile.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            location: { type: Type.STRING, description: "Farmer's location (village, district, state)" },
            crops: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of crops the farmer grows" },
            pastIssues: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of past or current farming issues (pests, diseases, weather damage)" }
          }
        }
      }
    });
    return JSON.parse((response.text || '').trim());
  } catch (e) {
    console.error("Error updating memory:", e);
    return currentMemory;
  }
};

export const detectDisease = async (base64Image: string, mimeType: string, language: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: "Analyze this image of a plant/crop, a full field, drone imagery, or soil. If it's a leaf/plant, identify any visible diseases, pests, or nutrient deficiencies. If it's a full field or drone image, assess overall crop health, pest infestations, uniformity, and potential irrigation issues. If it's soil, comment on its visible condition. Provide a clear diagnosis, potential causes, and actionable, low-cost treatment or management recommendations suitable for an Indian farmer.",
          },
        ],
      },
      config: {
        systemInstruction: `You are an expert plant pathologist and agricultural advisor. 
        ${getLanguageInstruction(language)}`,
      }
    });
    return response.text || '';
  } catch (error) {
    console.error("Error in detectDisease:", error);
    throw new Error("Failed to analyze the image.");
  }
};

export const getCropRecommendations = async (soil: string, season: string, region: string, language: string) => {
  try {
    const prompt = `I am a farmer in ${region || 'India'}. My soil type is ${soil} and the upcoming season is ${season}. 
    Please provide the following:
    1. **Primary Crop Recommendations**: 3-4 best crops for maximum yield and profit, including estimated duration, water requirements, and market demand.
    2. **Intercropping Recommendations**: Suggest companion crops to plant alongside the primary crops to maximize land usage and reduce pest risks.
    3. **Crop Rotation Planner**: Provide a season-by-season AI crop rotation plan for the next 3 seasons to maintain soil health and prevent disease buildup.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: `You are an expert agronomist. 
        ${getLanguageInstruction(language)}`,
      }
    });
    return response.text || '';
  } catch (error) {
    console.error("Error in getCropRecommendations:", error);
    throw new Error("Failed to get crop recommendations.");
  }
};

export const getGovernmentSchemes = async (language: string, profile?: { state: string, category: string, landSize: number, gender: string }) => {
  try {
    const cacheKey = `schemes_${language}_${profile ? JSON.stringify(profile) : 'general'}`;
    const cachedData = getCache(cacheKey);
    if (cachedData) return cachedData;

    let prompt = `Search the web for the top 5 most beneficial CURRENT government schemes for farmers in India (like PM-KISAN, crop insurance, etc.) that are active right now. 
    For each scheme, provide a brief description, eligibility criteria, application deadlines (if applicable), and how to apply.`;

    if (profile) {
      prompt = `Based on the following farmer profile:
      - State: ${profile.state}
      - Category: ${profile.category}
      - Land Size: ${profile.landSize} acres
      - Gender: ${profile.gender}
      
      Search the web for the top 5 most beneficial CURRENT government schemes (both Central and State specific for ${profile.state}) they are eligible for right now.
      For each scheme, provide:
      1. Scheme Name
      2. Brief Description
      3. Exact Eligibility Criteria
      4. Application Deadlines (if any, or state "Ongoing")
      5. How to apply (website link or office to visit).`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: `You are an expert on Indian agricultural policies and government welfare schemes. 
        ${getLanguageInstruction(language)}`,
        tools: [{ googleSearch: {} }],
      }
    });
    
    const result = response.text || '';
    setCache(cacheKey, result, 60 * 24); // Cache for 24 hours
    return result;
  } catch (error) {
    console.error("Error in getGovernmentSchemes:", error);
    throw new Error("Failed to fetch government schemes.");
  }
};

export const forecastCropPrices = async (crop: string, market: string, language: string) => {
  try {
    const cacheKey = `prices_${crop}_${market}_${language}`;
    const cachedData = getCache(cacheKey);
    if (cachedData) return cachedData;

    const prompt = `Search the web for the CURRENT real-world price of ${crop} in the ${market} mandi (market) in India for today.
    Use this real-time data as the starting point for your forecast.
    Then, generate a realistic 30-day price forecast for ${crop} in ${market}.
    Consider current seasonal trends, typical supply/demand cycles, and the real-time data you just found.
    Return the data as a JSON array of objects. Each object must have:
    - date: string (YYYY-MM-DD format, starting from today for 30 days)
    - price: number (price per quintal in INR)
    - trend: string ("up", "down", or "stable")
    - confidence: number (0 to 100, representing prediction confidence)
    
    Also include a "summary" field at the root level with a brief 2-sentence explanation of the price trend, explicitly mentioning the current real-world price you found.
    Return ONLY valid JSON in this exact structure:
    {
      "summary": "Explanation here...",
      "forecast": [
        { "date": "2026-03-26", "price": 2500, "trend": "stable", "confidence": 90 }
      ]
    }`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            forecast: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  date: { type: Type.STRING },
                  price: { type: Type.NUMBER },
                  trend: { type: Type.STRING },
                  confidence: { type: Type.NUMBER }
                },
                required: ["date", "price", "trend", "confidence"]
              }
            }
          },
          required: ["summary", "forecast"]
        },
        systemInstruction: `You are an expert agricultural economist and market analyst.
        ${getLanguageInstruction(language)}`,
        tools: [{ googleSearch: {} }]
      }
    });

    const result = JSON.parse((response.text || '').trim());
    setCache(cacheKey, result, 60 * 6); // Cache for 6 hours
    return result;
  } catch (error) {
    console.error("Error in forecastCropPrices:", error);
    throw new Error("Failed to generate price forecast.");
  }
};
