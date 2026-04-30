export type Subsystem = {
  id: string;
  name: string;
  massKg: number;
  powerW: number;
  trl: number;
  description: string;
  notes: string[];
};

export const subsystems: Subsystem[] = [
  {
    id: "structure",
    name: "Primary structure & MMOD shielding",
    massKg: 820, powerW: 0, trl: 8,
    description: "Aluminum-lithium honeycomb truss with deployable Whipple shielding around prop tanks and capture mechanism.",
    notes: ["3 hard-points for pod cradle", "Rad-9 micrometeoroid spec", "5 yr LEO lifetime margin"],
  },
  {
    id: "prop-main",
    name: "Main propulsion (LOX/CH₄ bipropellant)",
    massKg: 540, powerW: 220, trl: 6,
    description: "Single throttleable cryogenic main engine, 25 kN class, vacuum Isp 360 s.",
    notes: ["Pump-fed, 60 % throttle range", "Restartable up to 50 cycles", "Cryo settling via aux RCS"],
  },
  {
    id: "rcs",
    name: "Reaction control (16× RCS thrusters)",
    massKg: 90, powerW: 60, trl: 9,
    description: "Hypergolic MMH/NTO 22 N pods for fine attitude + sub-m/s closing burns at capture.",
    notes: ["Cross-string redundancy", "Min impulse bit < 5 mN·s", "Common feed lines, two banks"],
  },
  {
    id: "tanks",
    name: "Cryogenic tanks + insulation",
    massKg: 380, powerW: 50, trl: 7,
    description: "Composite-overwrap cryo tanks with multilayer insulation and ZBO subcooler. Boil-off held < 0.1 %/day.",
    notes: ["LOX 7,200 kg", "CH₄ 1,800 kg", "ZBO active cryo cooler 50 W"],
  },
  {
    id: "capture",
    name: "Capture mechanism (compliant net + clamps)",
    massKg: 310, powerW: 80, trl: 3,
    description: "Articulated truss-deployed compliant net with motorized clamp transfer to hard-point cradle.",
    notes: ["±0.4 m positional tolerance", "0.8 m/s max closing at contact", "TRL gating risk — see risks register"],
  },
  {
    id: "gnc",
    name: "GNC (avionics + sensors)",
    massKg: 140, powerW: 220, trl: 8,
    description: "Triple-redundant flight computers, dual star trackers, IMU stack, lidar + RGB stereo for terminal capture.",
    notes: ["Sub-arcsec attitude knowledge", "Onboard relative-orbit Kalman filter", "TRL gated by lidar at capture range"],
  },
  {
    id: "comms",
    name: "Communications (S+Ka)",
    massKg: 75, powerW: 140, trl: 9,
    description: "S-band omnis for safe-mode plus Ka-band steerable for high-rate telemetry on TLI.",
    notes: ["TT&C link budget closes at lunar SOI", "Cross-link to Manna pods during catch"],
  },
  {
    id: "power",
    name: "EPS (solar + Li-ion)",
    massKg: 230, powerW: 0, trl: 9,
    description: "Two deployable solar wings (5.6 m²), 28 V bus, 1.2 kWh Li-ion buffer for eclipse + peak-burn comms.",
    notes: ["End-of-life array power 1.7 kW", "Sun-pointed during cruise"],
  },
  {
    id: "tcs",
    name: "Thermal control (active + passive)",
    massKg: 110, powerW: 90, trl: 9,
    description: "Loop-heat-pipe radiators for avionics; MLI plus VCHPs for cryo tank zone; survival heaters on hypergols.",
    notes: ["−40 °C → +60 °C control", "Single-string survival heaters always live"],
  },
];

export const drySumKg   = subsystems.reduce((a, s) => a + s.massKg, 0);
export const peakPowerW = subsystems.reduce((a, s) => a + s.powerW, 0);
