<script lang="ts">
  import { stackedPropKg, propMassFor, massFraction } from "../lib/rocket-eq";
  import { tliDv } from "../lib/orbit";
  import { dvBudget } from "../data/mission";

  // User-tunable inputs
  let payloadKg = 5_000;
  let apogeeKm = 150;
  let ispSec = 360;
  let dryKg = 4_200;
  let marginPct = 15;

  // Derived: phase ΔV km/s
  $: phases = [
    { phase: "Phasing trim",       km_s: 0.10 },
    { phase: "Apogee rendezvous",  km_s: 0.05 },
    { phase: "TLI burn",           km_s: +tliDv(apogeeKm).toFixed(2) },
    { phase: "Mid-course corr.",   km_s: 0.05 },
    { phase: "Pod release",        km_s: 0.02 },
    { phase: "Return to phasing",  km_s: 1.85 },
    { phase: "Plane / phase clean", km_s: 0.40 },
  ];

  $: subtotal = phases.reduce((a, p) => a + p.km_s, 0);
  $: marginDv = +(subtotal * marginPct / 100).toFixed(2);
  $: totalDv  = +(subtotal + marginDv).toFixed(2);
  $: totalDvMs = totalDv * 1000;

  // Effective dry mass = tug dry + payload (carried during outbound legs)
  $: effDry = dryKg + payloadKg;

  // Stacked propellant for ALL phases (carry full prop through earlier burns)
  $: propKg = Math.round(stackedPropKg(effDry, [...phases.map(p => p.km_s), marginDv], ispSec));
  $: mfrac  = massFraction(propKg, effDry);
  $: gtow   = effDry + propKg;

  // Sensitivity bar comparison vs the canonical mission preset
  $: presetTotal = dvBudget.reduce((a, b) => a + b.km_s, 0);
  $: deltaVsPreset = +(totalDv - presetTotal).toFixed(2);
</script>

<div class="dv-calc">
  <div class="inputs">
    <label>
      <span class="ilabel">Payload mass <span class="unit">kg</span></span>
      <input type="number" min="500" max="20000" step="100" bind:value={payloadKg} />
      <input type="range"  min="500" max="20000" step="100" bind:value={payloadKg} />
    </label>

    <label>
      <span class="ilabel">Pod apogee <span class="unit">km</span></span>
      <input type="number" min="100" max="800" step="10" bind:value={apogeeKm} />
      <input type="range"  min="100" max="800" step="10" bind:value={apogeeKm} />
    </label>

    <label>
      <span class="ilabel">Engine I<sub>sp</sub> <span class="unit">s</span></span>
      <input type="number" min="280" max="450" step="5" bind:value={ispSec} />
      <input type="range"  min="280" max="450" step="5" bind:value={ispSec} />
    </label>

    <label>
      <span class="ilabel">Tug dry mass <span class="unit">kg</span></span>
      <input type="number" min="2000" max="8000" step="100" bind:value={dryKg} />
      <input type="range"  min="2000" max="8000" step="100" bind:value={dryKg} />
    </label>

    <label>
      <span class="ilabel">Margin <span class="unit">%</span></span>
      <input type="number" min="0" max="40" step="1" bind:value={marginPct} />
      <input type="range"  min="0" max="40" step="1" bind:value={marginPct} />
    </label>
  </div>

  <div class="output">
    <div class="kpis">
      <div class="kpi">
        <span class="k-label">Total ΔV</span>
        <span class="k-num">{totalDv.toFixed(2)} <span class="k-unit">km/s</span></span>
      </div>
      <div class="kpi">
        <span class="k-label">Propellant</span>
        <span class="k-num">{propKg.toLocaleString()} <span class="k-unit">kg</span></span>
      </div>
      <div class="kpi">
        <span class="k-label">GTOW</span>
        <span class="k-num">{gtow.toLocaleString()} <span class="k-unit">kg</span></span>
      </div>
      <div class="kpi">
        <span class="k-label">Mass fraction</span>
        <span class="k-num">{(mfrac*100).toFixed(1)}<span class="k-unit">%</span></span>
      </div>
    </div>

    <table class="phase-table">
      <thead>
        <tr><th>Phase</th><th>ΔV (km/s)</th><th class="bar-col">Share</th></tr>
      </thead>
      <tbody>
        {#each phases as p}
          {@const share = (p.km_s / totalDv) * 100}
          <tr>
            <td>{p.phase}</td>
            <td class="mono">{p.km_s.toFixed(2)}</td>
            <td class="bar-col">
              <span class="bar"><span class="bar-fill" style={`width:${share}%`}></span></span>
              <span class="pct mono">{share.toFixed(1)}%</span>
            </td>
          </tr>
        {/each}
        <tr class="margin-row">
          <td>Margin {marginPct}%</td>
          <td class="mono">{marginDv.toFixed(2)}</td>
          <td class="bar-col">
            <span class="bar"><span class="bar-fill margin" style={`width:${(marginDv/totalDv)*100}%`}></span></span>
            <span class="pct mono">{((marginDv/totalDv)*100).toFixed(1)}%</span>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="vs-preset">
      vs canonical mission preset:
      <span class={deltaVsPreset > 0 ? "delta-up" : deltaVsPreset < 0 ? "delta-down" : "delta-zero"}>
        {deltaVsPreset > 0 ? "+" : ""}{deltaVsPreset.toFixed(2)} km/s
      </span>
    </div>
  </div>
</div>

<style>
.dv-calc {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 32px;
  margin-top: 32px;
  align-items: start;
}
@media (max-width: 900px) { .dv-calc { grid-template-columns: 1fr; } }

.inputs {
  display: grid; gap: 20px;
  background: var(--c-bg-1);
  border: 1px solid var(--c-line);
  border-radius: var(--r-lg);
  padding: 22px;
}
label { display: grid; gap: 6px; }
.ilabel {
  font-family: var(--f-mono); font-size: 11px;
  color: var(--c-fg-dim); letter-spacing: 0.12em; text-transform: uppercase;
  display: flex; justify-content: space-between;
}
.unit { color: var(--c-accent); }
input[type=number] {
  background: var(--c-bg);
  border: 1px solid var(--c-line-hi);
  color: var(--c-fg);
  padding: 8px 10px;
  border-radius: 6px;
  font-family: var(--f-mono); font-size: var(--fs-sm);
  width: 100%;
}
input[type=number]:focus { outline: 2px solid var(--c-accent); border-color: var(--c-accent); }
input[type=range] { accent-color: var(--c-accent); width: 100%; }

.output { display: flex; flex-direction: column; gap: 24px; }

.kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 14px; }
.kpi {
  background: var(--c-card);
  border: 1px solid var(--c-line);
  border-left: 3px solid var(--c-accent);
  padding: 14px 16px;
  border-radius: var(--r-md);
  display: flex; flex-direction: column; gap: 4px;
}
.k-label { font-family: var(--f-mono); font-size: 11px; color: var(--c-fg-dim); letter-spacing: 0.12em; text-transform: uppercase; }
.k-num   { font-family: var(--f-display); font-size: 28px; color: var(--c-fg); font-weight: 600; line-height: 1; }
.k-unit  { font-family: var(--f-mono); font-size: 12px; color: var(--c-fg-dim); }

.phase-table {
  width: 100%; border-collapse: collapse; font-size: var(--fs-sm);
}
.phase-table th, .phase-table td {
  text-align: left; padding: 10px 12px;
  border-bottom: 1px solid var(--c-line);
}
.phase-table th {
  font-family: var(--f-mono); font-size: 11px; color: var(--c-fg-dim);
  letter-spacing: 0.14em; text-transform: uppercase;
  border-bottom-color: var(--c-line-hi);
}
.bar-col { width: 50%; }
.bar {
  display: inline-block;
  width: calc(100% - 60px);
  height: 6px;
  background: var(--c-line);
  border-radius: 3px;
  overflow: hidden;
  vertical-align: middle;
  margin-right: 8px;
}
.bar-fill { display: block; height: 100%; background: var(--c-accent); }
.bar-fill.margin { background: var(--c-accent-2); }
.pct { color: var(--c-fg-dim); font-size: 11px; }
.margin-row td { color: var(--c-accent-2); }
.vs-preset {
  font-family: var(--f-mono);
  font-size: 12px;
  color: var(--c-fg-dim);
  border-top: 1px solid var(--c-line);
  padding-top: 14px;
  letter-spacing: 0.06em;
}
.delta-up   { color: var(--c-warn); }
.delta-down { color: var(--c-accent); }
.delta-zero { color: var(--c-fg-2); }
</style>
