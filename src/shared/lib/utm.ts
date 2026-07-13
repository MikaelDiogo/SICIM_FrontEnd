// Conversão Lat/Lng (WGS84) <-> UTM (fórmulas de Snyder). Usado para exibir e capturar
// coordenadas no formulário em UTM, mantendo latitude/longitude como formato interno
// (é o que o backend armazena e o que o MapLibre usa para plotar o pino).
const SEMI_MAJOR_AXIS = 6378137.0;
const FLATTENING = 1 / 298.257223563;
const K0 = 0.9996;

const E2 = FLATTENING * (2 - FLATTENING);
const E_PRIME_2 = E2 / (1 - E2);

const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;

export interface UtmCoordinate {
  easting: number;
  northing: number;
  zone: number;
  hemisphere: 'N' | 'S';
}

export function latLngToUtm(lat: number, lng: number): UtmCoordinate {
  const zone = Math.floor((lng + 180) / 6) + 1;
  const lonOrigin = toRad((zone - 1) * 6 - 180 + 3);
  const latRad = toRad(lat);
  const lngRad = toRad(lng);

  const N = SEMI_MAJOR_AXIS / Math.sqrt(1 - E2 * Math.sin(latRad) ** 2);
  const T = Math.tan(latRad) ** 2;
  const C = E_PRIME_2 * Math.cos(latRad) ** 2;
  const A = Math.cos(latRad) * (lngRad - lonOrigin);

  const M =
    SEMI_MAJOR_AXIS *
    ((1 - E2 / 4 - (3 * E2 ** 2) / 64 - (5 * E2 ** 3) / 256) * latRad -
      ((3 * E2) / 8 + (3 * E2 ** 2) / 32 + (45 * E2 ** 3) / 1024) * Math.sin(2 * latRad) +
      ((15 * E2 ** 2) / 256 + (45 * E2 ** 3) / 1024) * Math.sin(4 * latRad) -
      ((35 * E2 ** 3) / 3072) * Math.sin(6 * latRad));

  const easting =
    K0 * N * (A + ((1 - T + C) * A ** 3) / 6 + ((5 - 18 * T + T ** 2 + 72 * C - 58 * E_PRIME_2) * A ** 5) / 120) +
    500000;

  let northing =
    K0 *
    (M +
      N *
        Math.tan(latRad) *
        (A ** 2 / 2 +
          ((5 - T + 9 * C + 4 * C ** 2) * A ** 4) / 24 +
          ((61 - 58 * T + T ** 2 + 600 * C - 330 * E_PRIME_2) * A ** 6) / 720));

  const hemisphere: 'N' | 'S' = lat < 0 ? 'S' : 'N';
  if (hemisphere === 'S') northing += 10000000;

  return { easting, northing, zone, hemisphere };
}

export function utmToLatLng({ easting, northing, zone, hemisphere }: UtmCoordinate): { lat: number; lng: number } {
  const e1 = (1 - Math.sqrt(1 - E2)) / (1 + Math.sqrt(1 - E2));
  const x = easting - 500000;
  const y = hemisphere === 'S' ? northing - 10000000 : northing;
  const lonOrigin = (zone - 1) * 6 - 180 + 3;

  const M = y / K0;
  const mu = M / (SEMI_MAJOR_AXIS * (1 - E2 / 4 - (3 * E2 ** 2) / 64 - (5 * E2 ** 3) / 256));

  const phi1 =
    mu +
    ((3 * e1) / 2 - (27 * e1 ** 3) / 32) * Math.sin(2 * mu) +
    ((21 * e1 ** 2) / 16 - (55 * e1 ** 4) / 32) * Math.sin(4 * mu) +
    ((151 * e1 ** 3) / 96) * Math.sin(6 * mu) +
    ((1097 * e1 ** 4) / 512) * Math.sin(8 * mu);

  const N1 = SEMI_MAJOR_AXIS / Math.sqrt(1 - E2 * Math.sin(phi1) ** 2);
  const T1 = Math.tan(phi1) ** 2;
  const C1 = E_PRIME_2 * Math.cos(phi1) ** 2;
  const R1 = (SEMI_MAJOR_AXIS * (1 - E2)) / Math.pow(1 - E2 * Math.sin(phi1) ** 2, 1.5);
  const D = x / (N1 * K0);

  const lat =
    phi1 -
    ((N1 * Math.tan(phi1)) / R1) *
      (D ** 2 / 2 -
        ((5 + 3 * T1 + 10 * C1 - 4 * C1 ** 2 - 9 * E_PRIME_2) * D ** 4) / 24 +
        ((61 + 90 * T1 + 298 * C1 + 45 * T1 ** 2 - 252 * E_PRIME_2 - 3 * C1 ** 2) * D ** 6) / 720);

  const lng =
    lonOrigin +
    toDeg(
      (D -
        ((1 + 2 * T1 + C1) * D ** 3) / 6 +
        ((5 - 2 * C1 + 28 * T1 - 3 * C1 ** 2 + 8 * E_PRIME_2 + 24 * T1 ** 2) * D ** 5) / 120) /
        Math.cos(phi1),
    );

  return { lat: toDeg(lat), lng };
}

export function formatUtmZone({ zone, hemisphere }: Pick<UtmCoordinate, 'zone' | 'hemisphere'>) {
  return `${zone}${hemisphere}`;
}
