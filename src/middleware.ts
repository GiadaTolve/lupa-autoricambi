// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from './lib/session';

export async function middleware(request: NextRequest) {
  const session = await getSession();
  const { pathname } = request.nextUrl;

  // 1. Se l'utente NON è loggato (non ha sessione)
  if (!session) {
    // Se cerca di accedere a una pagina protetta (non la root /),
    // reindirizzalo alla pagina di login (la root /)
    if (pathname !== '/') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    // Se è già sulla pagina di login, lascialo stare
    return NextResponse.next();
  }

  // 2. Se l'utente È loggato (ha la sessione)
  // Se prova ad andare sulla pagina di login (/),
  // reindirizzalo alla dashboard.
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Se è loggato e va in qualsiasi altra pagina, lascialo passare
  return NextResponse.next();
}

// Configurazione: su quali rotte deve girare il middleware
export const config = {
  matcher: [
    /*
     * Abbina tutti i percorsi eccetto quelli che iniziano con:
     * - api (rotte API)
     * - _next/static (file statici)
     * - _next/image (ottimizzazione immagini)
     * - favicon.ico (icona)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};