// src/app/api/logout/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Creiamo una risposta per il reindirizzamento
  const response = NextResponse.redirect(new URL('/', request.url));

  // Cancelliamo il cookie impostandolo con una data di scadenza passata
  response.cookies.set('session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(0), // Data nel passato
    sameSite: 'lax',
    path: '/',
  });

  return response;
}