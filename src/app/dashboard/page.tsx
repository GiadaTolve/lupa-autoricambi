// src/app/dashboard/page.tsx
import { getSession } from '@/lib/session';
import Link from 'next/link'; // <-- AGGIUNTO

export default async function DashboardHome() {
  const session = await getSession();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">
        Benvenuto, {session?.username}!
      </h1>
      <p className="text-lg text-gray-400">
        Questa è la dashboard principale del Gestionale Lupa Autoricambi.
      </p>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* --- MODIFICATO --- */}
        <Link 
          href="/dashboard/magazzino" 
          className="p-6 bg-[#333333] rounded-lg shadow-md hover:bg-gray-700 transition-colors"
        >
          <h2 className="text-xl font-bold text-[#FFD700] mb-2">Magazzino</h2>
          <p>Visualizza e gestisci gli articoli, controlla le scorte e aggiorna le posizioni.</p>
          <div className="mt-4 px-4 py-2 font-bold text-[#1a1a1a] bg-[#FFD700] rounded-md inline-block">
            Vai al Magazzino
          </div>
        </Link>
        
        {/* --- MODIFICATO --- */}
        <Link 
          href="/dashboard/clienti" 
          className="p-6 bg-[#333333] rounded-lg shadow-md hover:bg-gray-700 transition-colors"
        >
          <h2 className="text-xl font-bold text-[#FFD700] mb-2">Clienti</h2>
          <p>Gestisci l'anagrafica clienti, fidelizza nuovi contatti e apri pratiche.</p>
          <div className="mt-4 px-4 py-2 font-bold text-[#1a1a1a] bg-[#FFD700] rounded-md inline-block">
            Vai ai Clienti
          </div>
        </Link>
        
      </div>
    </div>
  );
}