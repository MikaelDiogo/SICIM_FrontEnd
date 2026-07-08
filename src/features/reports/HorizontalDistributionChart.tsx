import { Box, Stack, Text } from '@mantine/core';
import type { DistributionRow } from '@/shared/lib/property-stats';
import { RADIUS_MD } from '@/shared/ui/layout-constants';

export function HorizontalDistributionChart({ title, rows }: { title: string; rows: DistributionRow[] }) {
  return (
    <Box p="24px 28px" style={{ borderBottom: '1px solid #ededed' }}>
      <Text fw={700} size="sm" tt="uppercase" mb={16} style={{ letterSpacing: 0.5 }}>
        {title}
      </Text>
      <Stack gap={10}>
        {rows.map((row) => (
          <Box key={row.key} style={{ display: 'grid', gridTemplateColumns: '160px 1fr 60px', alignItems: 'center', gap: 12 }}>
            <Text size="xs" fw={500} c="#4a4a4a">
              {row.label}
            </Text>
            <Box style={{ height: 22, background: '#E8F3EB', borderRadius: RADIUS_MD, position: 'relative', overflow: 'hidden' }}>
              <Box
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: `${row.percentage}%`,
                  background: 'linear-gradient(90deg, #3AAB50, #1A5C2A)',
                  borderRadius: RADIUS_MD,
                }}
              />
            </Box>
            <Text size="11.5px" ff="monospace" ta="right" fw={500}>
              {row.count}
            </Text>
          </Box>
        ))}
        {rows.length === 0 && (
          <Text size="sm" c="dimmed">
            Sem dados para os filtros selecionados.
          </Text>
        )}
      </Stack>
    </Box>
  );
}
