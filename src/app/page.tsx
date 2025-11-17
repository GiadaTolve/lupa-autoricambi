// src/app/page.tsx
'use client'; 

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Errore sconosciuto');
      } else {
        router.push('/dashboard'); 
      }
    } catch (err) {
      setError('Impossibile connettersi al server.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#1a1a1a]">
      <div className="w-full max-w-md p-8 space-y-6 bg-[#333333] rounded-lg shadow-md">
        
        {/* --- INIZIO BLOCCO LOGO --- */}
        <div className="flex flex-col items-center justify-center mb-4">
          {/* 1. Logo con effetto ombra (drop-shadow) */}
          <img
  src="/LUPALOGO.png"
  alt="Lupa Autoricambi Logo"
  style={{ width: '150px', height: 'auto' }} // <-- CORRETTO
  className="drop-shadow-lg"
/>

          {/* 2. Scritta con Font Brand */}
          <h1 className="text-4xl font-bold text-center text-[#FFD700] font-brand mt-4">
            Lupa Autoricambi
          </h1>
          
          {/* 3. Scritta Gestionale */}
          <h2 className="text-xl text-center text-gray-300 mt-1">
            Gestionale Magazzino
          </h2>
        </div>
        {/* --- FINE BLOCCO LOGO --- */}
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300">
              Utente
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 mt-1 text-white bg-[#1a1a1a] border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
              placeholder="LupoPasquale"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 text-white bg-[#1a1a1a] border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="p-3 text-center text-white bg-red-600 rounded-md">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              className="w-full px-4 py-2 font-bold text-[#1a1a1a] bg-[#FFD700] rounded-md hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            >
              Accedi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}