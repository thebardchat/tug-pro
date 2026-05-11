# tug-pro

Pre-Phase A concept brief for **TUG** — a reusable orbital tug that catches rail-launched ballistic payloads at apogee and ferries them to lunar transfer.

A successor to [`thebardchat/tug`](https://github.com/thebardchat/tug). Same concept, much-deeper site:

- **3D orbit visualizer** — Three.js scene showing rail → apogee → catch → TLI → lunar SOI → return. Scrubbable timeline with real period ratios.
- **Live ΔV calculator** — Tsiolkovsky over a stacked phase budget. Tune payload, apogee, Isp, dry mass, margin; watch propellant move.
- **Mass + power budget** — toggleable per-subsystem bars sorted by share.
- **Subsystem dossier** — expandable cards with TRL, mass, power, watch-items.
- **Risks matrix** — interactive 5×5 likelihood × consequence with mitigations.
- **Field comparison** — TUG alongside MEV-1, MEP, ACES/Centaur V, Starship-as-tug.

## Stack

- [Astro](https://astro.build) (static + islands)
- [Svelte](https://svelte.dev) for interactive islands
- [Three.js](https://threejs.org) for the orbit scene
- TypeScript strict, no build framework runtime overhead beyond what each island ships

## Run

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static output to ./dist
npm run preview  # serve ./dist
```

## Layout

```
src/
  layouts/   Layout.astro            — shell + fonts + meta
  components/ Header / Hero / StatusStrip / ConOpsTimeline /
              SubsystemDossier / CompareTable
  islands/   OrbitVisualizer.svelte  — Three.js scene (client:only)
              DeltaVCalculator.svelte
              MassPowerBudget.svelte
              RisksMatrix.svelte
  data/      mission / subsystems / risks / compare
  lib/       rocket-eq / orbit  — math helpers
  styles/    tokens / global
```

## Mission baseline

Single source of truth in `src/data/mission.ts`. Tweaking the canonical values
propagates through the dossier, the calculator's "vs preset" delta, and the
displayed totals.

## License

The original `tug` repo's terms apply; nothing in here is a flight-qualified design.

---

<div align="center">

[![Pulsar Sentinel — Quantum Security](https://raw.githubusercontent.com/thebardchat/pulsar_sentinel/main/quantum-banner.gif)](https://sentinel.shanebrain.cloud)

### ⚡ Pulsar Sentinel — Quantum Security for the Rest of Us

[![LIVE](https://img.shields.io/badge/LIVE-sentinel.shanebrain.cloud-00f0ff?style=for-the-badge)](https://sentinel.shanebrain.cloud)
[![PQC](https://img.shields.io/badge/ML--KEM--768-Post--Quantum-ff00ff?style=for-the-badge)](https://sentinel.shanebrain.cloud)
[![From $10.99/mo](https://img.shields.io/badge/From-$10.99%2Fmo-ffd700?style=for-the-badge)](https://sentinel.shanebrain.cloud/#pricing)

**800 million Windows computers just lost security updates.**
Pulsar Sentinel wraps them in ML-KEM post-quantum encryption, immutable blockchain audit trails, and automatic digital inheritance — no lawyers, no cloud dependency, no corporate kill switch.

**[→ Get Protected at sentinel.shanebrain.cloud](https://sentinel.shanebrain.cloud)**

*Built by Shane Brazelton + Claude (Anthropic) · Hazel Green, Alabama*

[![Built with Claude](https://img.shields.io/badge/Built%20with-Claude%20by%20Anthropic-orange?style=flat)](https://claude.ai/referral/4fAMYN9Ing)

</div>

---
