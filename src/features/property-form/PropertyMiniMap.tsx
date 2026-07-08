import maplibregl from 'maplibre-gl';
import { Box, Text } from '@mantine/core';
import { useEffect, useRef } from 'react';
import { CRATEUS_BOUNDS, MAX_LATITUDE, MAX_LONGITUDE, MIN_LATITUDE, MIN_LONGITUDE } from '@/shared/lib/map-config';
import { useMapInstance } from '@/shared/lib/use-map-instance';
import { RADIUS_MD } from '@/shared/ui/layout-constants';

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function PropertyMiniMap({
  latitude,
  longitude,
  onChange,
}: {
  latitude: number;
  longitude: number;
  onChange: (lat: number, lng: number) => void;
}) {
  const { containerRef, mapRef, isLoaded } = useMapInstance({ zoom: 14 });
  const markerRef = useRef<maplibregl.Marker | null>(null);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isLoaded) return;

    map.fitBounds(CRATEUS_BOUNDS, { padding: 20, duration: 0 });

    const el = document.createElement('div');
    el.innerHTML = `
      <svg width="36" height="36" viewBox="0 0 28 28">
        <path d="M14 27C14 27 24 17.5 24 11C24 4.9 19.6 1 14 1C8.4 1 4 4.9 4 11C4 17.5 14 27 14 27Z" fill="#F5D000" stroke="#1A5C2A" stroke-width="1.5"/>
        <circle cx="14" cy="11" r="4" fill="#1A5C2A" />
      </svg>
    `;
    el.style.cursor = 'grab';

    const marker = new maplibregl.Marker({ element: el, anchor: 'bottom', draggable: true })
      .setLngLat([longitude, latitude])
      .addTo(map);

    marker.on('dragend', () => {
      const { lat, lng } = marker.getLngLat();
      onChange(clamp(lat, MIN_LATITUDE, MAX_LATITUDE), clamp(lng, MIN_LONGITUDE, MAX_LONGITUDE));
    });

    const handleMapClick = (event: maplibregl.MapMouseEvent) => {
      const lat = clamp(event.lngLat.lat, MIN_LATITUDE, MAX_LATITUDE);
      const lng = clamp(event.lngLat.lng, MIN_LONGITUDE, MAX_LONGITUDE);
      marker.setLngLat([lng, lat]);
      onChange(lat, lng);
    };
    map.on('click', handleMapClick);

    markerRef.current = marker;

    return () => {
      map.off('click', handleMapClick);
      marker.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded]);

  useEffect(() => {
    const marker = markerRef.current;
    const current = marker?.getLngLat();
    if (marker && current && (current.lat !== latitude || current.lng !== longitude)) {
      marker.setLngLat([longitude, latitude]);
    }
  }, [latitude, longitude]);

  return (
    <Box style={{ position: 'relative', height: 280, background: '#e8efe9' }}>
      <Box ref={containerRef} style={{ position: 'absolute', inset: 0 }} />
      <Box
        style={{
          position: 'absolute',
          bottom: 12,
          left: 12,
          right: 12,
          background: 'rgba(255,255,255,0.95)',
          borderRadius: RADIUS_MD,
          padding: '8px 12px',
          textAlign: 'center',
          backdropFilter: 'blur(4px)',
          border: '1px solid #e0e0e0',
        }}
      >
        <Text size="11.5px" c="#4a4a4a">
          💡 Clique no mapa ou arraste o pin para posicionar o imóvel
        </Text>
      </Box>
    </Box>
  );
}
