import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import RegistrationForm from './components/RegistrationForm';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-blue-900 text-white shadow-md py-4">
          <div className="container mx-auto px-4 w-full text-center">
            <h1 className="text-2xl font-bold tracking-tight">Registro a Talleres 2026</h1>
          </div>
        </header>

        <main className="flex-1 container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<RegistrationForm />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        <footer className="text-center py-6 text-gray-500 text-sm">
          Powered by Alduino Calderon with a lot of coffee &copy; 2026 Sistema de Talleres
        </footer>
      </div>
    </Router>
  );
}

export default App;
