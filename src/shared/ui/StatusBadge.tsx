import { Badge } from '@mantine/core';
import { propertyStatusLabels, type PropertyStatus } from '@/shared/types/enums';

const statusColor: Record<PropertyStatus, { bg: string; c: string }> = {
  APPROVED: { bg: '#d9ebde', c: '#1A5C2A' },
  PENDING_APPROVAL: { bg: '#faf2dd', c: '#7a5a08' },
  DRAFT: { bg: '#F2F2F2', c: '#666' },
  INACTIVE: { bg: '#f3dede', c: '#9c3838' },
};

export function StatusBadge({ status }: { status: PropertyStatus }) {
  const { bg, c } = statusColor[status];
  return (
    <Badge variant="light" radius="xl" style={{ background: bg, color: c }}>
      {propertyStatusLabels[status]}
    </Badge>
  );
}
