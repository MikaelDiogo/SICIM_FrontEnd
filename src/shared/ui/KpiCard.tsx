import { Paper, Text } from '@mantine/core';
import type { ReactNode } from 'react';

interface KpiCardProps {
  label: string;
  value: ReactNode;
  trend?: string;
  neutral?: boolean;
}

export function KpiCard({ label, value, trend, neutral = true }: KpiCardProps) {
  return (
    <Paper p="14px 18px">
      <Text size="10px" tt="uppercase" fw={600} c="dimmed" mb={10} style={{ letterSpacing: 1.5 }}>
        {label}
      </Text>
      <Text
        style={{
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: -0.3,
          lineHeight: 1,
          marginBottom: 8,
          color: '#333',
        }}
      >
        {value}
      </Text>
      {trend && (
        <Text size="11px" c={neutral ? 'dimmed' : '#2D8A3E'} ff="monospace">
          {trend}
        </Text>
      )}
    </Paper>
  );
}
