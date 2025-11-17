// src/app/dashboard/clienti/page.tsx
'use client'; 

import { useState, useEffect } from 'react';
import type { Cliente, TipoCliente } from '@prisma/client';
import Modal from '@/components/Modal';
import AddClienteForm from './components/AddClienteForm';
import EditClienteForm from './components/EditClienteForm';
import Link from 'next/link'; // <-- 1. IMPORTA IL COMPONENTE LINK

// ... (Funzione useDebounce rimane identica) ...
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

export default function ClientiPage() {
  const [clienti, setClienti] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [clienteSelezionato, setClienteSelezionato] = useState<Cliente | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // ... (Tutte le funzioni fetchClienti, handleClienteAggiunto, 
  //     handleClienteAggiornato, openEditModal, closeEditModal, 
  //     handleDelete, formatTipoCliente... rimangono IDENTICHE) ...

  const fetchClienti = async (query: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/clienti?search=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error("Errore nel caricamento dei clienti");
      const data = await res.json();
      setClienti(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClienti(debouncedSearchQuery);
  }, [debouncedSearchQuery]);

  const handleClienteAggiunto = (nuovoCliente: Cliente) => {
    setClienti((prev) => 
      [...prev, nuovoCliente].sort((a, b) => a.nome_cliente.localeCompare(b.nome_cliente))
    );
  };

  const handleClienteAggiornato = (clienteAggiornato: Cliente) => {
    setClienti((prev) => 
      prev.map((c) => (c.id === clienteAggiornato.id ? clienteAggiornato : c))
         .sort((a, b) => a.nome_cliente.localeCompare(b.nome_cliente))
    );
  };

  const openEditModal = (cliente: Cliente) => {
    setClienteSelezionato(cliente);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setClienteSelezionato(null);
  };

  const handleDelete = async (clienteId: string, nomeCliente: string) => {
    if (!window.confirm(`Sei sicuro di voler eliminare il cliente "${nomeCliente}"? L'azione è irreversibile.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/clienti/${clienteId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Errore nell'eliminazione");
      }
      setClienti((prev) => prev.filter((c) => c.id !== clienteId));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    }
  };

  const formatTipoCliente = (tipo: TipoCliente) => {
    return tipo === 'MECCANICO' 
      ? <span className="px-2 py-1 text-xs font-medium bg-blue-600 text-blue-100 rounded-full">Meccanico</span>
      : <span className="px-2 py-1 text-xs font-medium bg-gray-600 text-gray-100 rounded-full">Privato</span>;
  };

  return (
    <div>
      {/* ... (Intestazione, Ricerca, Errori... tutto identico) ... */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Anagrafica Clienti</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full md:w-auto px-4 py-2 font-bold text-[#1a1a1a] bg-[#FFD700] rounded-md hover:bg-yellow-400"
        >
          + Fidelizza Cliente
        </button>
      </div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Cerca per nome, telefono, officina..."
          className="w-full px-4 py-2 text-white bg-[#333333] border border-gray-600 rounded-md"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      {isLoading && <p className="text-center text-gray-400">Caricamento clienti...</p>}
      {error && <p className="text-center text-red-500 mb-4">{error}</p>}
      
      {/* 4. TABELLA RESPONSIVE */}
      {!isLoading && (
        <div className="bg-[#333333] rounded-lg shadow-md overflow-hidden">
          {/* Intestazione Tabella (Desktop) */}
          <div className="hidden md:grid grid-cols-5 gap-4 p-4 font-bold border-b border-gray-600">
            <div>Nome Cliente</div>
            <div>Tipo</div>
            <div>Telefono</div>
            <div>Officina</div>
            <div>Azioni</div>
          </div>

          {/* Lista Clienti */}
          {clienti.length > 0 ? (
            clienti.map((cliente) => (
              <div
                key={cliente.id}
                className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border-b border-gray-600 items-center hover:bg-gray-700"
              >
                <div><span className="font-bold md:hidden">Nome: </span>{cliente.nome_cliente}</div>
                <div><span className="font-bold md:hidden">Tipo: </span>{formatTipoCliente(cliente.tipo)}</div>
                <div><span className="font-bold md:hidden">Telefono: </span>{cliente.numero_telefono || '-'}</div>
                <div><span className="font-bold md:hidden">Officina: </span>{cliente.nome_officina || '-'}</div>
                
                {/* --- 2. MODIFICA QUI --- */}
                <div className="flex gap-4">
                  {/* Il bottone "Nuova Pratica" ora è un Link */}
                  <Link 
                    href={`/dashboard/clienti/${cliente.id}`}
                    className="text-sm text-green-400 hover:underline"
                  >
                    Gestisci Pratiche
                  </Link>
                  <button 
                    onClick={() => openEditModal(cliente)}
                    className="text-sm text-blue-400 hover:underline"
                  >
                    Modifica
                  </button>
                  <button 
                    onClick={() => handleDelete(cliente.id, cliente.nome_cliente)}
                    className="text-sm text-red-500 hover:underline"
                  >
                    Elimina
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-400">
              {searchQuery ? 'Nessun cliente trovato.' : 'Nessun cliente fidelizzato. Inizia aggiungendone uno!'}
            </div>
          )}
        </div>
      )}

      {/* ... (Tutti i Modali... rimangono identici) ... */}
      {isAddModalOpen && (
        <Modal 
          title="Fidelizza Nuovo Cliente" 
          isOpen={isAddModalOpen} 
          onClose={() => setIsAddModalOpen(false)}
        >
          <AddClienteForm 
            onClose={() => setIsAddModalOpen(false)} 
            onClienteAggiunto={handleClienteAggiunto} 
          />
        </Modal>
      )}
      {clienteSelezionato && isEditModalOpen && (
        <Modal 
          title="Modifica Cliente" 
          isOpen={isEditModalOpen} 
          onClose={closeEditModal}
        >
          <EditClienteForm 
            cliente={clienteSelezionato}
            onClose={closeEditModal} 
            onClienteAggiornato={handleClienteAggiornato} 
          />
        </Modal>
      )}

    </div>
  );
}