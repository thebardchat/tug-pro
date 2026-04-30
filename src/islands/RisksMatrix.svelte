<script lang="ts">
  import { risks, type Risk } from "../data/risks";

  let active: Risk | null = null;

  // Build grid: 5 cols (likelihood 1..5), 5 rows (consequence 5..1 top-down)
  const cols = [1, 2, 3, 4, 5];
  const rows = [5, 4, 3, 2, 1];

  function score(r: Risk): number { return r.likelihood * r.consequence; }
  function tier(s: number): "low" | "med" | "high" | "extreme" {
    if (s >= 16) return "extreme";
    if (s >= 9)  return "high";
    if (s >= 4)  return "med";
    return "low";
  }

  function cellRisks(c: number, r: number) {
    return risks.filter(x => x.likelihood === c && x.consequence === r);
  }
</script>

<div class="risks">
  <div class="matrix-wrap">
    <div class="matrix" role="grid" aria-label="Risk matrix">
      <div></div>
      {#each cols as c}
        <div class="axis-x">L = {c}</div>
      {/each}

      {#each rows as r}
        <div class="axis-y">C = {r}</div>
        {#each cols as c}
          {@const items = cellRisks(c, r)}
          {@const t = tier(c * r)}
          <div
            class="cell tier-{t}"
            class:has-items={items.length > 0}
            role="gridcell"
          >
            {#each items as it}
              <button
                class="risk-pill"
                class:active={active?.id === it.id}
                on:click={() => active = it}
                title={it.title}
              >
                {it.id}
              </button>
            {/each}
          </div>
        {/each}
      {/each}
    </div>
    <div class="axis-labels">
      <span class="x-label">Likelihood →</span>
      <span class="y-label">↑ Consequence</span>
    </div>
  </div>

  <aside class="detail" aria-live="polite">
    {#if active}
      <div class="detail-head">
        <span class="risk-id mono">{active.id}</span>
        <span class="risk-cat">{active.category}</span>
        <span class="risk-score mono">L{active.likelihood} × C{active.consequence} = {active.likelihood * active.consequence}</span>
      </div>
      <h4 class="risk-title">{active.title}</h4>
      <p class="risk-mit"><strong>Mitigation —</strong> {active.mitigation}</p>
    {:else}
      <div class="detail-empty">
        <span class="mono">Select a risk pill</span>
        <p>Click any cell pill to view title, score, and mitigation.</p>
      </div>
    {/if}
  </aside>
</div>

<style>
.risks {
  margin-top: 32px;
  display: grid;
  grid-template-columns: minmax(420px, 1.2fr) 1fr;
  gap: 32px;
  align-items: start;
}
@media (max-width: 980px) { .risks { grid-template-columns: 1fr; } }

.matrix-wrap { position: relative; }
.matrix {
  display: grid;
  grid-template-columns: 56px repeat(5, 1fr);
  gap: 6px;
  background: var(--c-bg-1);
  border: 1px solid var(--c-line);
  border-radius: var(--r-lg);
  padding: 18px;
}
.axis-x, .axis-y {
  font-family: var(--f-mono);
  font-size: 11px;
  color: var(--c-fg-dim);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 4px;
  text-align: center;
}
.axis-y { text-align: right; padding-right: 8px; align-self: center; }

.cell {
  min-height: 72px;
  border-radius: 6px;
  padding: 6px;
  display: flex; flex-wrap: wrap; gap: 4px; align-content: flex-start;
  transition: filter .2s var(--ease-out);
}
.cell:hover { filter: brightness(1.15); }
.cell.tier-low     { background: rgba(92,242,192,.06); }
.cell.tier-med     { background: rgba(255,184,77,.10); }
.cell.tier-high    { background: rgba(255,118,118,.12); }
.cell.tier-extreme { background: rgba(255,79,79,.22); border: 1px solid rgba(255,79,79,.5); }

.risk-pill {
  background: var(--c-bg);
  border: 1px solid var(--c-line-hi);
  color: var(--c-fg);
  font-family: var(--f-mono);
  font-size: 10px;
  letter-spacing: 0.1em;
  padding: 3px 8px;
  border-radius: 999px;
  cursor: pointer;
  transition: all .15s var(--ease-out);
}
.risk-pill:hover { border-color: var(--c-accent); color: var(--c-accent); }
.risk-pill.active {
  background: var(--c-accent); color: #04101a; border-color: var(--c-accent);
}

.axis-labels {
  display: flex; justify-content: space-between;
  margin-top: 10px; padding: 0 8px;
  font-family: var(--f-mono);
  font-size: 11px;
  color: var(--c-fg-dim);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.detail {
  background: var(--c-card);
  border: 1px solid var(--c-line);
  border-left: 3px solid var(--c-accent);
  border-radius: var(--r-lg);
  padding: 22px;
  min-height: 200px;
}
.detail-head {
  display: flex; gap: 14px; flex-wrap: wrap;
  font-family: var(--f-mono); font-size: 11px;
  color: var(--c-fg-dim); letter-spacing: 0.14em; text-transform: uppercase;
  margin-bottom: 12px;
}
.risk-id    { color: var(--c-accent); }
.risk-cat   {
  border: 1px solid var(--c-line-hi);
  padding: 1px 8px;
  border-radius: 999px;
  color: var(--c-fg-2);
}
.risk-score { color: var(--c-accent-2); }
.risk-title { font-size: var(--fs-md); margin: 0 0 12px; color: var(--c-fg); }
.risk-mit { color: var(--c-fg-2); margin: 0; line-height: 1.65; }
.risk-mit strong { color: var(--c-accent); font-weight: 600; }

.detail-empty {
  color: var(--c-fg-dim);
  display: flex; flex-direction: column; gap: 8px;
}
.detail-empty .mono {
  font-family: var(--f-mono); font-size: 11px;
  letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--c-fg-2);
}
.detail-empty p { margin: 0; color: var(--c-fg-dim); }
</style>
