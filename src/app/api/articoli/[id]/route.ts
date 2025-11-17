// src/app/api/articoli/[id]/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { Prisma, Scaffale, Posizione } from '@prisma/client';

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
// FUNZIONE PATCH (Modifica) - CON WORKAROUND
// ====================================================================
export async function PATCH(
  request: Request
  // Ignoriamo il secondo argomento ({ params }) perché è buggato
) {
  // 1. Controllo Sicurezza
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
  }

  try {
    // --- WORKAROUND ---
    const articleId = getIdFromUrl(request.url);
    // --- FINE WORKAROUND ---

    if (!articleId) {
      return NextResponse.json({ error: "ID articolo non trovato nell'URL" }, { status: 400 });
    }
    
    const body = await request.json();
    const { 
      codice_articolo, 
      nome_pezzo, 
      nome_macchina, 
      pezzi_disponibili,
      codice_posto,
      scaffale,
      posizione
    } = body;

    // 2. Validazione Dati
    if (!codice_articolo || !nome_pezzo || !nome_macchina) {
      return NextResponse.json({ error: 'Campi obbligatori mancanti' }, { status: 400 });
    }
    
    // 3. Recuperiamo l'articolo originale
    const originalArticolo = await prisma.articolo.findUnique({
      where: { id: articleId } // Ora articleId è corretto
    });

    if (!originalArticolo) {
      return NextResponse.json({ error: 'Articolo non trovato' }, { status: 404 });
    }

    // 4. Controllo Duplicati
    const codiceCambiato = originalArticolo.codice_articolo !== codice_articolo.trim();
    if (codiceCambiato) {
      const articoloEsistente = await prisma.articolo.findUnique({
        where: { codice_articolo: codice_articolo.trim() },
      });
      if (articoloEsistente) {
        return NextResponse.json({ error: 'Questo codice articolo è già usato' }, { status: 409 });
      }
    }

    // 5. Trasformazione Dati
    const pezziInt = parseInt(pezzi_disponibili || "0", 10);
    const scaffaleEnum = (scaffale && Object.values(Scaffale).includes(scaffale)) ? scaffale : undefined;
    const posizioneEnum = (posizione && Object.values(Posizione).includes(posizione)) ? posizione : undefined;

    // 6. Modifica nel Database + Log
    const articoloModificato = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const articolo = await tx.articolo.update({
        where: { id: articleId },
        data: {
          codice_articolo: codice_articolo.trim(),
          nome_pezzo: nome_pezzo,
          nome_macchina: nome_macchina,
          pezzi_disponibili: pezziInt,
          codice_posto: codice_posto || null,
          scaffale: scaffaleEnum,
          posizione: posizioneEnum,
        },
      });

      await tx.logModifica.create({
        data: {
          operazione: 'ARTICOLO MODIFICATO',
          descrizione: `Modificato articolo: ${articolo.codice_articolo} (Quantità: ${articolo.pezzi_disponibili})`,
          utente: { connect: { id: session.userId } },
          articolo: { connect: { id: articolo.id } },
        },
      });
      return articolo;
    });

    // 7. Risposta
    return NextResponse.json(articoloModificato);

  } catch (error) {
    console.error("Errore Dettagliato PATCH:", error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}


// ====================================================================
// FUNZIONE DELETE (Elimina) - CON WORKAROUND
// ====================================================================
export async function DELETE(
  request: Request
  // Ignoriamo il secondo argomento ({ params }) perché è buggato
) {
  // 1. Controllo Sicurezza
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
  }

  try {
    // --- WORKAROUND ---
    const articleId = getIdFromUrl(request.url);
    // --- FINE WORKAROUND ---

    if (!articleId) {
      return NextResponse.json({ error: "ID articolo non trovato nell'URL" }, { status: 400 });
    }

    // 2. Eliminazione + Log
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      
      const articolo = await tx.articolo.findUnique({
        where: { id: articleId },
      });

      if (!articolo) {
        throw new Error('Articolo non trovato');
      }

      await tx.articolo.delete({
        where: { id: articleId },
      });

      await tx.logModifica.create({
        data: {
          operazione: 'ARTICOLO ELIMINATO',
          descrizione: `Eliminato articolo: ${articolo.codice_articolo} (${articolo.nome_pezzo})`,
          utente: { connect: { id: session.userId } },
        },
      });
    });

    // 3. Risposta
    return NextResponse.json({ message: 'Articolo eliminato con successo' });

  } catch (error) {
    console.error("Errore Dettagliato DELETE:", error);
    if (error instanceof Error && error.message === 'Articolo non trovato') {
      return NextResponse.json({ error: 'Articolo non trovato' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}