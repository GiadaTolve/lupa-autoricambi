// src/app/api/clienti/route.ts

import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { TipoCliente, Prisma } from '@prisma/client'; // Importiamo i nostri Tipi

// ====================================================================
// FUNZIONE GET (Leggi tutti i clienti, con ricerca)
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
              nome_cliente: {
                contains: search,
                mode: 'insensitive' as const,
              },
            },
            {
              numero_telefono: {
                contains: search,
              },
            },
            {
              nome_officina: {
                contains: search,
                mode: 'insensitive' as const,
              },
            },
          ],
        }
      : {};

    // 4. Leggi i clienti dal database CON il filtro
    const clienti = await prisma.cliente.findMany({
      where: whereCondition,
      orderBy: {
        nome_cliente: 'asc', // Ordiniamo per nome
      },
    });

    // 5. Invia la risposta
    return NextResponse.json(clienti);

  } catch (error) {
    console.error("Errore nel fetch dei clienti:", error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}


// ====================================================================
// FUNZIONE POST (Crea un nuovo cliente - "Fidelizza")
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
      nome_cliente, 
      numero_telefono, 
      tipo, // Arriverà come "PRIVATO" o "MECCANICO"
      nome_officina 
    } = body;

    // 2. Validazione Dati
    if (!nome_cliente || !tipo) {
      return NextResponse.json({ error: 'Nome cliente e Tipo sono obbligatori' }, { status: 400 });
    }

    // 3. Controllo Tipo (per sicurezza)
    if (tipo !== TipoCliente.PRIVATO && tipo !== TipoCliente.MECCANICO) {
        return NextResponse.json({ error: 'Tipo cliente non valido' }, { status: 400 });
    }

    // 4. Se è un privato, assicurati che nome_officina sia nullo
    const officinaDaSalvare = (tipo === TipoCliente.MECCANICO) ? nome_officina : null;

    // 5. Creazione nel Database
    // (Qui non abbiamo bisogno di una transazione perché non creiamo un log separato per la *creazione* del cliente,
    // anche se potremmo aggiungerlo in futuro se lo volessimo)
    const nuovoCliente = await prisma.cliente.create({
      data: {
        nome_cliente: nome_cliente,
        numero_telefono: numero_telefono || null,
        tipo: tipo,
        nome_officina: officinaDaSalvare,
      },
    });

    // 6. Invia la risposta di successo
    return NextResponse.json(nuovoCliente, { status: 201 }); // 201 = Created

  } catch (error) {
    console.error("Errore nella creazione del cliente:", error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}