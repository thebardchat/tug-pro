export type Risk = {
  id: string;
  title: string;
  likelihood: 1 | 2 | 3 | 4 | 5;   // 1=rare → 5=expected
  consequence: 1 | 2 | 3 | 4 | 5;  // 1=neg → 5=loss of mission
  mitigation: string;
  category: "capture" | "thermal" | "ops" | "rendezvous" | "prop" | "supply";
};

export const risks: Risk[] = [
  {
    id: "R-01", title: "Capture closing-rate exceeds 0.8 m/s",
    likelihood: 3, consequence: 5,
    mitigation: "Compliant net absorbs ±2 m/s; pre-capture range/range-rate gate aborts above 1.5 m/s.",
    category: "capture",
  },
  {
    id: "R-02", title: "Pod attitude tumble at apogee",
    likelihood: 3, consequence: 4,
    mitigation: "Pod baselined with cold-gas detumble pulse on rail exit; Tug carries despin spider as last resort.",
    category: "capture",
  },
  {
    id: "R-03", title: "Cryo boil-off exceeds budget",
    likelihood: 2, consequence: 4,
    mitigation: "Active ZBO subcooler with redundant compressor; MLI with dual-temp shroud.",
    category: "thermal",
  },
  {
    id: "R-04", title: "Phasing miss → next pod window slips ≥ 6 h",
    likelihood: 4, consequence: 2,
    mitigation: "On-board relative-orbit Kalman filter; pad rail launch by 1.5 h around catch window.",
    category: "rendezvous",
  },
  {
    id: "R-05", title: "Main engine fails to restart for return burn",
    likelihood: 2, consequence: 5,
    mitigation: "Independent ignition string + dual igniters; RCS cluster sized for return-by-RCS contingency to safe disposal orbit.",
    category: "prop",
  },
  {
    id: "R-06", title: "Pod release retro pulse imparts off-axis force",
    likelihood: 3, consequence: 3,
    mitigation: "Spring-and-rail deploy aligned through Tug CG; trim with RCS within 5 s of release.",
    category: "ops",
  },
  {
    id: "R-07", title: "Rail launch cadence slips below 1/wk",
    likelihood: 3, consequence: 2,
    mitigation: "Tug economic case still closes at 1 catch / 2 wk, just slower payback. Catalog re-runs accepted.",
    category: "supply",
  },
  {
    id: "R-08", title: "MMOD strike on cryo tank during cruise",
    likelihood: 1, consequence: 5,
    mitigation: "Whipple shielding spec'd to 1 cm at 7 km/s; tank repressurization isolation valves on each feed.",
    category: "thermal",
  },
  {
    id: "R-09", title: "GNC lidar fails inside 1 km",
    likelihood: 2, consequence: 4,
    mitigation: "Stereo RGB cross-check with monocular ML pose estimator; abort to drift-by trajectory if both fail.",
    category: "rendezvous",
  },
];
