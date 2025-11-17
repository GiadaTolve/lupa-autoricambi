// src/app/api/logout/route.ts
import { NextResponse } from 'next/server';
// Nota: non importiamo più 'cookies' da 'next/headers'
// perché non ci serve per cancellare il cookie sulla *risposta*.

// Aggiungiamo 'request: Request' per leggere l'URL
export async function GET(request: Request) {

  // Creiamo una risposta per il reindirizzamento
  // Usiamo request.url per ottenere il dominio corrente (es. https://...onrender.com)
  const response = NextResponse.redirect(new URL('/', request.url));

  // Cancelliamo il cookie impostandolo con una data di scadenza passata
  // Questo si fa sull'oggetto 'response', non importando 'cookies()'
  response.cookies.set('session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(0), // Data nel passato
    sameSite: 'lax',
    path: '/',
  });

  return response;
}