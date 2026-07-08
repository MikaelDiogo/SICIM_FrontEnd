import { Box, Overlay, Text } from '@mantine/core';
import type { Property } from '@/entities/property/property.types';
import { useMapInstance } from '@/shared/lib/use-map-instance';
import { RADIUS_MD } from '@/shared/ui/layout-constants';
import { usePropertyMarkers } from '@/shared/ui/use-property-markers';
import { MapLegend } from './MapLegend';

export function PropertyMap({
  properties,
  height = 440,
  fitToMarkers = true,
  onSelect,
  showOverlay = true,
}: {
  properties: Property[];
  height?: number | string;
  fitToMarkers?: boolean;
  onSelect?: (property: Property) => void;
  showOverlay?: boolean;
}) {
  const { containerRef, mapRef, isLoaded } = useMapInstance();
  usePropertyMarkers({ mapRef, isLoaded, properties, onSelect, fitToMarkers });

  return (
    <Box style={{ position: 'relative', height, background: '#e8efe9', overflow: 'hidden' }}>
      <Box ref={containerRef} style={{ position: 'absolute', inset: 0 }} />
      {!isLoaded && (
        <Overlay backgroundOpacity={0.4} color="#e8efe9">
          <Text size="sm" c="dimmed" ta="center" pt="xl">
            Carregando mapa…
          </Text>
        </Overlay>
      )}
      {showOverlay && isLoaded && (
        <Box
          style={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(8px)',
            border: '1px solid #e0e0e0',
            borderRadius: RADIUS_MD,
            padding: '12px 14px',
            fontSize: 11,
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          }}
        >
          <Text size="sm" fw={700} span>
            {properties.length} imóveis
          </Text>{' '}
          <Text size="11px" span c="dimmed">
            visíveis no perímetro
          </Text>
          <MapLegend />
        </Box>
      )}
    </Box>
  );
}
