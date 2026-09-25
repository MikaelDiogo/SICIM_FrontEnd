import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Property } from '@/entities/property/property.types';
import type { ReportFilterState } from '@/features/reports/reports-filters';
import type { PropertyAggregates, DistributionRow } from '@/shared/lib/property-stats';
import { possessionTypeLabels, propertyStatusLabels, usageCategoryLabels } from '@/shared/types/enums';
import { formatArea, formatCurrency, formatDateTime, formatNumber } from './format';

const INK_RGB: [number, number, number] = [30, 30, 30];
const MUTED_RGB: [number, number, number] = [120, 120, 120];
const BORDER_RGB: [number, number, number] = [210, 210, 210];
const HEAD_RGB: [number, number, number] = [235, 235, 235];

export interface PdfReportOptions {
  properties: Property[];
  aggregates: PropertyAggregates;
  categoryDistribution: DistributionRow[];
  possessionDistribution: DistributionRow[];
  generatedBy?: string;
  managingUnitNameById?: Map<string, string>;
  filters?: ReportFilterState;
}

const PAGE_W = 210;
const MARGIN = 14;
const CONTENT_W = PAGE_W - MARGIN * 2;

function buildFiltersSummary(
  filters: ReportFilterState | undefined,
  managingUnitNameById: Map<string, string> | undefined,
): string {
  if (!filters) return 'Nenhum filtro aplicado — todos os imóveis do sistema.';
  const parts: string[] = [];
  if (filters.categories.length > 0) {
    parts.push(`Categoria: ${filters.categories.map((c) => usageCategoryLabels[c]).join(', ')}`);
  }
  if (filters.statuses.length > 0) {
    parts.push(`Status: ${filters.statuses.map((s) => propertyStatusLabels[s]).join(', ')}`);
  }
  if (filters.managingUnitIds.length > 0) {
    parts.push(
      `Unidade gestora: ${filters.managingUnitIds.map((id) => managingUnitNameById?.get(id) ?? id).join(', ')}`,
    );
  }
  if (filters.acquisitionYearFrom || filters.acquisitionYearTo) {
    parts.push(`Ano de aquisição: ${filters.acquisitionYearFrom ?? '—'} a ${filters.acquisitionYearTo ?? '—'}`);
  }
  return parts.length > 0 ? parts.join('  ·  ') : 'Nenhum filtro aplicado — todos os imóveis do sistema.';
}

function drawFooter(doc: jsPDF, generatedAt: string, generatedBy?: string) {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i += 1) {
    doc.setPage(i);
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setDrawColor(...BORDER_RGB);
    doc.setLineWidth(0.2);
    doc.line(MARGIN, pageHeight - 12, PAGE_W - MARGIN, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...MUTED_RGB);
    const left = generatedBy ? `Gerado em ${generatedAt} por ${generatedBy}` : `Gerado em ${generatedAt}`;
    doc.text(left, MARGIN, pageHeight - 7);
    doc.text(`Página ${i} de ${pageCount}`, PAGE_W - MARGIN, pageHeight - 7, { align: 'right' });
  }
}

function drawSectionTitle(doc: jsPDF, title: string, y: number): number {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...INK_RGB);
  doc.text(title, MARGIN, y);
  return y + 6;
}

function drawKpiRow(doc: jsPDF, y: number, aggregates: PropertyAggregates, filteredCount: number): number {
  const items = [
    { label: 'Imóveis', value: formatNumber(filteredCount) },
    { label: 'Área Total', value: `${formatNumber(aggregates.totalArea)} m²` },
    { label: 'Valor Original', value: formatCurrency(aggregates.originalValue) },
    { label: 'Valor Patrimonial Líquido', value: formatCurrency(aggregates.netBookValue) },
  ];
  const colW = CONTENT_W / items.length;

  items.forEach((item, index) => {
    const x = MARGIN + index * colW;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...MUTED_RGB);
    doc.text(item.label, x, y);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...INK_RGB);
    doc.text(item.value, x, y + 6);
  });

  doc.setDrawColor(...BORDER_RGB);
  doc.setLineWidth(0.2);
  doc.line(MARGIN, y + 10, PAGE_W - MARGIN, y + 10);

  return y + 16;
}

function drawDistributionTable(doc: jsPDF, title: string, rows: DistributionRow[], y: number): number {
  const cursorY = drawSectionTitle(doc, title, y);
  if (rows.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(...MUTED_RGB);
    doc.text('Sem dados para os filtros selecionados.', MARGIN, cursorY + 3);
    return cursorY + 10;
  }

  autoTable(doc, {
    startY: cursorY,
    margin: { left: MARGIN, right: MARGIN },
    head: [['Descrição', 'Qtd.', '%']],
    body: rows.map((row) => [row.label, String(row.count), `${row.percentage.toFixed(1)}%`]),
    theme: 'plain',
    styles: { font: 'helvetica', fontSize: 8.5, cellPadding: 1.6, textColor: INK_RGB },
    headStyles: { fontStyle: 'bold', textColor: INK_RGB },
    columnStyles: {
      0: { cellWidth: CONTENT_W - 40 },
      1: { cellWidth: 20, halign: 'right' },
      2: { cellWidth: 20, halign: 'right' },
    },
    didParseCell: (data) => {
      if (data.section === 'head') {
        data.cell.styles.lineWidth = { top: 0, right: 0, left: 0, bottom: 0.3 };
        data.cell.styles.lineColor = BORDER_RGB;
      }
    },
  });

  return (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
}

export function generatePropertyReportPdf(options: PdfReportOptions): void {
  const { properties, aggregates, categoryDistribution, possessionDistribution, generatedBy, managingUnitNameById, filters } =
    options;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const now = new Date();
  const generatedAt = formatDateTime(now);

  let y = 18;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...INK_RGB);
  doc.text('SICIM — Relatório Patrimonial', MARGIN, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...MUTED_RGB);
  doc.text(`Emitido em ${generatedAt}${generatedBy ? ` por ${generatedBy}` : ''}`, MARGIN, y);
  y += 4.5;
  doc.text(buildFiltersSummary(filters, managingUnitNameById), MARGIN, y, { maxWidth: CONTENT_W });
  y += 8;

  doc.setDrawColor(...BORDER_RGB);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 8;

  y = drawKpiRow(doc, y, aggregates, properties.length);
  y = drawDistributionTable(doc, 'Distribuição por Categoria de Uso', categoryDistribution, y);
  y = drawDistributionTable(doc, 'Distribuição por Tipo de Posse', possessionDistribution, y);

  drawSectionTitle(doc, 'Relação de Imóveis', y);

  const totalArea = properties.reduce((sum, p) => sum + (p.totalArea ?? 0), 0);
  const totalNetBookValue = properties.reduce((sum, p) => sum + (p.netBookValue ?? 0), 0);

  autoTable(doc, {
    startY: y + 5,
    margin: { left: MARGIN, right: MARGIN, bottom: 18, top: 14 },
    head: [['Matrícula', 'Imóvel / Endereço', 'Unidade', 'Posse', 'Categoria', 'Área (m²)', 'Valor Líquido', 'Status']],
    body: properties.map((property) => [
      property.registrationNumber ?? '—',
      `${property.notarialDescription.slice(0, 42)}\n${property.address.street ?? '—'}, ${property.address.number ?? '—'} - ${property.address.neighborhood ?? '—'}`,
      managingUnitNameById?.get(property.managingUnitId) ?? '—',
      property.possessionType ? possessionTypeLabels[property.possessionType] : '—',
      property.usageCategory ? usageCategoryLabels[property.usageCategory] : '—',
      formatArea(property.totalArea),
      formatCurrency(property.netBookValue),
      propertyStatusLabels[property.status],
    ]),
    foot: [['', '', '', '', 'TOTAL', formatArea(totalArea), formatCurrency(totalNetBookValue), '']],
    theme: 'plain',
    styles: {
      font: 'helvetica',
      fontSize: 7.5,
      cellPadding: 2,
      textColor: INK_RGB,
      lineColor: BORDER_RGB,
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: HEAD_RGB,
      textColor: INK_RGB,
      fontStyle: 'bold',
      fontSize: 7.5,
      lineWidth: { top: 0.3, bottom: 0.3, left: 0, right: 0 },
    },
    footStyles: {
      textColor: INK_RGB,
      fontStyle: 'bold',
      fontSize: 7.5,
      lineWidth: { top: 0.3, bottom: 0, left: 0, right: 0 },
    },
    bodyStyles: { lineWidth: { top: 0, bottom: 0.1, left: 0, right: 0 } },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 50 },
      2: { cellWidth: 18 },
      3: { cellWidth: 18 },
      4: { cellWidth: 20 },
      5: { cellWidth: 18, halign: 'right' },
      6: { cellWidth: 22, halign: 'right' },
      7: { cellWidth: 14 },
    },
  });

  drawFooter(doc, generatedAt, generatedBy);

  doc.save(`sicim-relatorio-patrimonial-${now.toISOString().slice(0, 10)}.pdf`);
}
