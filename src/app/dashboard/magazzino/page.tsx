// src/app/dashboard/magazzino/page.tsx
'use client'; 

import { useState, useEffect } from 'react';
import type { Articolo } from '@prisma/client';
import Modal from '@/components/Modal';
import AddArticoloForm from './components/AddArticoloForm';
import EditArticoloForm from './components/EditArticoloForm';

// --- FUNZIONE HELPER PER IL DEBOUNCE (invariata) ---
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

// --- FUNZIONE HELPER PER GENERARE IL CSV (invariata) ---
function downloadCSV(articoli: Articolo[], filename: string) {
  const headers = [
    "Codice Articolo",
    "Nome Pezzo",
    "Nome Macchina",
    "Pezzi Disponibili",
    "Scaffale",
    "Codice Posto",
    "Posizione"
  ];
  const escapeCSV = (str: string | null | undefined) => {
    if (str === null || str === undefined) return '""';
    return `"${String(str).replace(/"/g, '""')}"`;
  };
  const rows = articoli.map(art => [
    escapeCSV(art.codice_articolo),
    escapeCSV(art.nome_pezzo),
    escapeCSV(art.nome_macchina),
    art.pezzi_disponibili,
    escapeCSV(art.scaffale),
    escapeCSV(art.codice_posto),
    escapeCSV(art.posizione)
  ].join(','));

  const csvContent = [headers.join(','), ...rows].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}


export default function MagazzinoPage() {
  const [articoli, setArticoli] = useState<Articolo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [articoloSelezionato, setArticoloSelezionato] = useState<Articolo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // ... (tutte le funzioni fetchArticoli, handleArticoloAggiunto, ecc.
  //     rimangono invariate) ...
  const fetchArticoli = async (query: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/articoli?search=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error("Errore nel caricamento degli articoli");
      const data = await res.json();
      setArticoli(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchArticoli(debouncedSearchQuery);
  }, [debouncedSearchQuery]);

  const handleArticoloAggiunto = (nuovoArticolo: Articolo) => {
    setArticoli((prev) => [nuovoArticolo, ...prev]);
  };
  const handleArticoloAggiornato = (articoloAggiornato: Articolo) => {
    setArticoli((prev) => 
      prev.map((art) => (art.id === articoloAggiornato.id ? articoloAggiornato : art))
    );
  };

  const openEditModal = (articolo: Articolo) => {
    setArticoloSelezionato(articolo);
    setIsEditModalOpen(true);
  };
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setArticoloSelezionato(null);
  };
  const handleDelete = async (articoloId: string) => {
    // Ho aggiunto il nome dell'articolo alla conferma
    const articoloDaEliminare = articoli.find(a => a.id === articoloId);
    if (!window.confirm(`Sei sicuro di voler eliminare "${articoloDaEliminare?.nome_pezzo || 'questo articolo'}"?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/articoli/${articoloId}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Errore nell'eliminazione");
      }
      setArticoli((prev) => prev.filter((art) => art.id !== articoloId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    }
  };
  const getIndicatorePresenza = (pezzi: number) => {
    if (pezzi > 1) return <span className="w-4 h-4 bg-green-500 rounded-full inline-block" title="Disponibile"></span>;
    if (pezzi === 1) return <span className="w-4 h-4 bg-yellow-500 rounded-full inline-block" title="In esaurimento (1 pezzo)"></span>;
    return <span className="w-4 h-4 bg-red-600 rounded-full inline-block" title="Esaurito (0 pezzi)"></span>;
  };

  const handleExportCSV = () => {
    if (articoli.length === 0) {
      alert("Nessun articolo da esportare.");
      return;
    }
    const dataOggi = new Date().toLocaleDateString('it-IT', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
    const fileName = `Magazzino-Lupa-${dataOggi.replace(/\//g, '-')}.csv`;
    
    downloadCSV(articoli, fileName);
  };


  return (
    <div>
      {/* INTESTAZIONE (invariata) */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Magazzino</h1>
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <button
            onClick={handleExportCSV}
            disabled={isLoading}
            className="w-full md:w-auto px-4 py-2 font-medium text-white bg-gray-600 rounded-md hover:bg-gray-500 disabled:opacity-50"
          >
            Esporta Magazzino (CSV)
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-full md:w-auto px-4 py-2 font-bold text-[#1a1a1a] bg-[#FFD700] rounded-md hover:bg-yellow-400"
          >
            + Aggiungi Articolo
          </button>
        </div>
      </div>

      {/* CAMPO DI RICERCA (invariato) */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Cerca per codice, nome, macchina..."
          className="w-full px-4 py-2 text-white bg-[#333333] border border-gray-600 rounded-md"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* GESTIONE CARICAMENTO ED ERRORI (invariato) */}
      {isLoading && <p className="text-center text-gray-400">Caricamento articoli...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}
      
      {/* TABELLA RESPONSIVE (invariata) */}
      {!isLoading && !error && (
        <div className="bg-[#333333] rounded-lg shadow-md overflow-hidden">
          {/* Intestazione Tabella */}
          <div className="hidden md:grid grid-cols-7 gap-4 p-4 font-bold border-b border-gray-600">
            <div>Pres.</div>
            <div>Codice Articolo</div>
            <div>Nome Pezzo</div>
            <div>Macchina</div>
            <div>Scaffale/Posto</div>
            <div>Quantità</div>
            <div>Azioni</div>
          </div>
          {/* Lista Articoli */}
          {articoli.length > 0 ? (
            articoli.map((articolo) => (
              <div
                key={articolo.id}
                className="grid grid-cols-1 md:grid-cols-7 gap-4 p-4 border-b border-gray-600 items-center hover:bg-gray-700"
              >
                <div className="text-center">{getIndicatorePresenza(articolo.pezzi_disponibili)}</div>
                <div><span className="font-bold md:hidden">Codice: </span>{articolo.codice_articolo}</div>
                <div><span className="font-bold md:hidden">Pezzo: </span>{articolo.nome_pezzo}</div>
                <div><span className="font-bold md:hidden">Macchina: </span>{articolo.nome_macchina}</div>
                <div>
                  <span className="font-bold md:hidden">Posizione: </span>
                  {articolo.scaffale || '-'}/{articolo.codice_posto || '-'}
                  <span className="text-sm text-gray-400 block">{articolo.posizione || ''}</span>
                </div>
                <div><span className="font-bold md:hidden">Quantità: </span>{articolo.pezzi_disponibili}</div>
                <div className="flex gap-2">
                  <button onClick={() => openEditModal(articolo)} className="text-sm text-blue-400 hover:underline">
                    Modifica
                  </button>
                  <button onClick={() => handleDelete(articolo.id)} className="text-sm text-red-500 hover:underline">
                    Elimina
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-400">
              {searchQuery ? 'Nessun articolo trovato per questa ricerca.' : 'Magazzino vuoto. Inizia aggiungendo un articolo!'}
            </div>
          )}
        </div>
      )}

      {/* MODALE DI AGGIUNTA (invariato) */}
      {isAddModalOpen && (
        <Modal 
          title="Aggiungi Nuovo Articolo" 
          isOpen={isAddModalOpen} 
          onClose={() => setIsAddModalOpen(false)}
        >
          <AddArticoloForm 
            onClose={() => setIsAddModalOpen(false)} 
            onArticoloAggiunto={handleArticoloAggiunto} 
          />
        </Modal>
      )}

      {/* --- CORREZIONE QUI --- */}
      {/* MODALE DI MODIFICA (corretto) */}
      {articoloSelezionato && isEditModalOpen && (
        <Modal 
          title="Modifica Articolo" 
          isOpen={isEditModalOpen} 
          onClose={closeEditModal}
        >
          <EditArticoloForm 
            articolo={articoloSelezionato}
            onClose={closeEditModal} 
            onArticoloAggiornato={handleArticoloAggiornato} // <-- CORRETTO
          />
        </Modal>
      )}
    </div>
  );
}