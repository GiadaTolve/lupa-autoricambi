// src/lib/pdfGenerator.ts
import jsPDF from 'jspdf';
// 1. IMPORTIAMO 'autoTable' DIRETTAMENTE
import autoTable from 'jspdf-autotable';
import type { Cliente, Pratica } from '@prisma/client';

// 2. NON CI SERVE PIÙ QUESTA DICHIARAZIONE
// declare module 'jspdf' { ... }

// Funzione per formattare le date
const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const generateClientePDF = (
  cliente: Cliente, 
  pratiche: Pratica[], 
  saldoTotale: number
) => {
  const doc = new jsPDF();
  const dataOggi = formatDate(new Date());

  // Titolo e Data
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('Report Cliente - Lupa Autoricambi', 14, 22);
  doc.setFontSize(11);
  doc.setFont('Helvetica', 'normal');
  doc.text(`Report generato il: ${dataOggi}`, 14, 28);

  // Informazioni Cliente
  doc.setFontSize(12);
  doc.setFont('Helvetica', 'bold');
  doc.text('Dati Cliente', 14, 40);
  doc.setFont('Helvetica', 'normal');
  doc.text(`Nome: ${cliente.nome_cliente}`, 14, 46);
  doc.text(`Telefono: ${cliente.numero_telefono || '-'}`, 14, 52);
  doc.text(`Tipo: ${cliente.tipo}`, 14, 58);
  if (cliente.tipo === 'MECCANICO') {
    doc.text(`Officina: ${cliente.nome_officina || '-'}`, 14, 64);
  }

  // Riepilogo Saldo
  doc.setFont('Helvetica', 'bold');
  doc.text('Riepilogo Saldo', 140, 40);
  if (saldoTotale > 0) {
    doc.setFontSize(14);
    doc.setTextColor(255, 0, 0); // Rosso
    doc.text(`SALDO TOTALE: -${saldoTotale.toFixed(2)} €`, 140, 48);
  } else {
    doc.setFontSize(14);
    doc.setTextColor(0, 128, 0); // Verde
    doc.text('SALDO TOTALE: ✅ Pagato', 140, 48);
  }
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);

  // Tabella Pratiche
  doc.setFont('Helvetica', 'bold');
  doc.text('Storico Pratiche e Pagamenti', 14, 80);

  const head = [['Data', 'Descrizione', 'Acconto (€)', 'Saldo (€)']];
  const body = pratiche.map(p => [
    formatDate(p.createdAt),
    p.descrizione,
    p.acconto_versato.toFixed(2),
    p.saldo_rimanente.toFixed(2)
  ]);

  // 3. CHIAMIAMO 'autoTable' COME FUNZIONE, PASSANDO 'doc'
  autoTable(doc, {
    startY: 85,
    head: head,
    body: body,
    theme: 'grid',
    headStyles: {
      fillColor: [51, 51, 51] // Grigio scuro
    }
  });

  // Nome del file
  const fileName = `Report-Cliente-${cliente.nome_cliente.replace(/ /g, '_')}.pdf`;
  doc.save(fileName);
};