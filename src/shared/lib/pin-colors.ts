import type { UsageCategory } from '@/shared/types/enums';

// Espelha a legenda do protótipo: Equipamento Público (verde) · Saúde/Mercado (dourado) · Outros (âmbar).
export function pinColorForCategory(category: UsageCategory): string {
  switch (category) {
    case 'HEALTH':
      return '#C8A84B';
    case 'OTHER':
      return '#B8860B';
    default:
      return '#2D8A3E';
  }
}
