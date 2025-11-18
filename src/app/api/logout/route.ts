// src/app/api/logout/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  
  // --- MODIFICA CHIAVE ---
  // NON dobbiamo reindirizzare. Dobbiamo solo rispondere con JSON.
  const response = NextResponse.json({ message: 'Logout effettuato con successo' });
  // --- FINE MODIFICA ---

  // Cancelliamo il cookie impostandolo con una data di scadenza passata
  response.cookies.set('session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(0), // Data nel passato
    sameSite: 'lax',
    path: '/',
  });

  return response; // Invia la risposta 200 OK + JSON
}