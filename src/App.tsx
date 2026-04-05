import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { AddSlang } from './pages/AddSlang';
import { Dashboard } from './pages/Dashboard';
import { SlangDetail } from './pages/SlangDetail';
import { EditSlang } from './pages/EditSlang';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="add" element={<AddSlang />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="slang/:id" element={<SlangDetail />} />
            <Route path="edit/:id" element={<EditSlang />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
