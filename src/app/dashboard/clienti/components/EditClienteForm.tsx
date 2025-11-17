// src/app/dashboard/clienti/components/EditClienteForm.tsx
'use client';

import { useState } from 'react';
import type { Cliente, TipoCliente } from '@prisma/client';

interface EditClienteFormProps {
  cliente: Cliente; // Il cliente da modificare (con i dati pre-compilati)
  onClose: () => void;
  onClienteAggiornato: (clienteAggiornato: Cliente) => void;
}

export default function EditClienteForm({ cliente, onClose, onClienteAggiornato }: EditClienteFormProps) {
  
  // Inizializza lo stato con i dati del cliente che stiamo modificando
  const [formData, setFormData] = useState({
    nome_cliente: cliente.nome_cliente,
    numero_telefono: cliente.numero_telefono || '', // Converte null in stringa vuota
    tipo: cliente.tipo,
    nome_officina: cliente.nome_officina || '', // Converte null in stringa vuota
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

    const datiDaInviare = {
      ...formData,
      nome_officina: formData.tipo === 'PRIVATO' ? '' : formData.nome_officina,
    };

    try {
      // Chiama l'API PATCH specifica per l'ID di questo cliente
      const res = await fetch(`/api/clienti/${cliente.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datiDaInviare),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Errore sconosciuto');
      }

      // Successo!
      onClienteAggiornato(data); // Invia i dati aggiornati alla pagina
      onClose(); // Chiude il modale

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossibile inviare i dati');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      
      {/* Riga 1: Nome e Tipo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="nome_cliente" className="block text-sm font-medium text-gray-300">
            Nome Cliente <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="nome_cliente"
            id="nome_cliente"
            value={formData.nome_cliente}
            onChange={handleChange}
            required
            className="w-full mt-1 px-3 py-2 text-white bg-[#1a1a1a] border border-gray-600 rounded-md"
          />
        </div>
        <div>
          <label htmlFor="tipo" className="block text-sm font-medium text-gray-300">
            Tipo Cliente <span className="text-red-500">*</span>
          </label>
          <select
            name="tipo"
            id="tipo"
            value={formData.tipo}
            onChange={handleChange}
            className="w-full mt-1 px-3 py-2 text-white bg-[#1a1a1a] border border-gray-600 rounded-md"
          >
            <option value="PRIVATO">Privato</option>
            <option value="MECCANICO">Meccanico</option>
          </select>
        </div>
      </div>

      {/* Riga 2: Telefono e Officina (condizionale) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="numero_telefono" className="block text-sm font-medium text-gray-300">
            Numero Telefono
          </label>
          <input
            type="text"
            name="numero_telefono"
            id="numero_telefono"
            value={formData.numero_telefono}
            onChange={handleChange}
            className="w-full mt-1 px-3 py-2 text-white bg-[#1a1a1a] border border-gray-600 rounded-md"
          />
        </div>
        
        {formData.tipo === 'MECCANICO' && (
          <div>
            <label htmlFor="nome_officina" className="block text-sm font-medium text-gray-300">
              Nome Officina
            </label>
            <input
              type="text"
              name="nome_officina"
              id="nome_officina"
              value={formData.nome_officina}
              onChange={handleChange}
              className="w-full mt-1 px-3 py-2 text-white bg-[#1a1a1a] border border-gray-600 rounded-md"
            />
          </div>
        )}
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