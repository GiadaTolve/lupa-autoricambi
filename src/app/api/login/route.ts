// src/app/api/login/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import * as bcrypt from 'bcryptjs';
import { encrypt } from '@/lib/session'; // <-- Importiamo 'encrypt'

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: 'Username e password sono richiesti' }, { status: 400 });
    }

    const utente = await prisma.utente.findUnique({
      where: { username: username },
    });

    if (!utente) {
      return NextResponse.json({ error: 'Credenziali non valide' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      utente.passwordHash
    );

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Credenziali non valide' }, { status: 401 });
    }

    // --- Logica Corretta ---
    // 1. Password corretta: criptiamo i dati
    const { token, expires } = await encrypt({
      userId: utente.id,
      username: utente.username,
    });

    // 2. Creiamo la risposta e IMPOSTIAMO IL COOKIE
    const response = NextResponse.json({ message: 'Login effettuato con successo' });
    
    response.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: expires,
      sameSite: 'lax',
      path: '/',
    });

    return response;
    
  } catch (error) {
    console.error("Errore nell'API di login:", error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}