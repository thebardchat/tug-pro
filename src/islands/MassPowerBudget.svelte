<script lang="ts">
  import { subsystems, drySumKg, peakPowerW } from "../data/subsystems";

  let metric: "mass" | "power" = "mass";

  $: rows = [...subsystems]
    .map(s => ({ name: s.name, value: metric === "mass" ? s.massKg : s.powerW, id: s.id }))
    .sort((a, b) => b.value - a.value);

  $: total = rows.reduce((a, r) => a + r.value, 0);
  $: maxV  = Math.max(...rows.map(r => r.value));
  $: unit  = metric === "mass" ? "kg" : "W";

  function fmt(n: number) { return n.toLocaleString(); }
</script>

<div class="budget">
  <div class="head">
    <div class="tabs">
      <button class:active={metric==="mass"}  on:click={() => metric = "mass"}>Mass</button>
      <button class:active={metric==="power"} on:click={() => metric = "power"}>Power</button>
    </div>
    <div class="totals">
      <span class="t-num">{fmt(total)}</span>
      <span class="t-unit">{unit}</span>
      <span class="t-meta">{rows.length} subsystems</span>
    </div>
  </div>

  <ul class="bars">
    {#each rows as r (r.id)}
      {@const w = (r.value / maxV) * 100}
      {@const share = (r.value / total) * 100}
      <li class="bar-row">
        <span class="name">{r.name}</span>
        <span class="bar-track">
          <span class="bar-fill" style={`width:${w}%`}></span>
        </span>
        <span class="value mono">{fmt(r.value)} {unit}</span>
        <span class="share mono">{share.toFixed(1)}%</span>
      </li>
    {/each}
  </ul>

  <p class="caption">
    Sorted by {metric}. Mass excludes propellant (LOX + CH₄ ≈ 9,000 kg @ baseline ΔV).
    Power is peak draw across nominal modes; cruise consumes ≈ 60% of peak.
  </p>
</div>

<style>
.budget {
  margin-top: 32px;
  background: var(--c-bg-1);
  border: 1px solid var(--c-line);
  border-radius: var(--r-lg);
  padding: 24px;
}
.head {
  display: flex; justify-content: space-between; align-items: flex-end;
  gap: 16px; flex-wrap: wrap;
  border-bottom: 1px solid var(--c-line);
  padding-bottom: 16px; margin-bottom: 18px;
}
.tabs { display: flex; gap: 6px; }
.tabs button {
  background: transparent;
  border: 1px solid var(--c-line-hi);
  color: var(--c-fg-2);
  padding: 6px 14px;
  border-radius: 999px;
  font-family: var(--f-mono);
  font-size: 12px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all .2s var(--ease-out);
}
.tabs button:hover { color: var(--c-fg); border-color: var(--c-accent); }
.tabs button.active {
  background: var(--c-accent);
  color: #04101a;
  border-color: var(--c-accent);
}

.totals { display: flex; align-items: baseline; gap: 8px; }
.t-num  { font-family: var(--f-display); font-size: 36px; color: var(--c-fg); font-weight: 600; }
.t-unit { font-family: var(--f-mono); color: var(--c-accent); }
.t-meta { font-family: var(--f-mono); font-size: 11px; color: var(--c-fg-dim); margin-left: 16px; letter-spacing: 0.12em; text-transform: uppercase; }

.bars { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
.bar-row {
  display: grid;
  grid-template-columns: 1.6fr 2.2fr 100px 60px;
  gap: 14px;
  align-items: center;
  padding: 8px 4px;
  border-radius: 6px;
  transition: background .15s var(--ease-out);
}
.bar-row:hover { background: rgba(92,242,192,.04); }
.name { color: var(--c-fg); font-size: var(--fs-sm); }
.bar-track {
  height: 8px;
  background: var(--c-line);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}
.bar-fill {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, var(--c-accent), #8cffd5);
  border-radius: 4px;
  transition: width .35s var(--ease-spring);
}
.value { color: var(--c-fg-2); text-align: right; font-size: 12px; }
.share { color: var(--c-fg-dim); text-align: right; font-size: 12px; }

.caption {
  color: var(--c-fg-dim);
  font-size: 12px;
  margin: 18px 0 0;
  font-family: var(--f-mono);
  line-height: 1.7;
}

@media (max-width: 700px) {
  .bar-row { grid-template-columns: 1fr; gap: 4px; }
  .value, .share { text-align: left; }
}
</style>
