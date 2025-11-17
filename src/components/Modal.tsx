// src/components/Modal.tsx
'use client';

import React from 'react';

// Definiamo le "props" (proprietà) che il componente accetta
interface ModalProps {
  isOpen: boolean;        // Per sapere se deve essere aperto o chiuso
  onClose: () => void;    // Una funzione per dire al genitore "chiudimi"
  title: string;          // Il titolo da mostrare in cima
  children: React.ReactNode; // Il contenuto da mostrare (nel nostro caso, il form)
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  // Se non è "isOpen", non mostrare nulla
  if (!isOpen) {
    return null;
  }

  return (
    // 1. Sfondo scuro (Backdrop)
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      onClick={onClose} // Cliccando sullo sfondo si chiude
    >
      {/* 2. Contenitore del Popup */}
      <div
        className="bg-[#333333] p-6 rounded-lg shadow-xl w-full max-w-lg"
        // Questo ferma la propagazione: cliccando sul popup NON si chiude
        onClick={(e) => e.stopPropagation()} 
      >
        {/* 3. Intestazione con Titolo e Bottone "Chiudi" */}
        <div className="flex justify-between items-center border-b border-gray-600 pb-3 mb-4">
          <h2 className="text-2xl font-bold text-[#FFD700]">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            &times; {/* Questo è il simbolo "X" */}
          </button>
        </div>

        {/* 4. Il contenuto (il nostro form) */}
        <div>
          {children}
        </div>
      </div>
    </div>
  );
}