// src/app/dashboard/clienti/components/AddPagamentoForm.tsx
'use client';

import { useState } from 'react';
import type { Pratica } from '@prisma/client';

interface AddPagamentoFormProps {
  pratica: Pratica; // La pratica a cui stiamo pagando
  onClose: () => void;
  onPagamentoAggiunto: (praticaAggiornata: Pratica) => void;
}

export default function AddPagamentoForm({ pratica, onClose, onPagamentoAggiunto }: AddPagamentoFormProps) {
  const [importo, setImporto] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const importoFloat = parseFloat(importo);
    if (isNaN(importoFloat) || importoFloat <= 0) {
      setError("Inserisci un importo valido e positivo.");
      return;
    }
    
    // Controlliamo che non stia pagando più del dovuto
    if (importoFloat > pratica.saldo_rimanente) {
      if (!window.confirm(`Stai pagando ${importoFloat.toFixed(2)}€ su un saldo di ${pratica.saldo_rimanente.toFixed(2)}€.\nLa pratica andrà in credito. Continuare?`)) {
        return;
      }
    }

    setIsLoading(true);

    try {
      const res = await fetch(`/api/pratiche/${pratica.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ importoPagamento: importo }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Errore sconosciuto');
      }

      // Successo!
      onPagamentoAggiunto(data); // Invia la pratica aggiornata
      onClose(); // Chiude il modale

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossibile inviare i dati');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      
      <div>
        <p className="text-gray-300">Stai aggiungendo un pagamento per:</p>
        <p className="font-bold text-lg text-white">{pratica.descrizione}</p>
        <p className="text-red-500">Saldo attuale: {pratica.saldo_rimanente.toFixed(2)}€</p>
      </div>

      <hr className="border-gray-600"/>

      <div>
        <label htmlFor="importo" className="block text-sm font-medium text-gray-300">
          Importo da Aggiungere (€) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          name="importo"
          id="importo"
          step="0.01"
          value={importo}
          onChange={(e) => setImporto(e.target.value)}
          required
          autoFocus // Apre il popup e mette il cursore qui
          className="w-full mt-1 px-3 py-2 text-white bg-[#1a1a1a] border border-gray-600 rounded-md"
          placeholder="0.00"
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
          {isLoading ? 'Registrazione...' : 'Aggiungi Pagamento'}
        </button>
      </div>
    </form>
  );
}