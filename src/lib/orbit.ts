// Lightweight 2-body / Keplerian helpers — enough for the visualization.
// All distances in km, times in seconds, mu in km³/s².

export const MU_EARTH = 398_600.4418;        // km³/s²
export const R_EARTH  = 6_378.137;           // km
export const R_MOON   = 1_737.4;             // km
export const D_EARTH_MOON = 384_400;         // km, mean

/** Circular orbital speed at altitude (km) above Earth surface. */
export function circularSpeed(altKm: number): number {
  const r = R_EARTH + altKm;
  return Math.sqrt(MU_EARTH / r); // km/s
}

/** Period (s) of circular orbit at given altitude (km). */
export function circularPeriod(altKm: number): number {
  const r = R_EARTH + altKm;
  return 2 * Math.PI * Math.sqrt((r * r * r) / MU_EARTH);
}

/** Trans-Lunar injection ΔV (km/s) from circular parking orbit at altKm (rough). */
export function tliDv(altKm: number): number {
  const r = R_EARTH + altKm;
  // Hohmann to lunar mean distance, ignoring lunar gravity grab.
  const a = (r + D_EARTH_MOON) / 2;
  const v_park   = Math.sqrt(MU_EARTH / r);
  const v_per    = Math.sqrt(MU_EARTH * (2 / r - 1 / a));
  return v_per - v_park;
}

/** Solve Kepler's equation E - e sin E = M (radians) by Newton iteration. */
export function solveKepler(M: number, e: number): number {
  let E = M;
  for (let i = 0; i < 32; i++) {
    const f  = E - e * Math.sin(E) - M;
    const fp = 1 - e * Math.cos(E);
    const dE = f / fp;
    E -= dE;
    if (Math.abs(dE) < 1e-10) break;
  }
  return E;
}

/** Position (km) on a 2D Keplerian ellipse for a given mean anomaly M. */
export function ellipsePos(aKm: number, e: number, M: number): [number, number] {
  const E = solveKepler(M, e);
  const x = aKm * (Math.cos(E) - e);
  const y = aKm * Math.sqrt(1 - e * e) * Math.sin(E);
  return [x, y];
}

/** Sample an orbit's geometric ring (no time information) for drawing. */
export function orbitRing(aKm: number, e: number, n = 256): [number, number][] {
  const out: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const M = (i / n) * Math.PI * 2;
    out.push(ellipsePos(aKm, e, M));
  }
  return out;
}
