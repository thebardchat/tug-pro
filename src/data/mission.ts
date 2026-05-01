// Single source of truth for mission parameters used across the site.
//
// Architecture: SUB-ORBITAL CATCH at apogee + refueled Tug
// ─────────────────────────────────────────────────────────────────────
// Reconciled 2026-04-30 to BGKPJR canonical baseline (VacuumGate v1.0).
// Architecture validated by trajectory_closure.py simulation 2026-04-30.
// SoT reference:  BGKPJR-Core-Simulations/simulation/src/bgkpjr_dimensions.py
// Audit:          BGKPJR-Core-Simulations/expert-reviews/PRE-LUKENS-AUDIT-2026-04-30.md
// Closure proof:  BGKPJR-Core-Simulations/data/trajectory-closure/FINDING-2026-04-30.md
//
// Architectural history (full transparency):
//
//   v1 (2025): Pod ballistic, Tug catches at ~150 km apogee, Tug provides
//              full circularization + TLI. Worked for original 28.7 km rail
//              parameters.
//
//   v2 (2026-04-30 morning): "Reconciled" to LEO catch — pod self-circularizes
//              to 400 km circular LEO, Tug only does TLI. THIS DID NOT CLOSE.
//              Trajectory simulation showed pod cannot reach LEO in any patent-
//              envelope configuration (max apogee 344 km even at 4500 kg
//              propellant on a 4200 kg pod, physically impossible).
//
//   v3 (2026-04-30 evening, current): Reverted to sub-orbital catch. Pod boosts
//              to ~166 km apogee at canonical Mach 5 / 45° rail / 900 kg pod
//              propellant. Tug catches at apogee and provides circularization
//              + TLI. Tug Δv budget grows substantially (11.5 km/s total
//              outbound) — requires Manna-F propellant pod refueling in LEO
//              before TLI burn. This is the architecture the trajectory
//              simulation closes on.
//
// ─────────────────────────────────────────────────────────────────────

export const mission = {
  podMass: 4_200,             // kg, Manna-H gross mass (canonical)
  apogeeKm: 166,              // km, target sub-orbital apogee (validated by sim)
  apogeeVelocityMs: 1_700,    // m/s, approximate horizontal velocity at apogee
  inclinationDeg: 34.93,      // rail site latitude (Hazel Green, AL)
  railInclinationDeg: 45,     // rail launch angle (max patent envelope, validated by sim)

  tugDryKg: 5_000,            // kg, tug dry mass (canonical SPACE_TUG)
  tugPropMaxKg: 25_000,       // kg, max prop per refuel (canonical)
  ispVacS: 360,               // s, Isp of bipropellant main engine (vacuum)
  reuseTarget: 50,            // tug reuse cycles

  // Tug Δv budget for sub-orbital catch architecture
  catchAndCircularizeDvKmS: 6.13,  // km/s, catch at apogee + circularize to LEO
  cislunarDvKmS: 3.15,             // km/s, TLI from LEO
  returnToLeoDvKmS: 2.20,          // km/s, lunar capture + return
  catchClosingMs: 0.8,             // m/s, sub-m/s closing burn at apogee
  podApogeeWindowMin: 5,           // minutes, geometric rendezvous window
  refuelingRequired: true,         // single-tank Tug cannot do full mission;
                                   // refuels in LEO from Manna-F pods between
                                   // catch+circularize and TLI burns
};

export type DvLine = {
  phase: string;
  km_s: number;
  notes: string;
};

export const dvBudget: DvLine[] = [
  { phase: "Phasing trim",        km_s: 0.10, notes: "Match RAAN / argument-of-perigee for sub-orbital catch geometry." },
  { phase: "Apogee rendezvous",   km_s: 0.05, notes: "Sub-m/s closing burn at pod apogee (~166 km, validated by sim)." },
  { phase: "Catch + circularize", km_s: 6.13, notes: "Catch sub-orbital pod and lift it to circular LEO. Largest single burn." },
  { phase: "Refuel in LEO",       km_s: 0.00, notes: "Refuel from Manna-F propellant pod. No Δv expended. Required for closure." },
  { phase: "TLI burn",            km_s: 3.15, notes: "C3 ≈ -2 km²/s² departure from 400 km circular LEO." },
  { phase: "Mid-course corr.",    km_s: 0.05, notes: "Two MCCs en route to lunar SOI." },
  { phase: "Pod release",         km_s: 0.02, notes: "Spring deploy + retro pulse for Tug separation in lunar orbit." },
  { phase: "Return to LEO",       km_s: 2.20, notes: "Lunar capture + return-to-Earth burn (or refuel in lunar orbit — long-term ISRU)." },
  { phase: "Plane / phase clean", km_s: 0.40, notes: "Catch-up to next pod window." },
  { phase: "Margin (15 %)",       km_s: 1.81, notes: "Reserve for off-nominal capture and contingency." },
];

export const totalDv = dvBudget.reduce((a, b) => a + b.km_s, 0);
