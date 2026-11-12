export function distanciaM(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000; // raio da Terra em metros
  const rad = (graus: number) => (graus * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLng = rad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function arredondar(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}