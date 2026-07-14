import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Property } from '@/entities/property/property.types';
import type { PropertyAggregates, DistributionRow } from '@/shared/lib/property-stats';
import { possessionTypeLabels, propertyStatusLabels, usageCategoryLabels } from '@/shared/types/enums';
import { formatArea, formatCurrency, formatDate, formatNumber } from './format';

const GREEN_RGB: [number, number, number] = [26, 92, 42];
const GOLD_RGB: [number, number, number] = [200, 168, 75];
const INK_RGB: [number, number, number] = [45, 45, 45];
const MUTED_RGB: [number, number, number] = [120, 120, 120];
const LIGHT_RGB: [number, number, number] = [242, 242, 242];

export interface PdfReportOptions {
  properties: Property[];
  aggregates: PropertyAggregates;
  categoryDistribution: DistributionRow[];
  possessionDistribution: DistributionRow[];
  generatedBy?: string;
  managingUnitNameById?: Map<string, string>;
}

const PAGE_W = 210;
const MARGIN = 14;
const CONTENT_W = PAGE_W - MARGIN * 2;

function drawHeader(doc: jsPDF, subtitle: string) {
  doc.setFillColor(...GREEN_RGB);
  doc.rect(0, 0, PAGE_W, 26, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('SICIM', MARGIN, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(230, 236, 231);
  doc.text('Sistema de Controle de Imóveis Municipais · Crateús/CE', MARGIN, 18);

  doc.setDrawColor(...GOLD_RGB);
  doc.setLineWidth(0.8);
  doc.line(MARGIN, 22, PAGE_W - MARGIN, 22);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(subtitle, PAGE_W - MARGIN, 12, { align: 'right' });
}

function drawFooter(doc: jsPDF, generatedAt: string, generatedBy?: string) {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i += 1) {
    doc.setPage(i);
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.2);
    doc.line(MARGIN, pageHeight - 14, PAGE_W - MARGIN, pageHeight - 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...MUTED_RGB);
    const left = generatedBy
      ? `Gerado em ${generatedAt} por ${generatedBy}`
      : `Gerado em ${generatedAt}`;
    doc.text(left, MARGIN, pageHeight - 9);
    doc.text('Documento gerado eletronicamente pelo SICIM', PAGE_W / 2, pageHeight - 9, { align: 'center' });
    doc.text(`Página ${i} de ${pageCount}`, PAGE_W - MARGIN, pageHeight - 9, { align: 'right' });
  }
}

function drawSectionTitle(doc: jsPDF, title: string, y: number): number {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...INK_RGB);
  doc.text(title, MARGIN, y);
  doc.setDrawColor(...GREEN_RGB);
  doc.setLineWidth(0.6);
  doc.line(MARGIN, y + 1.5, PAGE_W - MARGIN, y + 1.5);
  return y + 8;
}

function drawKpiCards(doc: jsPDF, y: number, aggregates: PropertyAggregates, filteredCount: number): number {
  const cards = [
    { label: 'Imóveis', value: formatNumber(filteredCount) },
    { label: 'Área Total', value: `${formatNumber(aggregates.totalArea)} m²` },
    { label: 'Valor Original', value: formatCurrency(aggregates.originalValue) },
    { label: 'Valor Patrimonial Líquido', value: formatCurrency(aggregates.netBookValue) },
  ];
  const gap = 4;
  const cardW = (CONTENT_W - gap * (cards.length - 1)) / cards.length;
  const cardH = 20;

  cards.forEach((card, index) => {
    const x = MARGIN + index * (cardW + gap);
    doc.setFillColor(...LIGHT_RGB);
    doc.roundedRect(x, y, cardW, cardH, 1.5, 1.5, 'F');
    doc.setDrawColor(...GREEN_RGB);
    doc.setLineWidth(0.5);
    doc.line(x, y, x, y + cardH);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...MUTED_RGB);
    doc.text(card.label.toUpperCase(), x + 3, y + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...INK_RGB);
    doc.text(card.value, x + 3, y + 15);
  });

  return y + cardH + 10;
}

function drawDistribution(doc: jsPDF, title: string, rows: DistributionRow[], y: number): number {
  let cursorY = drawSectionTitle(doc, title, y);
  const barX = MARGIN + 55;
  const barMaxW = CONTENT_W - 55 - 18;
  const barH = 4;

  rows.forEach((row) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...INK_RGB);
    doc.text(row.label, MARGIN, cursorY + 3);

    doc.setFillColor(...LIGHT_RGB);
    doc.roundedRect(barX, cursorY, barMaxW, barH, 1, 1, 'F');
    doc.setFillColor(...GREEN_RGB);
    const w = Math.max((row.percentage / 100) * barMaxW, row.percentage > 0 ? 2 : 0);
    doc.roundedRect(barX, cursorY, w, barH, 1, 1, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(String(row.count), PAGE_W - MARGIN, cursorY + 3.2, { align: 'right' });

    cursorY += 8;
  });

  if (rows.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(...MUTED_RGB);
    doc.text('Sem dados para os filtros selecionados.', MARGIN, cursorY + 3);
    cursorY += 8;
  }

  return cursorY + 6;
}

export function generatePropertyReportPdf(options: PdfReportOptions): void {
  const { properties, aggregates, categoryDistribution, possessionDistribution, generatedBy, managingUnitNameById } = options;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const generatedAt = formatDate(new Date());

  drawHeader(doc, 'RELATÓRIO PATRIMONIAL CONSOLIDADO');

  let y = 36;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(...INK_RGB);
  doc.text('Patrimônio Imobiliário Municipal', MARGIN, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED_RGB);
  doc.text(`Emitido em ${generatedAt} · ${formatNumber(properties.length)} imóveis considerados nos filtros aplicados`, MARGIN, y);
  y += 8;

  y = drawKpiCards(doc, y, aggregates, properties.length);
  y = drawDistribution(doc, 'Distribuição por Categoria de Uso', categoryDistribution, y);
  y = drawDistribution(doc, 'Distribuição por Tipo de Posse', possessionDistribution, y);

  drawSectionTitle(doc, 'Relação de Imóveis', y);

  autoTable(doc, {
    startY: y + 4,
    margin: { left: MARGIN, right: MARGIN, bottom: 20 },
    head: [['Matrícula', 'Imóvel / Endereço', 'Unidade', 'Posse', 'Categoria', 'Área (m²)', 'Valor Líquido', 'Status']],
    body: properties.map((property) => [
      property.registrationNumber,
      `${property.notarialDescription.slice(0, 46)}\n${property.address.street}, ${property.address.number} - ${property.address.neighborhood}`,
      managingUnitNameById?.get(property.managingUnitId) ?? '—',
      possessionTypeLabels[property.possessionType],
      usageCategoryLabels[property.usageCategory],
      formatArea(property.totalArea),
      formatCurrency(property.netBookValue),
      propertyStatusLabels[property.status],
    ]),
    styles: {
      font: 'helvetica',
      fontSize: 7.5,
      cellPadding: 2.2,
      textColor: INK_RGB,
      lineColor: [225, 225, 225],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: GREEN_RGB,
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 7.5,
    },
    alternateRowStyles: { fillColor: [248, 249, 248] },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 52 },
      2: { cellWidth: 20 },
      3: { cellWidth: 20 },
      4: { cellWidth: 22 },
      5: { cellWidth: 20 },
      6: { cellWidth: 24, halign: 'right' },
      7: { cellWidth: 20 },
    },
    didDrawPage: () => {
      if (doc.getNumberOfPages() > 1) {
        drawHeader(doc, 'RELATÓRIO PATRIMONIAL CONSOLIDADO');
      }
    },
  });

  drawFooter(doc, generatedAt, generatedBy);

  doc.save(`sicim-relatorio-patrimonial-${new Date().toISOString().slice(0, 10)}.pdf`);
}
