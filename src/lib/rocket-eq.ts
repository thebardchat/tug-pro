// Tsiolkovsky and basic delta-v / propellant helpers.
//
// All units SI unless otherwise noted: km/s for ΔV display, m/s internally.

export const G0 = 9.80665; // m/s² standard gravity for Isp definition

/** ΔV (m/s) from Isp (s) and mass ratio m0/mf. */
export function dvFromMassRatio(ispSec: number, mr: number): number {
  return ispSec * G0 * Math.log(mr);
}

/** Mass ratio m0/mf required to achieve dv (m/s) at given Isp. */
export function massRatioForDv(ispSec: number, dvMs: number): number {
  return Math.exp(dvMs / (ispSec * G0));
}

/** Propellant mass (kg) needed to produce dv given dry mass and Isp. */
export function propMassFor(dryKg: number, dvKmS: number, ispSec: number): number {
  const mr = massRatioForDv(ispSec, dvKmS * 1000);
  return dryKg * (mr - 1);
}

/** Stack propellant for a sequence of phases (km/s each), returns total prop kg. */
export function stackedPropKg(dryKg: number, dvKmSPhases: number[], ispSec: number): number {
  // Walk back-to-front because earlier phases must lift fuel for later ones.
  let prop = 0;
  let mf = dryKg;
  for (let i = dvKmSPhases.length - 1; i >= 0; i--) {
    const mr = massRatioForDv(ispSec, dvKmSPhases[i] * 1000);
    const m0 = mf * mr;
    prop += m0 - mf;
    mf = m0;
  }
  return prop;
}

/** Mass fraction = prop / (prop + dry). */
export function massFraction(propKg: number, dryKg: number): number {
  return propKg / (propKg + dryKg);
}
