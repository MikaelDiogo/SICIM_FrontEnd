import maplibregl from 'maplibre-gl';
import { useEffect, useRef, useState } from 'react';
import { CRATEUS_CENTER, DEFAULT_ZOOM, MAP_STYLE_URL } from './map-config';

interface UseMapInstanceOptions {
  center?: [number, number];
  zoom?: number;
  interactive?: boolean;
}

/**
 * Inicializa uma instância MapLibre GL uma única vez por montagem do container.
 * Retorna o container (para o ref do div) e a instância do mapa assim que carregada,
 * disparando um segundo render (via state) para que efeitos dependentes (marcadores)
 * possam rodar com o mapa já pronto.
 */
export function useMapInstance({ center = CRATEUS_CENTER, zoom = DEFAULT_ZOOM, interactive = true }: UseMapInstanceOptions = {}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE_URL,
      center,
      zoom,
      interactive,
      attributionControl: { compact: true },
    });

    if (interactive) {
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    }

    map.on('load', () => setIsLoaded(true));
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      setIsLoaded(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { containerRef, mapRef, isLoaded };
}
