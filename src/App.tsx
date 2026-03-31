/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './store/AppContext';
import { ThemeProvider } from './components/ThemeProvider';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

const Home = lazy(() => import('./pages/Home'));
const Chat = lazy(() => import('./pages/Chat'));
const DiseaseDetection = lazy(() => import('./pages/DiseaseDetection'));
const CropPlanner = lazy(() => import('./pages/CropPlanner'));
const Schemes = lazy(() => import('./pages/Schemes'));
const Weather = lazy(() => import('./pages/Weather'));
const Analytics = lazy(() => import('./pages/Analytics'));
const MarketPrices = lazy(() => import('./pages/MarketPrices'));
const Login = lazy(() => import('./pages/Login'));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
  </div>
);

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="kisan-ai-theme">
      <AppProvider>
        <Router>
          <Routes>
            <Route path="/login" element={
              <Suspense fallback={<PageLoader />}>
                <Login />
              </Suspense>
            } />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={
                <Suspense fallback={<PageLoader />}>
                  <Home />
                </Suspense>
              } />
              <Route path="chat" element={
                <Suspense fallback={<PageLoader />}>
                  <Chat />
                </Suspense>
              } />
              <Route path="disease" element={
                <Suspense fallback={<PageLoader />}>
                  <DiseaseDetection />
                </Suspense>
              } />
              <Route path="planner" element={
                <Suspense fallback={<PageLoader />}>
                  <CropPlanner />
                </Suspense>
              } />
              <Route path="schemes" element={
                <Suspense fallback={<PageLoader />}>
                  <Schemes />
                </Suspense>
              } />
              <Route path="weather" element={
                <Suspense fallback={<PageLoader />}>
                  <Weather />
                </Suspense>
              } />
              <Route path="analytics" element={
                <Suspense fallback={<PageLoader />}>
                  <Analytics />
                </Suspense>
              } />
              <Route path="prices" element={
                <Suspense fallback={<PageLoader />}>
                  <MarketPrices />
                </Suspense>
              } />
            </Route>
          </Routes>
        </Router>
      </AppProvider>
    </ThemeProvider>
  );
}
