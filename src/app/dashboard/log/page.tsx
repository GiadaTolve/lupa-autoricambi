// src/app/dashboard/log/page.tsx
'use client'; 

import { useState, useEffect } from 'react';
import type { LogModifica } from '@prisma/client';

// Creiamo un tipo "espanso" per il log, che include l'oggetto utente
type ExpandedLog = LogModifica & {
  utente: {
    username: string;
  };
};

export default function LogPage() {
  const [logs, setLogs] = useState<ExpandedLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Funzione per caricare i dati dall'API
  const fetchLogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/log'); // Chiama la nostra nuova API
      if (!res.ok) {
        throw new Error("Errore nel caricamento dei log");
      }
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setIsLoading(false);
    }
  };

  // Carica i dati quando il componente viene montato
  useEffect(() => {
    fetchLogs();
  }, []);

  // Funzione per dare un colore diverso a ogni operazione
  const getOperationColor = (operazione: string) => {
    switch (operazione) {
      case 'ARTICOLO CREATO':
        return 'text-green-400';
      case 'ARTICOLO MODIFICATO':
        return 'text-blue-400';
      case 'ARTICOLO ELIMINATO':
        return 'text-red-500';
      case 'PAGAMENTO PRATICA':
        return 'text-yellow-400'; // Giallo/Oro per i pagamenti
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div>
      {/* 1. INTESTAZIONE */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Log Modifiche</h1>
        <button
          onClick={fetchLogs} // Il pulsante ricarica i log
          disabled={isLoading}
          className="px-4 py-2 font-medium text-gray-300 bg-gray-600 rounded-md hover:bg-gray-500 disabled:opacity-50"
        >
          {isLoading ? 'Caricando...' : 'Aggiorna'}
        </button>
      </div>

      {/* 2. GESTIONE CARICAMENTO ED ERRORI */}
      {isLoading && <p className="text-center text-gray-400">Caricamento log...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}
      
      {/* 3. LISTA DEI LOG (Responsive) */}
      {!isLoading && !error && (
        <div className="bg-[#333333] rounded-lg shadow-md overflow-hidden">
          {/* Intestazione (solo per Desktop) */}
          <div className="hidden md:grid grid-cols-4 gap-4 p-4 font-bold border-b border-gray-600">
            <div>Data e Ora</div>
            <div>Utente</div>
            <div>Operazione</div>
            <div>Descrizione</div>
          </div>

          {/* Lista Log */}
          {logs.length > 0 ? (
            logs.map((log) => (
              <div
                key={log.id}
                className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4 p-4 border-b border-gray-600"
              >
                {/* Data e Ora */}
                <div className="text-sm text-gray-400">
                  {new Date(log.createdAt).toLocaleString('it-IT', { 
                    dateStyle: 'short', 
                    timeStyle: 'medium' 
                  })}
                </div>
                
                {/* Utente */}
                <div className="font-medium text-white">
                  <span className="font-bold md:hidden">Utente: </span>
                  {log.utente.username}
                </div>
                
                {/* Operazione */}
                <div className={`font-bold ${getOperationColor(log.operazione)}`}>
                  <span className="font-bold md:hidden text-white">Operazione: </span>
                  {log.operazione}
                </div>
                
                {/* Descrizione */}
                <div className="text-sm text-gray-300 col-span-1 md:col-span-1">
                  <span className="font-bold md:hidden text-white">Dettagli: </span>
                  {log.descrizione}
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-400">
              Nessuna operazione registrata.
            </div>
          )}
        </div>
      )}
    </div>
  );
}