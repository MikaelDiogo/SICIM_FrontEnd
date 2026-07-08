import { Box, Group, Text } from '@mantine/core';

const legendItems = [
  { color: '#2D8A3E', label: 'Equipamento Público' },
  { color: '#C8A84B', label: 'Saúde / Mercado' },
  { color: '#B8860B', label: 'Outros' },
];

export function MapLegend() {
  return (
    <Group gap={16} mt={8}>
      {legendItems.map((item) => (
        <Group gap={6} key={item.label}>
          <Box style={{ width: 10, height: 10, borderRadius: '50%', background: item.color }} />
          <Text size="11px">{item.label}</Text>
        </Group>
      ))}
    </Group>
  );
}
