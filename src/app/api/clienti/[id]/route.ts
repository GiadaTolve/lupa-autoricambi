// src/app/api/clienti/[id]/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { TipoCliente, Prisma } from '@prisma/client';

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
// FUNZIONE GET (Leggi UN cliente) - QUESTA È NUOVA!
// ====================================================================
export async function GET(request: Request) {
  // 1. Controllo Sicurezza
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
  }

  try {
    // 2. Workaround per l'ID
    const clienteId = getIdFromUrl(request.url);
    if (!clienteId) {
      return NextResponse.json({ error: "ID cliente mancante" }, { status: 400 });
    }

    // 3. Trova il cliente nel database
    const cliente = await prisma.cliente.findUnique({
      where: { id: clienteId },
    });

    if (!cliente) {
      return NextResponse.json({ error: 'Cliente non trovato' }, { status: 404 });
    }

    // 4. Invia la risposta
    return NextResponse.json(cliente);

  } catch (error) {
    console.error("Errore nel fetch del cliente:", error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}


// ====================================================================
// FUNZIONE PATCH (Modifica un cliente)
// ====================================================================
export async function PATCH(request: Request) {
  // 1. Controllo Sicurezza
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
  }

  try {
    // 2. Workaround per l'ID
    const clienteId = getIdFromUrl(request.url);
    if (!clienteId) {
      return NextResponse.json({ error: "ID cliente mancante" }, { status: 400 });
    }
    
    const body = await request.json();
    const { 
      nome_cliente, 
      numero_telefono, 
      tipo, // "PRIVATO" o "MECCANICO"
      nome_officina 
    } = body;

    // 3. Validazione Dati
    if (!nome_cliente || !tipo) {
      return NextResponse.json({ error: 'Nome cliente e Tipo sono obbligatori' }, { status: 400 });
    }
    if (tipo !== TipoCliente.PRIVATO && tipo !== TipoCliente.MECCANICO) {
        return NextResponse.json({ error: 'Tipo cliente non valido' }, { status: 400 });
    }

    // 4. Se è un privato, assicurati che nome_officina sia nullo
    const officinaDaSalvare = (tipo === TipoCliente.MECCANICO) ? nome_officina : null;

    // 5. Modifica nel Database
    const clienteAggiornato = await prisma.cliente.update({
      where: { id: clienteId },
      data: {
        nome_cliente: nome_cliente,
        numero_telefono: numero_telefono || null,
        tipo: tipo,
        nome_officina: officinaDaSalvare,
      },
    });

    // 6. Invia la risposta di successo
    return NextResponse.json(clienteAggiornato);

  } catch (error) {
    console.error("Errore nella modifica del cliente:", error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}


// ====================================================================
// FUNZIONE DELETE (Elimina un cliente)
// ====================================================================
export async function DELETE(request: Request) {
  // 1. Controllo Sicurezza
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
  }

  try {
    // 2. Workaround per l'ID
    const clienteId = getIdFromUrl(request.url);
    if (!clienteId) {
      return NextResponse.json({ error: "ID cliente mancante" }, { status: 400 });
    }

    // 3. CONTROLLO DI SICUREZZA FONDAMENTALE (da schema.prisma)
    const praticheEsistenti = await prisma.pratica.count({
      where: { clienteId: clienteId },
    });

    if (praticheEsistenti > 0) {
      return NextResponse.json(
        { error: `Impossibile eliminare: questo cliente ha ${praticheEsistenti} pratiche collegate.` },
        { status: 409 }
      );
    }

    // 4. Se non ci sono pratiche, procedi con l'eliminazione
    await prisma.cliente.delete({
      where: { id: clienteId },
    });

    // 5. Invia la risposta di successo
    return NextResponse.json({ message: 'Cliente eliminato con successo' });

  } catch (error) {
    console.error("Errore nell'eliminazione del cliente:", error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}