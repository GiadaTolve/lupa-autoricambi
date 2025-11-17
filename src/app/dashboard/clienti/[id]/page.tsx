// src/app/dashboard/clienti/[id]/page.tsx
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Cliente, Pratica } from '@prisma/client';
import Link from 'next/link';
import Modal from '@/components/Modal';
import AddPagamentoForm from '../components/AddPagamentoForm';
import { generateClientePDF } from '@/lib/pdfGenerator'; // <-- 1. IMPORTA IL GENERATORE PDF

export default function DettaglioClientePage() {
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [pratiche, setPratiche] = useState<Pratica[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ... (tutti gli altri stati rimangono invariati)
  const [descrizione, setDescrizione] = useState('');
  const [acconto, setAcconto] = useState('');
  const [saldo, setSaldo] = useState('');
  const [isSubmittingPratica, setIsSubmittingPratica] = useState(false);
  const [isPagamentoModalOpen, setIsPagamentoModalOpen] = useState(false);
  const [praticaSelezionata, setPraticaSelezionata] = useState<Pratica | null>(null);

  const params = useParams();
  const router = useRouter();
  const clienteId = params.id as string;

  // ... (fetchData rimane invariato)
  const fetchData = useCallback(async () => {
    if (!clienteId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [clienteRes, praticheRes] = await Promise.all([
        fetch(`/api/clienti/${clienteId}`),
        fetch(`/api/pratiche?clienteId=${clienteId}`)
      ]);
      if (!clienteRes.ok) {
         const data = await clienteRes.json();
         throw new Error(data.error || 'Cliente non trovato');
      }
      const clienteData = await clienteRes.json();
      setCliente(clienteData);
      if (!praticheRes.ok) {
        const data = await praticheRes.json();
        throw new Error(data.error || 'Errore nel caricare le pratiche');
      }
      const praticheData = await praticheRes.json();
      setPratiche(praticheData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setIsLoading(false);
    }
  }, [clienteId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ... (saldoTotaleCliente rimane invariato)
  const saldoTotaleCliente = useMemo(() => {
    return pratiche.reduce((acc, pratica) => acc + pratica.saldo_rimanente, 0);
  }, [pratiche]);

  // ... (handleAddPratica, open/close PagamentoModal, handlePagamentoAggiunto... rimangono invariati)
  const handleAddPratica = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingPratica(true);
    setError(null);
    try {
      const res = await fetch('/api/pratiche', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          descrizione,
          acconto_versato: acconto,
          saldo_rimanente: saldo,
          clienteId: clienteId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Errore nel salvataggio');
      
      setPratiche((prev) => [data, ...prev]);
      setDescrizione('');
      setAcconto('');
      setSaldo('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setIsSubmittingPratica(false);
    }
  };

  const openPagamentoModal = (pratica: Pratica) => {
    setPraticaSelezionata(pratica);
    setIsPagamentoModalOpen(true);
  };
  const closePagamentoModal = () => {
    setIsPagamentoModalOpen(false);
    setPraticaSelezionata(null);
  };
  const handlePagamentoAggiunto = (praticaAggiornata: Pratica) => {
    setPratiche((prev) =>
      prev.map((p) => (p.id === praticaAggiornata.id ? praticaAggiornata : p))
    );
  };

  // --- 2. NUOVA FUNZIONE PER IL PULSANTE PDF ---
  const handleDownloadPDF = () => {
    if (cliente && pratiche) {
      generateClientePDF(cliente, pratiche, saldoTotaleCliente);
    } else {
      alert("Dati non ancora caricati.");
    }
  };
  
  // --- Visualizzazione ---
  if (isLoading) {
    return <p className="text-center text-gray-400">Caricamento dati cliente...</p>;
  }
  if (error && !cliente) {
    // ... (gestione errore identica)
    return (
      <div>
        <p className="text-center text-red-500">{error}</p>
        <Link href="/dashboard/clienti" className="text-blue-400 hover:underline">
          &larr; Torna all'anagrafica
        </Link>
      </div>
    );
  }
  if (!cliente) return null;

  return (
    <div>
      <Link href="/dashboard/clienti" className="text-blue-400 hover:underline mb-4 inline-block">
        &larr; Torna a tutti i clienti
      </Link>

      {/* Dettagli Cliente e Saldo Totale */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{cliente.nome_cliente}</h1>
          <p className="text-lg text-gray-400">{cliente.numero_telefono || 'Nessun telefono'}</p>
          {cliente.tipo === 'MECCANICO' && (
            <p className="text-lg text-blue-400">{cliente.nome_officina || 'Nessuna officina'}</p>
          )}
        </div>
        
        <div className="text-right">
          <label className="block text-sm font-medium text-gray-400">Saldo Totale Cliente</label>
          {saldoTotaleCliente > 0 ? (
            <p className="text-3xl font-bold text-red-500">
              - {saldoTotaleCliente.toFixed(2)}€
            </p>
          ) : (
            <p className="text-2xl font-bold text-green-500">
              ✅ Tutto Pagato
            </p>
          )}
          
          {/* --- 3. AGGIUNTA DEL PULSANTE PDF --- */}
          <button
            onClick={handleDownloadPDF}
            className="mt-2 px-3 py-1 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-500"
          >
            Scarica Report PDF
          </button>
        </div>
      </div>

      <hr className="my-6 border-gray-700" />

      {/* ... (Tutto il resto del file: Form Nuova Pratica, Storico Pratiche, 
           Modale Pagamento... rimane IDENTICO) ... */}
      
      {/* Sezione Nuova Pratica */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-[#FFD700]">Aggiungi Nuova Pratica</h2>
        <form onSubmit={handleAddPratica} className="p-4 bg-[#333333] rounded-lg space-y-4">
          {/* ... campi del form ... */}
          <div>
            <label htmlFor="descrizione" className="block text-sm font-medium text-gray-300">
              Descrizione (Cosa ha comprato?) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="descrizione"
              id="descrizione"
              value={descrizione}
              onChange={(e) => setDescrizione(e.target.value)}
              required
              className="w-full mt-1 px-3 py-2 text-white bg-[#1a1a1a] border border-gray-600 rounded-md"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="acconto" className="block text-sm font-medium text-gray-300">
                Acconto Versato (€)
              </label>
              <input
                type="number"
                name="acconto"
                id="acconto"
                step="0.01"
                value={acconto}
                onChange={(e) => setAcconto(e.target.value)}
                placeholder="0.00"
                className="w-full mt-1 px-3 py-2 text-white bg-[#1a1a1a] border border-gray-600 rounded-md"
              />
            </div>
            <div>
              <label htmlFor="saldo" className="block text-sm font-medium text-gray-300">
                Saldo Rimanente (€)
              </label>
              <input
                type="number"
                name="saldo"
                id="saldo"
                step="0.01"
                value={saldo}
                onChange={(e) => setSaldo(e.target.value)}
                placeholder="0.00"
                className="w-full mt-1 px-3 py-2 text-white bg-[#1a1a1a] border border-gray-600 rounded-md"
              />
            </div>
          </div>
          {error && <p className="text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={isSubmittingPratica}
            className="w-full md:w-auto px-4 py-2 font-bold text-[#1a1a1a] bg-[#FFD700] rounded-md hover:bg-yellow-400 disabled:opacity-50"
          >
            {isSubmittingPratica ? 'Salvataggio...' : 'Registra Pratica'}
          </button>
        </form>
      </div>

      {/* Sezione Storico Pratiche */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Storico Pratiche</h2>
        <div className="bg-[#333333] rounded-lg shadow-md overflow-hidden">
          {pratiche.length > 0 ? (
            pratiche.map((pratica) => (
              <div key={pratica.id} className="p-4 border-b border-gray-600">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-lg">{pratica.descrizione}</p>
                    <p className="text-sm text-gray-400">
                      Registrata il: {new Date(pratica.createdAt).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                  <button 
                    onClick={() => openPagamentoModal(pratica)}
                    className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-500 font-mono"
                    title="Aggiungi Pagamento"
                  >
                    $
                  </button>
                </div>
                <div className="flex justify-end text-sm text-gray-200 mt-2 gap-4">
                  <span className="text-green-400">Acconto: {pratica.acconto_versato.toFixed(2)}€</span>
                  {pratica.saldo_rimanente > 0 ? (
                    <span className="text-red-500">Saldo: {pratica.saldo_rimanente.toFixed(2)}€</span>
                  ) : (
                    <span className="text-green-500">✅ Saldata</span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="p-4 text-center text-gray-400">Nessuna pratica registrata per questo cliente.</p>
          )}
        </div>
      </div>

      {/* Modale per Aggiungere Pagamento */}
      {praticaSelezionata && isPagamentoModalOpen && (
        <Modal 
          title="Aggiungi Pagamento" 
          isOpen={isPagamentoModalOpen} 
          onClose={closePagamentoModal}
        >
          <AddPagamentoForm 
            pratica={praticaSelezionata}
            onClose={closePagamentoModal} 
            onPagamentoAggiunto={handlePagamentoAggiunto} 
          />
        </Modal>
      )}

    </div>
  );
}