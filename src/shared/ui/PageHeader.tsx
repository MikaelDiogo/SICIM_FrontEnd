import { Box, Text, Title } from '@mantine/core';
import type { ReactNode } from 'react';
import { PAGE_GUTTER_X } from './layout-constants';

interface PageHeaderProps {
  eyebrow: string;
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({ eyebrow, title, subtitle, actions }: PageHeaderProps) {
  return (
    <Box
      style={{
        padding: `22px ${PAGE_GUTTER_X}px 18px`,
        borderBottom: '1px solid #e0e0e0',
        background: 'linear-gradient(180deg, #fff 0%, #F2F2F2 100%)',
        position: 'relative',
      }}
    >
      <Text size="10.5px" tt="uppercase" fw={700} c="#1A5C2A" mb={8} style={{ letterSpacing: 2.5 }}>
        {eyebrow}
      </Text>
      <Title order={1} style={{ fontSize: 22, fontWeight: 600, letterSpacing: -0.2, marginBottom: 6 }}>
        {title}
      </Title>
      {subtitle && (
        <Text c="dimmed" size="13px" maw={640}>
          {subtitle}
        </Text>
      )}
      {actions && (
        <Box style={{ position: 'absolute', right: PAGE_GUTTER_X, top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: 10 }}>
          {actions}
        </Box>
      )}
    </Box>
  );
}
