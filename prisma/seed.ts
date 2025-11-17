// Importiamo i pacchetti necessari
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

// Inizializziamo il client di Prisma
const prisma = new PrismaClient();

async function main() {
  console.log('Avvio dello script di seed...');

  // Definiamo le password in chiaro (temporanee)
  const passPasquale = 'lupopas';
  const passAndrea = 'lupoand';
  const passValerio = 'lupoval';

  // Criptiamo le password
  const hashPasquale = await bcrypt.hash(passPasquale, 10);
  const hashAndrea = await bcrypt.hash(passAndrea, 10);
  const hashValerio = await bcrypt.hash(passValerio, 10);

  // Creiamo i 3 utenti.
  // Usiamo 'upsert' invece di 'create' per evitare errori se lo script viene lanciato più volte.
  // 'upsert' = "aggiorna se esiste, altrimenti crea".

  const utente1 = await prisma.utente.upsert({
    where: { username: 'LupoPasquale' },
    update: {},
    create: {
      username: 'LupoPasquale',
      passwordHash: hashPasquale,
    },
  });

  const utente2 = await prisma.utente.upsert({
    where: { username: 'LupoAndrea' },
    update: {},
    create: {
      username: 'LupoAndrea',
      passwordHash: hashAndrea,
    },
  });

  const utente3 = await prisma.utente.upsert({
    where: { username: 'LupoValerio' },
    update: {},
    create: {
      username: 'LupoValerio',
      passwordHash: hashValerio,
    },
  });

  console.log(`Creato utente: ${utente1.username}`);
  console.log(`Creato utente: ${utente2.username}`);
  console.log(`Creato utente: ${utente3.username}`);
  console.log('Seed completato.');
}

// Eseguiamo la funzione main e gestiamo eventuali errori
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // Chiudiamo la connessione al database
    await prisma.$disconnect();
  });