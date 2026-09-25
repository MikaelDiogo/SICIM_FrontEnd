export interface HistoryDiffRow {
  field: string;
  before: unknown;
  after: unknown;
}

function flatten(obj: Record<string, unknown> | null, prefix = ''): Record<string, unknown> {
  if (!obj) return {};
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(out, flatten(value as Record<string, unknown>, path));
    } else {
      out[path] = value;
    }
  }
  return out;
}

// Compara antes/depois campo a campo (achatando objetos aninhados como "address.street")
// e devolve só o que realmente mudou — o snapshot bruto tem dezenas de campos por linha.
export function diffHistoryEntry(
  before: Record<string, unknown> | null,
  after: Record<string, unknown> | null,
): HistoryDiffRow[] {
  const flatBefore = flatten(before);
  const flatAfter = flatten(after);
  const keys = new Set([...Object.keys(flatBefore), ...Object.keys(flatAfter)]);
  const rows: HistoryDiffRow[] = [];
  for (const key of keys) {
    const b = flatBefore[key];
    const a = flatAfter[key];
    if (JSON.stringify(b) !== JSON.stringify(a)) {
      rows.push({ field: key, before: b, after: a });
    }
  }
  return rows.sort((x, y) => x.field.localeCompare(y.field));
}

export function formatDiffValue(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}
