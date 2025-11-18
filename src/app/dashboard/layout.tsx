// src/app/dashboard/layout.tsx
'use client'; 

import { useState } from 'react';
import Link from 'next/link'; 
import LogoutButton from '@/components/LogoutButton';
// Usiamo il tag <img> che abbiamo corretto
// import Image from 'next/image'; 

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Stato per il menu mobile (default: false = chiuso)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#1a1a1a] text-white overflow-hidden">
      
      {/* OVERLAY (Sfondo scuro) */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* --- MODIFICA CHIAVE ALLA SIDEBAR --- */}
      <aside 
        className={`
          flex flex-col w-64 bg-[#333333] p-4 space-y-2 
          fixed md:static inset-y-0 left-0 z-20
          
          ${isMobileMenuOpen ? 'flex' : 'hidden'} 
          md:flex 
        `}
        // 1. ${isMobileMenuOpen ? 'flex' : 'hidden'}
        //    Su mobile: se lo stato è 'false', applica 'hidden' (nascosto)
        //    se lo stato è 'true', applica 'flex' (visibile)
        //
        // 2. md:flex
        //    Su desktop: applica 'flex' (visibile), 
        //    sovrascrivendo 'hidden'
      >
        
        {/* --- Logo e Scritta (Desktop) --- */}
        <div className="flex items-center gap-2 mb-4 px-2">
  <img 
    src="/LUPALOGO.png" 
    alt="Logo" 
    loading="eager" // <--- AGGIUNTO
    className="w-[32px] h-auto object-contain" // <--- AGGIUNTO
  />
  <span className="text-xl font-bold text-[#FFD700] font-brand">
    Lupa Autoricambi
  </span>
</div>

        <nav className="flex-1 space-y-2">
          <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-2 rounded hover:bg-gray-700">
            Home Dashboard
          </Link>
          <Link href="/dashboard/magazzino" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-2 rounded hover:bg-gray-700">
            Magazzino
          </Link>
          <Link href="/dashboard/clienti" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-2 rounded hover:bg-gray-700">
            Clienti
          </Link>
          <Link href="/dashboard/log" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-2 rounded hover:bg-gray-700">
            Log Modifiche
          </Link>
        </nav>
        
        <div className="mt-auto">
          <LogoutButton />
        </div>
      </aside>

      {/* HEADER (Mobile) */}
      <header className="md:hidden flex justify-between items-center w-full p-4 bg-[#333333] shadow-md fixed top-0 left-0 z-10">
        
      <div className="flex items-center gap-2">
  <img 
    src="/LUPALOGO.png" 
    alt="Logo" 
    loading="eager" // <--- AGGIUNTO
    className="w-[28px] h-auto object-contain" // <--- AGGIUNTO
  />
  <span className="text-lg font-bold text-[#FFD700] font-brand">
    Lupa Autoricambi
  </span>
</div>
        
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} // Toggle
          className="text-white text-3xl z-30"
          aria-label="Apri/Chiudi menu"
        >
          {isMobileMenuOpen ? '×' : '☰'} 
        </button>
      </header>

      {/* CONTENUTO PRINCIPALE */}
      <main className="flex-1 p-6 overflow-auto">
        {/* Spazio per l'header mobile */}
        <div className="h-16 md:hidden" /> 
        
        {children}
      </main>
    </div>
  );
}