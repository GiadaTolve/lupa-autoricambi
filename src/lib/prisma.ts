// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// Dichiara una variabile globale per "salvare" il client
declare global {
  var prisma: PrismaClient | undefined;
}

// Se il client non esiste, crealo. Altrimenti, riusa quello esistente.
const client = globalThis.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalThis.prisma = client;

export default client;