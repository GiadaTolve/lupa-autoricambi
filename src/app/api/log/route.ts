// src/app/api/log/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';

// ====================================================================
// FUNZIONE GET (Leggi tutti i log)
// ====================================================================
export async function GET(request: Request) {
  // 1. Controllo Sicurezza
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
  }

  try {
    // 2. Leggi tutti i log dal database
    const logs = await prisma.logModifica.findMany({
      // Ordina per data: i più recenti prima
      orderBy: {
        createdAt: 'desc',
      },
      // INCLUDI i dati dell'utente collegato a quel log
      include: {
        utente: {
          select: {
            username: true, // Vogliamo solo il nome utente, non la password!
          },
        },
      },
      // Prendiamo solo gli ultimi 100 log per non appesantire la pagina
      take: 100, 
    });

    // 3. Invia la risposta
    return NextResponse.json(logs);

  } catch (error) {
    console.error("Errore nel fetch dei log:", error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}