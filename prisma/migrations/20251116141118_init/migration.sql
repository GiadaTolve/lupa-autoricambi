-- CreateEnum
CREATE TYPE "Scaffale" AS ENUM ('A', 'B', 'C', 'D', 'E');

-- CreateEnum
CREATE TYPE "Posizione" AS ENUM ('alto', 'mid', 'basso');

-- CreateEnum
CREATE TYPE "TipoCliente" AS ENUM ('PRIVATO', 'MECCANICO');

-- CreateTable
CREATE TABLE "Utente" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Utente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Articolo" (
    "id" TEXT NOT NULL,
    "codice_articolo" TEXT NOT NULL,
    "nome_pezzo" TEXT NOT NULL,
    "nome_macchina" TEXT NOT NULL,
    "pezzi_disponibili" INTEGER NOT NULL DEFAULT 0,
    "codice_posto" TEXT,
    "scaffale" "Scaffale",
    "posizione" "Posizione",
    "immagine_riferimento" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Articolo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL,
    "nome_cliente" TEXT NOT NULL,
    "numero_telefono" TEXT,
    "tipo" "TipoCliente" NOT NULL,
    "nome_officina" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pratica" (
    "id" TEXT NOT NULL,
    "descrizione" TEXT NOT NULL,
    "acconto_versato" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "saldo_rimanente" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "clienteId" TEXT NOT NULL,

    CONSTRAINT "Pratica_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogModifica" (
    "id" TEXT NOT NULL,
    "operazione" TEXT NOT NULL,
    "descrizione" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "utenteId" TEXT NOT NULL,
    "articoloId" TEXT,

    CONSTRAINT "LogModifica_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Utente_username_key" ON "Utente"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Articolo_codice_articolo_key" ON "Articolo"("codice_articolo");

-- AddForeignKey
ALTER TABLE "Pratica" ADD CONSTRAINT "Pratica_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogModifica" ADD CONSTRAINT "LogModifica_utenteId_fkey" FOREIGN KEY ("utenteId") REFERENCES "Utente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogModifica" ADD CONSTRAINT "LogModifica_articoloId_fkey" FOREIGN KEY ("articoloId") REFERENCES "Articolo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
