// src/lib/session.ts
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

// 1. Chiave segreta
const secretKey = new TextEncoder().encode(process.env.SESSION_SECRET || "una-chiave-segreta-molto-sicura-da-cambiare");
const algorithm = 'HS256';

// 2. Funzione per criptare un payload e creare il token (Questa è GIUSTA)
export async function encrypt(payload: { userId: string, username: string }) {
  const expirationTime = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 giorni
  
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: algorithm })
    .setIssuedAt()
    .setExpirationTime(expirationTime)
    .sign(secretKey);
  
  // Restituiamo il token E la sua scadenza
  return { token, expires: expirationTime };
}

// 3. Funzione per verificare la sessione (CON CORREZIONE)
export async function getSession() {
  // --- ECCO LA CORREZIONE ---
  // Abbiamo aggiunto 'await' prima di 'cookies()'
  const token = (await cookies()).get('session')?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: [algorithm],
    });
    return payload as { userId: string, username: string, iat: number, exp: number };
  } catch (error) {
    return null;
  }
}