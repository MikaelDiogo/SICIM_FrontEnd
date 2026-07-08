import { Box, Text } from '@mantine/core';
import { possessionTypeLabels, type PossessionType } from '@/shared/types/enums';

const possessionColor: Record<PossessionType, string> = {
  OWNED: '#2D8A3E',
  RENTED: '#C8A84B',
  GRANTED: '#4A90D9',
  LOAN: '#B8860B',
  USUFRUCT: '#B8860B',
  USE_PERMIT: '#999999',
};

export function PossessionBadge({ type }: { type: PossessionType }) {
  return (
    <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <Box style={{ width: 6, height: 6, borderRadius: '50%', background: possessionColor[type] }} />
      <Text size="11px" fw={600} c="#4a4a4a">
        {possessionTypeLabels[type]}
      </Text>
    </Box>
  );
}
