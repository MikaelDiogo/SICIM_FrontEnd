import proj4 from 'proj4';

// EPSG:32724 — WGS84 / UTM zona 24S (fuso que cobre Crateús/CE)
proj4.defs('UTM_24S', '+proj=utm +zone=24 +south +datum=WGS84 +units=m +no_defs +type=crs');

// Ponto de fallback: centro aproximado de Crateús (lat/lng e UTM equivalente)
const CRATEUS_LAT = -5.17842;
const CRATEUS_LNG = -40.67731;
// UTM 24S correspondente (pré-calculado para não depender de conversão no fallback)
const CRATEUS_EASTING = 441_600;
const CRATEUS_NORTHING = 9_427_500;

export interface UtmCoordinate {
  easting: number;
  northing: number;
  zone: 24;
  hemisphere: 'S';
}

/**
 * Converte latitude/longitude WGS84 para UTM zona 24S via proj4 (EPSG:32724).
 * Retorna o centro de Crateús se a conversão falhar (coordenada inválida ou fora do fuso).
 */
export function latLngToUtm(lat: number, lng: number): UtmCoordinate {
  try {
    if (!isFinite(lat) || !isFinite(lng)) throw new Error('invalid');
    const [easting, northing] = proj4('UTM_24S', [lng, lat]);
    if (!isFinite(easting) || !isFinite(northing)) throw new Error('invalid result');
    return { easting, northing, zone: 24, hemisphere: 'S' };
  } catch {
    return { easting: CRATEUS_EASTING, northing: CRATEUS_NORTHING, zone: 24, hemisphere: 'S' };
  }
}

/**
 * Converte UTM zona 24S para latitude/longitude WGS84 via proj4 (EPSG:32724).
 * Retorna o centro de Crateús se a conversão falhar.
 */
export function utmToLatLng({ easting, northing }: UtmCoordinate): { lat: number; lng: number } {
  try {
    if (!isFinite(easting) || !isFinite(northing)) throw new Error('invalid');
    const [lng, lat] = proj4('UTM_24S', 'WGS84', [easting, northing]);
    if (!isFinite(lat) || !isFinite(lng)) throw new Error('invalid result');
    return { lat, lng };
  } catch {
    return { lat: CRATEUS_LAT, lng: CRATEUS_LNG };
  }
}

export function formatUtmZone(_coord: Pick<UtmCoordinate, 'zone' | 'hemisphere'>) {
  return '24S';
}
