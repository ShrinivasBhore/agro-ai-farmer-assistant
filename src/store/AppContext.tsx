import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { getWeather } from '../lib/weather';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, getDocFromServer, setDoc, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

type Language = 'en' | 'hi' | 'mr' | 'pa' | 'gu' | 'te' | 'kn';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  location: { lat: number; lng: number } | null;
  setLocation: (loc: { lat: number; lng: number } | null) => void;
  locationName: string | null;
  weather: any;
  fetchLocationAndWeather: () => void;
  user: User | null;
  isAuthReady: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [weather, setWeather] = useState<any>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. ");
        }
      }
    }
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);

      if (currentUser) {
        // Ensure user document exists
        const userRef = doc(db, 'users', currentUser.uid);
        let userSnap;
        try {
          userSnap = await getDoc(userRef);
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${currentUser.uid}`);
          return;
        }

        if (!userSnap.exists()) {
          try {
            await setDoc(userRef, {
              uid: currentUser.uid,
              phoneNumber: currentUser.phoneNumber || '+910000000000',
              createdAt: serverTimestamp(),
              language: 'en'
            });
          } catch (error) {
            handleFirestoreError(error, OperationType.CREATE, `users/${currentUser.uid}`);
          }
        } else {
          const data = userSnap.data();
          if (data.language) {
            setLanguage(data.language as Language);
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchLocationAndWeather = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setLocation(loc);
          try {
            const API_KEY = (import.meta as any).env.VITE_OPENWEATHER_API_KEY || '5471ec4b80dd3163056def481b7d524f';
            const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${loc.lat}&lon=${loc.lng}&limit=1&appid=${API_KEY}`);
            const geoData = await geoRes.json();
            if (geoData && geoData.length > 0) {
              setLocationName(geoData[0].name);
            } else {
              setLocationName('Current Location');
            }

            const w = await getWeather(loc.lat, loc.lng);
            setWeather(w);
          } catch (e) {
            console.error(e);
            setLocationName('Current Location');
          }
        },
        (err) => console.error('Geolocation error:', err)
      );
    }
  };

  // Auto-fetch on mount
  useEffect(() => {
    fetchLocationAndWeather();
  }, []);

  return (
    <AppContext.Provider value={{ language, setLanguage, location, setLocation, locationName, weather, fetchLocationAndWeather, user, isAuthReady }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

