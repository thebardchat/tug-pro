export type CompareRow = {
  vehicle: string;
  status: "operational" | "concept" | "in-dev" | "this";
  payloadKg: number | string;
  reuses: number | string;
  primaryRoute: string;
  capture: string;
  notes: string;
};

export const compare: CompareRow[] = [
  {
    vehicle: "MEV-1 (Northrop)",
    status: "operational",
    payloadKg: "—",
    reuses: 5,
    primaryRoute: "GEO life-extension",
    capture: "LAE / docking probe",
    notes: "Operational since 2020. Docks to satellites for station-keeping; not a cargo carrier.",
  },
  {
    vehicle: "Mission Extension Pod (MEP)",
    status: "in-dev",
    payloadKg: "—",
    reuses: "1+",
    primaryRoute: "GEO",
    capture: "Bolt-on jet pack",
    notes: "Smaller, single-host MEP successor.",
  },
  {
    vehicle: "ACES / Centaur V (cislunar tug)",
    status: "concept",
    payloadKg: "20,000–40,000",
    reuses: "3–5",
    primaryRoute: "LEO ↔ Lunar",
    capture: "Standard docking",
    notes: "Crew + cargo upper stage with refuelable LH₂/LOX.",
  },
  {
    vehicle: "Starship as tug",
    status: "in-dev",
    payloadKg: "100,000+",
    reuses: 100,
    primaryRoute: "LEO ↔ Anywhere",
    capture: "Pez deploy / TBD",
    notes: "Brute force — orbital refueling required for cislunar duty.",
  },
  {
    vehicle: "TUG (this concept)",
    status: "this",
    payloadKg: "5,000",
    reuses: 10,
    primaryRoute: "Apogee → Lunar",
    capture: "Compliant net + clamp",
    notes: "Catches rail-launched ballistic pods at apogee; no propellant on the pod.",
  },
];
