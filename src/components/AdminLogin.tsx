import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, AlertCircle } from 'lucide-react';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'AdminTalleres2026') {
      localStorage.setItem('admin_auth', 'true');
      navigate('/admin/dashboard');
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gray-100 p-4 rounded-full mb-4">
            <Lock className="w-8 h-8 text-gray-700" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Acceso Administrador</h2>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 flex items-center justify-center gap-2 rounded-lg text-sm font-medium">
              <AlertCircle className="w-4 h-4" /> Contraseña incorrecta
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-gray-300 rounded-lg shadow-sm focus:border-gray-900 focus:ring-gray-900 border p-3"
              placeholder="••••••••••••"
              required
            />
          </div>
          
          <button 
            type="submit"
            className="w-full bg-gray-900 hover:bg-black text-white py-3 rounded-lg font-medium transition-colors"
          >
            Entrar al Panel
          </button>
        </form>
      </div>
    </div>
  );
}
