// src/app/api/pratiche/route.ts

import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';

// ====================================================================
// FUNZIONE GET (Leggi le pratiche di UN cliente)
// QUESTA FUNZIONE MANCAVA!
// ====================================================================
export async function GET(request: NextRequest) {
  // 1. Controllo Sicurezza
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
  }

  try {
    // 2. Estrai l'ID del cliente dall'URL
    const { searchParams } = new URL(request.url);
    const clienteId = searchParams.get('clienteId');

    if (!clienteId) {
      return NextResponse.json({ error: 'ID Cliente mancante' }, { status: 400 });
    }

    // 3. Leggi TUTTE le pratiche per QUEL cliente
    const pratiche = await prisma.pratica.findMany({
      where: { clienteId: clienteId },
      orderBy: {
        createdAt: 'desc', // Le più recenti prima
      },
    });

    // 4. Invia la risposta
    return NextResponse.json(pratiche);

  } catch (error) {
    console.error("Errore nel fetch delle pratiche:", error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}

// ====================================================================
// FUNZIONE POST (Crea una nuova pratica per UN cliente)
// (Questa probabilmente c'era già, ma la rimettiamo per sicurezza)
// ====================================================================
export async function POST(request: Request) {
  // 1. Controllo Sicurezza
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { 
      descrizione, 
      acconto_versato, 
      saldo_rimanente,
      clienteId // L'ID del cliente a cui collegare la pratica
    } = body;

    // 2. Validazione Dati
    if (!descrizione || !clienteId) {
      return NextResponse.json({ error: 'Descrizione e ID Cliente sono obbligatori' }, { status: 400 });
    }
    
    // 3. Trasformazione Dati (Convertiamo in numeri)
    const accontoFloat = parseFloat(acconto_versato || "0");
    const saldoFloat = parseFloat(saldo_rimanente || "0");

    // 4. Creazione nel Database
    const nuovaPratica = await prisma.pratica.create({
      data: {
        descrizione: descrizione,
        acconto_versato: accontoFloat,
        saldo_rimanente: saldoFloat,
        cliente: {
          connect: { id: clienteId },
        },
      },
    });

    // 5. Invia la risposta di successo
    return NextResponse.json(nuovaPratica, { status: 201 });

  } catch (error) {
    console.error("Errore nella creazione della pratica:", error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}