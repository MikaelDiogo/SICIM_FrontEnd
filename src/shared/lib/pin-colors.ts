import type { UsageCategory } from '@/shared/types/enums';

// Espelha a legenda do protótipo: Equipamento Público (verde) · Saúde/Mercado (dourado) · Outros (âmbar).
export function pinColorForCategory(category: UsageCategory | null): string {
  switch (category) {
    case 'HEALTH':
      return '#C8A84B';
    case 'OTHER':
      return '#B8860B';
    case null:
      return '#999999';
    default:
      return '#2D8A3E';
  }
}
