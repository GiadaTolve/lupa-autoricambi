// src/app/dashboard/magazzino/components/EditArticoloForm.tsx
'use client';

import { useState, useEffect } from 'react';
import type { Articolo, Scaffale, Posizione } from '@prisma/client';

interface EditArticoloFormProps {
  articolo: Articolo; // L'articolo da modificare (con i dati pre-compilati)
  onClose: () => void;
  onArticoloAggiornato: (articoloAggiornato: Articolo) => void;
}

// Creiamo un tipo per i dati del form
type FormData = {
  codice_articolo: string;
  nome_pezzo: string;
  nome_macchina: string;
  pezzi_disponibili: string;
  codice_posto: string;
  scaffale: Scaffale | "";
  posizione: Posizione | "";
};

export default function EditArticoloForm({ articolo, onClose, onArticoloAggiornato }: EditArticoloFormProps) {
  
  // Inizializziamo il form con i dati dell'articolo da modificare
  const [formData, setFormData] = useState<FormData>({
    codice_articolo: articolo.codice_articolo,
    nome_pezzo: articolo.nome_pezzo,
    nome_macchina: articolo.nome_macchina,
    pezzi_disponibili: String(articolo.pezzi_disponibili), // Convertiamo il numero in stringa
    codice_posto: articolo.codice_posto || '', // Convertiamo null in stringa vuota
    scaffale: articolo.scaffale || '',
    posizione: articolo.posizione || '',
  });
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Usiamo l'API PATCH specifica per questo ID
      const res = await fetch(`/api/articoli/${articolo.id}`, {
        method: 'PATCH', // <-- Metodo PATCH (Modifica)
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Errore sconosciuto');
      }

      // Successo!
      onArticoloAggiornato(data); // Invia l'articolo aggiornato alla pagina
      onClose(); // Chiude il modale

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossibile inviare i dati');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      
      {/* Prima Riga: Codice, Pezzo, Macchina (Obbligatori) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="codice_articolo" className="block text-sm font-medium text-gray-300">
            Codice Articolo <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="codice_articolo"
            id="codice_articolo"
            value={formData.codice_articolo}
            onChange={handleChange}
            required
            className="w-full mt-1 px-3 py-2 text-white bg-[#1a1a1a] border border-gray-600 rounded-md"
          />
        </div>
        <div>
          <label htmlFor="nome_pezzo" className="block text-sm font-medium text-gray-300">
            Nome Pezzo <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="nome_pezzo"
            id="nome_pezzo"
            value={formData.nome_pezzo}
            onChange={handleChange}
            required
            className="w-full mt-1 px-3 py-2 text-white bg-[#1a1a1a] border border-gray-600 rounded-md"
          />
        </div>
        <div>
          <label htmlFor="nome_macchina" className="block text-sm font-medium text-gray-300">
            Nome Macchina <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="nome_macchina"
            id="nome_macchina"
            value={formData.nome_macchina}
            onChange={handleChange}
            required
            className="w-full mt-1 px-3 py-2 text-white bg-[#1a1a1a] border border-gray-600 rounded-md"
          />
        </div>
      </div>

      {/* Seconda Riga: Posizione e Quantità */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="scaffale" className="block text-sm font-medium text-gray-300">
            Scaffale
          </label>
          <select
            name="scaffale"
            id="scaffale"
            value={formData.scaffale}
            onChange={handleChange}
            className="w-full mt-1 px-3 py-2 text-white bg-[#1a1a1a] border border-gray-600 rounded-md"
          >
            <option value="">-- Seleziona --</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
            <option value="E">E</option>
          </select>
        </div>
        <div>
          <label htmlFor="codice_posto" className="block text-sm font-medium text-gray-300">
            Codice Posto
          </label>
          <input
            type="text"
            name="codice_posto"
            id="codice_posto"
            value={formData.codice_posto}
            onChange={handleChange}
            className="w-full mt-1 px-3 py-2 text-white bg-[#1a1a1a] border border-gray-600 rounded-md"
          />
        </div>
        <div>
          <label htmlFor="posizione" className="block text-sm font-medium text-gray-300">
            Posizione
          </label>
          <select
            name="posizione"
            id="posizione"
            value={formData.posizione}
            onChange={handleChange}
            className="w-full mt-1 px-3 py-2 text-white bg-[#1a1a1a] border border-gray-600 rounded-md"
          >
            <option value="">-- Seleziona --</option>
            <option value="alto">Alto</option>
            <option value="mid">Medio (Mid)</option>
            <option value="basso">Basso</option>
          </select>
        </div>
      </div>
      
      {/* Terza Riga: Pezzi */}
      <div>
        <label htmlFor="pezzi_disponibili" className="block text-sm font-medium text-gray-300">
          Pezzi Disponibili
        </label>
        <input
          type="number"
          name="pezzi_disponibili"
          id="pezzi_disponibili"
          value={formData.pezzi_disponibili}
          onChange={handleChange}
          min="0"
          className="w-full mt-1 px-3 py-2 text-white bg-[#1a1a1a] border border-gray-600 rounded-md"
        />
      </div>

      {/* Messaggio di Errore */}
      {error && (
        <div className="p-3 text-center text-white bg-red-600 rounded-md">
          {error}
        </div>
      )}

      {/* Bottoni del Form */}
      <div className="flex justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="px-4 py-2 font-medium text-gray-300 bg-gray-600 rounded-md hover:bg-gray-500 disabled:opacity-50"
        >
          Annulla
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 font-bold text-[#1a1a1a] bg-[#FFD700] rounded-md hover:bg-yellow-400 disabled:opacity-50"
        >
          {isLoading ? 'Salvataggio...' : 'Salva Modifiche'}
        </button>
      </div>
    </form>
  );
}