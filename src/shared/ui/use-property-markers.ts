import maplibregl from 'maplibre-gl';
import { useEffect } from 'react';
import type { Property } from '@/entities/property/property.types';
import { formatArea } from '@/shared/lib/format';
import { pinColorForCategory } from '@/shared/lib/pin-colors';

function createPinElement(color: string): HTMLDivElement {
  const wrapper = document.createElement('div');
  wrapper.style.width = '28px';
  wrapper.style.height = '28px';
  wrapper.style.cursor = 'pointer';
  wrapper.innerHTML = `
    <svg width="28" height="28" viewBox="0 0 28 28" style="display:block;">
      <path
        d="M14 27C14 27 24 17.5 24 11C24 4.9 19.6 1 14 1C8.4 1 4 4.9 4 11C4 17.5 14 27 14 27Z"
        fill="${color}"
        stroke="#fff"
        stroke-width="1.5"
      />
      <circle cx="14" cy="11" r="4" fill="#fff" />
    </svg>
  `;
  return wrapper;
}

interface UsePropertyMarkersArgs {
  mapRef: React.RefObject<maplibregl.Map | null>;
  isLoaded: boolean;
  properties: Property[];
  onSelect?: (property: Property) => void;
  fitToMarkers?: boolean;
}

export function usePropertyMarkers({ mapRef, isLoaded, properties, onSelect, fitToMarkers }: UsePropertyMarkersArgs) {
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isLoaded) return;

    const markers = properties.map((property) => {
      const el = createPinElement(pinColorForCategory(property.usageCategory));
      const popup = new maplibregl.Popup({ offset: 16, closeButton: false, closeOnClick: false }).setHTML(`
        <div style="padding:8px 12px; min-width:180px; font-family: 'Inter', sans-serif;">
          <div style="font-family:'Inter',sans-serif; font-size:13px; font-weight:600; color:#333;">
            ${property.notarialDescription.slice(0, 48)}
          </div>
          <div style="font-size:11px; color:#999; font-family:'JetBrains Mono',monospace; margin-top:2px;">
            ${property.registrationNumber} · ${formatArea(property.totalArea)}
          </div>
        </div>
      `);

      const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([property.longitude, property.latitude])
        .setPopup(popup)
        .addTo(map);

      el.addEventListener('mouseenter', () => marker.togglePopup());
      el.addEventListener('mouseleave', () => marker.togglePopup());
      el.addEventListener('click', () => onSelect?.(property));

      return marker;
    });

    if (fitToMarkers && properties.length > 0) {
      const bounds = properties.reduce(
        (acc, property) => acc.extend([property.longitude, property.latitude]),
        new maplibregl.LngLatBounds(
          [properties[0].longitude, properties[0].latitude],
          [properties[0].longitude, properties[0].latitude],
        ),
      );
      map.fitBounds(bounds, { padding: 60, maxZoom: 15, duration: 600 });
    }

    return () => {
      markers.forEach((marker) => marker.remove());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapRef, isLoaded, properties, onSelect, fitToMarkers]);
}
