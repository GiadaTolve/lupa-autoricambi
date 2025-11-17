// src/app/api/pratiche/[id]/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { Prisma } from '@prisma/client';

// Funzione helper per estrarre l'ID (il nostro Workaround)
function getIdFromUrl(url: string) {
  try {
    const parts = new URL(url).pathname.split('/');
    return parts[parts.length - 1]; // Prende l'ultimo pezzo (l'ID)
  } catch (error) {
    return null;
  }
}

// ====================================================================
// FUNZIONE PATCH (Aggiunge un pagamento a una pratica)
// ====================================================================
export async function PATCH(request: Request) {
  // 1. Controllo Sicurezza
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
  }

  try {
    // 2. Workaround per l'ID della PRATICA
    const praticaId = getIdFromUrl(request.url);
    if (!praticaId) {
      return NextResponse.json({ error: "ID pratica mancante" }, { status: 400 });
    }
    
    const body = await request.json();
    const { importoPagamento } = body;

    // 3. Validazione
    const importoFloat = parseFloat(importoPagamento || "0");
    if (importoFloat <= 0) {
      return NextResponse.json({ error: "L'importo deve essere positivo" }, { status: 400 });
    }

    // 4. Aggiornamento nel Database + Log (in una Transazione)
    const praticaAggiornata = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      
      // 4a. Troviamo la pratica attuale per i calcoli
      const praticaAttuale = await tx.pratica.findUnique({
        where: { id: praticaId },
        include: { cliente: true } // Ci serve il nome del cliente per il log
      });

      if (!praticaAttuale) {
        throw new Error('Pratica non trovata');
      }

      // 4b. Calcoliamo i nuovi totali
      const nuovoAcconto = praticaAttuale.acconto_versato + importoFloat;
      const nuovoSaldo = praticaAttuale.saldo_rimanente - importoFloat;

      // 4c. Aggiorniamo la pratica
      const pratica = await tx.pratica.update({
        where: { id: praticaId },
        data: {
          acconto_versato: nuovoAcconto,
          saldo_rimanente: nuovoSaldo,
        },
      });

      // 4d. Crea il Log di Tracciabilità
      await tx.logModifica.create({
        data: {
          operazione: 'PAGAMENTO PRATICA',
          descrizione: `Aggiunto pagamento di ${importoFloat.toFixed(2)}€ alla pratica "${pratica.descrizione}" (Cliente: ${praticaAttuale.cliente.nome_cliente})`,
          utente: { connect: { id: session.userId } },
        },
      });

      return pratica;
    });

    // 5. Invia la risposta di successo
    return NextResponse.json(praticaAggiornata);

  } catch (error) {
    console.error("Errore nell'aggiungere il pagamento:", error);
    if (error instanceof Error && error.message === 'Pratica non trovata') {
      return NextResponse.json({ error: 'Pratica non trovata' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}