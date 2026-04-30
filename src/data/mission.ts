// Single source of truth for mission parameters used across the site.

export const mission = {
  podMass: 5_000,            // kg, single Manna pod payload
  apogeeKm: 150,             // km, target ballistic apogee from rail
  inclinationDeg: 34.93,     // rail site latitude (BGKPJR)
  tugDryKg: 4_200,           // kg, tug structural + subsystems dry mass
  tugPropMaxKg: 12_000,      // kg, max prop loadout
  ispVacS: 360,              // s, Isp of bipropellant main engine (vacuum)
  reuseTarget: 10,           // tug reuse cycles (lifetime)
  cislunarDvKmS: 3.15,       // km/s, TLI from ~150 km circular eq.
  catchClosingMs: 0.8,       // m/s, design closing rate at apogee rendezvous
  podApogeeWindowMin: 5,     // minutes, geometric rendezvous window at apogee
};

export type DvLine = {
  phase: string;
  km_s: number;
  notes: string;
};

export const dvBudget: DvLine[] = [
  { phase: "Phasing trim",       km_s: 0.10, notes: "Match RAAN/argument-of-perigee for catch geometry." },
  { phase: "Apogee rendezvous",  km_s: 0.05, notes: "Sub-m/s closing burn at pod apogee." },
  { phase: "TLI burn",           km_s: 3.15, notes: "C3 ≈ -2 km²/s² departure from ~150 km equatorial." },
  { phase: "Mid-course corr.",   km_s: 0.05, notes: "Two MCCs en route to lunar SOI." },
  { phase: "Pod release",        km_s: 0.02, notes: "Spring deploy + retro pulse for Tug separation." },
  { phase: "Return to phasing",  km_s: 1.85, notes: "Lunar gravity assist or direct return — assume direct upper-bound." },
  { phase: "Plane / phase clean", km_s: 0.40, notes: "Catch-up to next pod window." },
  { phase: "Margin (15 %)",       km_s: 0.85, notes: "Reserve for off-nominal capture and contingency." },
];

export const totalDv = dvBudget.reduce((a, b) => a + b.km_s, 0);
