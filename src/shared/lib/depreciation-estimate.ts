import type { UsageCategory } from '@/shared/types/enums';

// Espelha ANNUAL_DEPRECIATION_RATE em depreciation-calculator.ts (backend) — apenas para
// exibir uma ESTIMATIVA no formulário. O valor oficial é sempre calculado e persistido pelo
// backend (ver ContextoSICIM.md, regra de negócio #3): este preview nunca é enviado à API.
const ANNUAL_DEPRECIATION_RATE: Record<UsageCategory, number> = {
  ADMINISTRATIVE: 0.02,
  EDUCATIONAL: 0.02,
  HEALTH: 0.025,
  SOCIAL_ASSISTANCE: 0.02,
  CULTURAL: 0.015,
  OTHER: 0.02,
};

export function estimateNetBookValue(originalValue: number, usageCategory: UsageCategory, acquisitionYear: number) {
  const yearsElapsed = Math.max(0, new Date().getFullYear() - acquisitionYear);
  const rate = ANNUAL_DEPRECIATION_RATE[usageCategory];
  const depreciation = Math.min(originalValue * rate * yearsElapsed, originalValue);
  return { depreciation, netBookValue: originalValue - depreciation };
}
