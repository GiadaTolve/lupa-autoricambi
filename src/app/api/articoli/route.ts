// src/app/api/articoli/route.ts

import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { Prisma, Scaffale, Posizione } from '@prisma/client';

// ====================================================================
// FUNZIONE GET (Leggi tutti gli articoli) - CON RICERCA CORRETTA
// ====================================================================
export async function GET(request: NextRequest) {
  // 1. Controllo Sicurezza
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
  }

  try {
    // 2. Estrai il termine di ricerca dall'URL
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    // 3. Costruisci la condizione di ricerca
    const whereCondition = search
      ? {
          OR: [
            {
              codice_articolo: {
                contains: search,
                mode: 'insensitive' as const, // <-- CORREZIONE QUI
              },
            },
            {
              nome_pezzo: {
                contains: search,
                mode: 'insensitive' as const, // <-- CORREZIONE QUI
              },
            },
            {
              nome_macchina: {
                contains: search,
                mode: 'insensitive' as const, // <-- CORREZIONE QUI
              },
            },
          ],
        }
      : {}; // Se 'search' è vuoto, il filtro è vuoto

    // 4. Leggi gli articoli dal database CON il filtro
    const articoli = await prisma.articolo.findMany({
      where: whereCondition,
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // 5. Invia la risposta
    return NextResponse.json(articoli);

  } catch (error) {
    console.error("Errore nel fetch degli articoli:", error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}


// ====================================================================
// FUNZIONE POST (Crea un nuovo articolo)
// (Questa funzione è identica a prima e corretta)
// ====================================================================
export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
  }

  try {
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

    if (!codice_articolo || !nome_pezzo || !nome_macchina) {
      return NextResponse.json({ error: 'Codice articolo, Nome pezzo e Nome macchina sono obbligatori' }, { status: 400 });
    }

    const articoloEsistente = await prisma.articolo.findUnique({
      where: { codice_articolo: codice_articolo.trim() },
    });

    if (articoloEsistente) {
      return NextResponse.json({ error: 'Codice articolo già in magazzino' }, { status: 409 }); 
    }

    const pezziInt = parseInt(pezzi_disponibili || "0", 10);
    const scaffaleEnum = (scaffale && Object.values(Scaffale).includes(scaffale)) ? scaffale : undefined;
    const posizioneEnum = (posizione && Object.values(Posizione).includes(posizione)) ? posizione : undefined;

    const nuovoArticolo = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      
      const articolo = await tx.articolo.create({
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
          operazione: 'ARTICOLO CREATO',
          descrizione: `Creato articolo: ${articolo.codice_articolo} (${articolo.nome_pezzo})`,
          utente: {
            connect: { id: session.userId },
          },
          articolo: {
            connect: { id: articolo.id },
          },
        },
      });

      return articolo;
    });
    
    return NextResponse.json(nuovoArticolo, { status: 201 }); 

  } catch (error) {
    console.error("Errore nella creazione dell'articolo:", error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}