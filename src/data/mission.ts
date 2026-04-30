// Single source of truth for mission parameters used across the site.
//
// Reconciled 2026-04-30 to BGKPJR canonical baseline (VacuumGate v1.0).
// SoT reference: BGKPJR-Core-Simulations/simulation/src/bgkpjr_dimensions.py
// Audit: BGKPJR-Core-Simulations/expert-reviews/PRE-LUKENS-AUDIT-2026-04-30.md
//
// Architectural change from prior baseline:
//   OLD: ballistic pod from 28.7 km rail, tug catches at 150 km apogee
//   NEW: pod exits 37 km rail at Mach 5 (1,700 m/s), pod 2nd-stage rocket
//        boosts to circular LEO, tug catches in LEO and performs TLI burn.
//        Suborbital ballistic catch is geometrically infeasible at Mach 5
//        exit (apogee from rail would be < 100 km — below where a tug can
//        sustain orbit).

export const mission = {
  podMass: 4_200,            // kg, Manna-H gross mass (canonical, was 5,000)
  leoOrbitKm: 400,           // km, circular LEO catch altitude (was 150 km apogee)
  inclinationDeg: 34.93,     // rail site latitude (Hazel Green, AL)
  tugDryKg: 5_000,           // kg, tug dry mass (was 4,200; aligned with canonical SPACE_TUG)
  tugPropMaxKg: 25_000,      // kg, max prop loadout (was 12,000; aligned with canonical)
  ispVacS: 360,              // s, Isp of bipropellant main engine (vacuum)
  reuseTarget: 50,           // tug reuse cycles (lifetime, aligned with canonical)
  cislunarDvKmS: 4.10,       // km/s, TLI from circular LEO (was 3.15 from 150 km apogee)
  catchClosingMs: 0.8,       // m/s, design closing rate at LEO rendezvous
  podLeoWindowMin: 5,        // minutes, geometric rendezvous window
  podSecondStageDvMs: 5_970, // m/s, pod onboard rocket Δv (1700 + 5970 = 7670 = LEO circ)
};

export type DvLine = {
  phase: string;
  km_s: number;
  notes: string;
};

export const dvBudget: DvLine[] = [
  { phase: "Phasing trim",       km_s: 0.10, notes: "Match RAAN / argument-of-perigee for LEO catch geometry." },
  { phase: "LEO rendezvous",     km_s: 0.05, notes: "Sub-m/s closing burn for pod capture in 400 km circular orbit." },
  { phase: "TLI burn",           km_s: 4.10, notes: "C3 ≈ -2 km²/s² departure from 400 km circular LEO (canonical)." },
  { phase: "Mid-course corr.",   km_s: 0.05, notes: "Two MCCs en route to lunar SOI." },
  { phase: "Pod release",        km_s: 0.02, notes: "Spring deploy + retro pulse for Tug separation in lunar orbit." },
  { phase: "Return to LEO",      km_s: 2.20, notes: "Lunar capture + return-to-Earth burn (or refuel in lunar orbit instead — Manna-F)." },
  { phase: "Plane / phase clean", km_s: 0.40, notes: "Catch-up to next pod window." },
  { phase: "Margin (15 %)",       km_s: 1.05, notes: "Reserve for off-nominal capture and contingency." },
];

export const totalDv = dvBudget.reduce((a, b) => a + b.km_s, 0);
