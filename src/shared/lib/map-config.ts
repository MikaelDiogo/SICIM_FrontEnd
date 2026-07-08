// OpenFreeMap — tiles gratuitos, sem chave de API. Estilo "positron": 2D flat, sem prédios 3D,
// visual limpo compatível com o protótipo (ver ContextoSICIM.md, seção 7 — Mapas).
export const MAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/positron';

// Bounding box de Crateús/CE — espelha exatamente os limites de @Min/@Max
// de latitude/longitude do RegisterPropertyDto no backend.
export const CRATEUS_BOUNDS: [[number, number], [number, number]] = [
  [-41.2, -5.65], // sudoeste [lng, lat]
  [-40.1, -4.7], // nordeste [lng, lat]
];

export const CRATEUS_CENTER: [number, number] = [-40.67731, -5.17842];

export const DEFAULT_ZOOM = 13;
export const MIN_LATITUDE = -5.65;
export const MAX_LATITUDE = -4.7;
export const MIN_LONGITUDE = -41.2;
export const MAX_LONGITUDE = -40.1;
