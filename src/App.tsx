import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { AddSlang } from './pages/AddSlang';
import { Dashboard } from './pages/Dashboard';
import { SlangDetail } from './pages/SlangDetail';
import { EditSlang } from './pages/EditSlang';
import { Contribute } from './pages/Contribute';
import { Profile } from './pages/Profile';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Privacy } from './pages/Privacy';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
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
      </BrowserRouter>
    </AuthProvider>
  );
}
