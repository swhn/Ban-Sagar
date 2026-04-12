import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SiteSettingsProvider } from './lib/useSiteSettings';
import { Layout } from './components/Layout';
import { Loader2 } from 'lucide-react';

// Lazy-loaded pages for code splitting
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const AddSlang = lazy(() => import('./pages/AddSlang').then(m => ({ default: m.AddSlang })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const SlangDetail = lazy(() => import('./pages/SlangDetail').then(m => ({ default: m.SlangDetail })));
const EditSlang = lazy(() => import('./pages/EditSlang').then(m => ({ default: m.EditSlang })));
const Contribute = lazy(() => import('./pages/Contribute').then(m => ({ default: m.Contribute })));
const Profile = lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })));
const About = lazy(() => import('./pages/About').then(m => ({ default: m.About })));
const Contact = lazy(() => import('./pages/Contact').then(m => ({ default: m.Contact })));
const Privacy = lazy(() => import('./pages/Privacy').then(m => ({ default: m.Privacy })));

function PageLoader() {
  return (
    <div className="flex justify-center py-24">
      <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SiteSettingsProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="add" element={<AddSlang />} />
                <Route path="contribute" element={<Contribute />} />
                <Route path="profile" element={<Profile />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="leaderboard" element={<Navigate to="/contribute" replace />} />
                <Route path="about" element={<About />} />
                <Route path="contact" element={<Contact />} />
                <Route path="privacy" element={<Privacy />} />
                <Route path="slang/:slug" element={<SlangDetail />} />
                <Route path="edit/:id" element={<EditSlang />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </SiteSettingsProvider>
    </AuthProvider>
  );
}
