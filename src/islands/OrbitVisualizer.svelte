<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import * as THREE from "three";
  import {
    R_EARTH, R_MOON, D_EARTH_MOON,
    circularPeriod, ellipsePos, orbitRing
  } from "../lib/orbit";

  // Scene scale — 1 unit = 1000 km (so Earth ≈ 6.4 units).
  const S = 1 / 1000;

  // Mission timeline (seconds simulated).
  const T_PHASE_MAX = 7 * 24 * 3600;          // 7 days
  let t = 0;                                  // sim seconds
  let speed = 600;                            // 600× real time
  let playing = true;
  let phaseLabel = "Phasing orbit";

  let container: HTMLDivElement;
  let renderer: THREE.WebGLRenderer;
  let scene: THREE.Scene;
  let camera: THREE.PerspectiveCamera;
  let raf = 0;
  let last = 0;
  let resizeObs: ResizeObserver | null = null;

  // Visualization params (cartoonized for legibility — accurate ratios where it matters)
  const PHASING_ALT_KM    = 250;
  const PHASING_R_KM      = R_EARTH + PHASING_ALT_KM;
  const PHASING_PERIOD_S  = circularPeriod(PHASING_ALT_KM);

  const TLI_PERIGEE_KM    = R_EARTH + PHASING_ALT_KM;
  const TLI_APOGEE_KM     = D_EARTH_MOON;
  const TLI_A_KM          = (TLI_PERIGEE_KM + TLI_APOGEE_KM) / 2;
  const TLI_E             = (TLI_APOGEE_KM - TLI_PERIGEE_KM) / (TLI_APOGEE_KM + TLI_PERIGEE_KM);
  const TLI_PERIOD_S      = 2 * Math.PI * Math.sqrt((TLI_A_KM**3) / 398600.4418);
  const TLI_HALF_S        = TLI_PERIOD_S / 2;

  // Phase windows (sim seconds)
  const PHASE_PHASING_END  =  2 * 3600;       // first 2 h
  const PHASE_CATCH_END    =  PHASE_PHASING_END + 60 * 5;
  const PHASE_TLI_BURN_END = PHASE_CATCH_END + 60 * 8;
  const PHASE_CRUISE_END   = PHASE_TLI_BURN_END + TLI_HALF_S;
  const PHASE_RETURN_END   = PHASE_CRUISE_END + TLI_HALF_S;

  function tugPosition(simT: number): THREE.Vector3 {
    if (simT < PHASE_PHASING_END) {
      const theta = (simT / PHASING_PERIOD_S) * Math.PI * 2;
      return new THREE.Vector3(Math.cos(theta) * PHASING_R_KM, 0, Math.sin(theta) * PHASING_R_KM).multiplyScalar(S);
    } else if (simT < PHASE_CATCH_END) {
      // Hold near catch point above +X axis
      return new THREE.Vector3(PHASING_R_KM, 30, 0).multiplyScalar(S);
    } else if (simT < PHASE_TLI_BURN_END) {
      // Burn — tug stays near perigee, just visually highlights
      return new THREE.Vector3(PHASING_R_KM, 30, 0).multiplyScalar(S);
    } else if (simT < PHASE_CRUISE_END) {
      // Walk along TLI ellipse from perigee to apogee
      const u = (simT - PHASE_TLI_BURN_END) / TLI_HALF_S;       // 0..1
      const M = u * Math.PI;                                    // mean anomaly 0→π
      const [x, y] = ellipsePos(TLI_A_KM, TLI_E, M);
      // shift focus to +X
      return new THREE.Vector3(x + TLI_A_KM * TLI_E, 0, y).multiplyScalar(S);
    } else if (simT < PHASE_RETURN_END) {
      const u = (simT - PHASE_CRUISE_END) / TLI_HALF_S;
      const M = Math.PI + u * Math.PI;                           // π→2π
      const [x, y] = ellipsePos(TLI_A_KM, TLI_E, M);
      return new THREE.Vector3(x + TLI_A_KM * TLI_E, 0, y).multiplyScalar(S);
    }
    return new THREE.Vector3(PHASING_R_KM, 0, 0).multiplyScalar(S);
  }

  function podPosition(simT: number): THREE.Vector3 {
    // Pod ballistic arc from rail to apogee, then captured (frozen with tug).
    if (simT < PHASE_PHASING_END - 240) return new THREE.Vector3(R_EARTH * S, 0, 0);
    if (simT < PHASE_PHASING_END) {
      const u = (simT - (PHASE_PHASING_END - 240)) / 240; // 0..1 over 4 min
      // simple parabolic-ish lift
      const x = R_EARTH + 1500 * u;
      const y = 4 * (PHASING_ALT_KM) * u * (1 - u) + 30;
      return new THREE.Vector3(x, 0, -y).multiplyScalar(S);
    }
    // After catch — ride with the tug
    return tugPosition(simT);
  }

  function moonPosition(simT: number): THREE.Vector3 {
    // Slow rotation around Earth so the pod arrives "where the moon is"
    const moonPeriod = 27.3 * 86400;
    const theta = (simT / moonPeriod) * Math.PI * 2;
    return new THREE.Vector3(Math.cos(theta), 0, Math.sin(theta)).multiplyScalar(D_EARTH_MOON * S);
  }

  function labelFor(simT: number): string {
    if (simT < PHASE_PHASING_END - 240) return "Phasing — Tug + Earth-bound rail wait";
    if (simT < PHASE_PHASING_END)       return "Pod ascending — ballistic arc to apogee";
    if (simT < PHASE_CATCH_END)         return "Capture — compliant net at sub-m/s closing";
    if (simT < PHASE_TLI_BURN_END)      return "TLI burn — ~3.15 km/s posigrade at perigee";
    if (simT < PHASE_CRUISE_END)        return "Cruise — coast outbound to lunar SOI";
    if (simT < PHASE_RETURN_END)        return "Return — Tug coasts back to phasing orbit";
    return "Mission complete — re-arm cycle";
  }

  function init() {
    if (!container) return;
    const w = container.clientWidth;
    const h = container.clientHeight;

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050a14, 0.0006);

    camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 8000);
    camera.position.set(0, 200, 600);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    container.appendChild(renderer.domElement);

    // Stars
    const starGeo = new THREE.BufferGeometry();
    const starCount = 1500;
    const stars = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const r = 1500 + Math.random() * 1500;
      const phi = Math.random() * Math.PI * 2;
      const ct = Math.random() * 2 - 1;
      const st = Math.sqrt(1 - ct * ct);
      stars[i * 3]     = r * st * Math.cos(phi);
      stars[i * 3 + 1] = r * ct;
      stars[i * 3 + 2] = r * st * Math.sin(phi);
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(stars, 3));
    scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ size: 1.6, color: 0xa8b8cc })));

    // Earth
    const earthMat = new THREE.MeshStandardMaterial({
      color: 0x244a78,
      emissive: 0x0a1a30,
      roughness: 0.85,
      metalness: 0.05,
    });
    const earth = new THREE.Mesh(new THREE.SphereGeometry(R_EARTH * S, 64, 64), earthMat);
    earth.name = "earth";
    scene.add(earth);

    // Atmosphere glow (additive shell)
    const atm = new THREE.Mesh(
      new THREE.SphereGeometry(R_EARTH * S * 1.04, 64, 64),
      new THREE.MeshBasicMaterial({ color: 0x5cf2c0, transparent: true, opacity: 0.07, side: THREE.BackSide })
    );
    scene.add(atm);

    // Sun-like directional light
    scene.add(new THREE.AmbientLight(0x202833, 0.7));
    const sun = new THREE.DirectionalLight(0xfff2d8, 1.4);
    sun.position.set(800, 200, 400);
    scene.add(sun);

    // Phasing orbit ring
    const phasingPts = [];
    for (let i = 0; i <= 256; i++) {
      const a = (i / 256) * Math.PI * 2;
      phasingPts.push(new THREE.Vector3(Math.cos(a) * PHASING_R_KM * S, 0, Math.sin(a) * PHASING_R_KM * S));
    }
    const phasingGeo = new THREE.BufferGeometry().setFromPoints(phasingPts);
    scene.add(new THREE.LineLoop(phasingGeo, new THREE.LineBasicMaterial({ color: 0x5cf2c0, transparent: true, opacity: 0.5 })));

    // TLI ellipse — focus offset on +X
    const tliPts = [];
    const ring = orbitRing(TLI_A_KM, TLI_E, 256);
    for (const [x, y] of ring) tliPts.push(new THREE.Vector3((x + TLI_A_KM * TLI_E) * S, 0, y * S));
    const tliGeo = new THREE.BufferGeometry().setFromPoints(tliPts);
    scene.add(new THREE.LineLoop(tliGeo, new THREE.LineDashedMaterial({ color: 0xffb84d, dashSize: 8, gapSize: 6, transparent: true, opacity: 0.6 })));

    // Moon orbit ring
    const moonRing = [];
    for (let i = 0; i <= 256; i++) {
      const a = (i / 256) * Math.PI * 2;
      moonRing.push(new THREE.Vector3(Math.cos(a) * D_EARTH_MOON * S, 0, Math.sin(a) * D_EARTH_MOON * S));
    }
    scene.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(moonRing), new THREE.LineBasicMaterial({ color: 0x6e7f96, transparent: true, opacity: 0.3 })));

    // Moon
    const moon = new THREE.Mesh(new THREE.SphereGeometry(R_MOON * S, 32, 32),
      new THREE.MeshStandardMaterial({ color: 0xdcd6c8, roughness: 1, metalness: 0 }));
    moon.name = "moon";
    scene.add(moon);

    // Tug — small ship icon
    const tug = new THREE.Mesh(
      new THREE.IcosahedronGeometry(8, 0),
      new THREE.MeshStandardMaterial({ color: 0x5cf2c0, emissive: 0x0a4a3a, metalness: 0.3, roughness: 0.4 })
    );
    tug.name = "tug";
    scene.add(tug);

    // Pod — orange dot
    const pod = new THREE.Mesh(
      new THREE.SphereGeometry(4, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xffb84d, emissive: 0x331c00 })
    );
    pod.name = "pod";
    scene.add(pod);

    // Resize
    resizeObs = new ResizeObserver(() => {
      const W = container.clientWidth, H = container.clientHeight;
      camera.aspect = W / H; camera.updateProjectionMatrix();
      renderer.setSize(W, H);
    });
    resizeObs.observe(container);
  }

  function tick(now: number) {
    if (!last) last = now;
    const dt = Math.min(now - last, 100);
    last = now;
    if (playing) {
      t += (dt / 1000) * speed;
      if (t > T_PHASE_MAX) t = 0;
    }

    const tug  = scene.getObjectByName("tug")!;
    const pod  = scene.getObjectByName("pod")!;
    const moon = scene.getObjectByName("moon")!;
    const earth = scene.getObjectByName("earth")!;

    const tp = tugPosition(t);
    const pp = podPosition(t);
    const mp = moonPosition(t);
    tug.position.copy(tp);
    pod.position.copy(pp);
    moon.position.copy(mp);
    earth.rotation.y = (t / 86400) * Math.PI * 2 * 0.05;

    // Camera slow auto-rotation
    const camR = 700;
    const camTheta = t * 0.00001 + 0.4;
    camera.position.set(Math.cos(camTheta) * camR, 200, Math.sin(camTheta) * camR);
    camera.lookAt(0, 0, 0);

    phaseLabel = labelFor(t);
    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  }

  onMount(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Static fallback — render one frame at apogee
      init();
      t = PHASE_CRUISE_END - 60;
      tick(performance.now());
      cancelAnimationFrame(raf);
      return;
    }
    init();
    raf = requestAnimationFrame(tick);
  });

  onDestroy(() => {
    cancelAnimationFrame(raf);
    resizeObs?.disconnect();
    renderer?.dispose();
  });

  function fmtT(s: number): string {
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    return `${d}d ${h.toString().padStart(2,'0')}h ${m.toString().padStart(2,'0')}m`;
  }
</script>

<div class="orbit-frame">
  <div class="canvas-host" bind:this={container}></div>
  <div class="hud">
    <div class="hud-line">
      <span class="lbl">T+</span><span class="val mono">{fmtT(t)}</span>
    </div>
    <div class="hud-line">
      <span class="lbl">Phase</span><span class="val">{phaseLabel}</span>
    </div>
    <div class="controls">
      <button class="btn" on:click={() => (playing = !playing)}>{playing ? "Pause" : "Play"}</button>
      <input type="range" min="0" max={T_PHASE_MAX} step="60" bind:value={t} aria-label="Mission time scrub" />
      <select bind:value={speed}>
        <option value={60}>60×</option>
        <option value={600}>600×</option>
        <option value={3600}>3600×</option>
        <option value={14400}>14400×</option>
      </select>
    </div>
    <div class="legend">
      <span><i class="dot tug"></i> Tug</span>
      <span><i class="dot pod"></i> Pod</span>
      <span><i class="dash phasing"></i> Phasing orbit</span>
      <span><i class="dash tli"></i> TLI ellipse</span>
      <span><i class="dash moonring"></i> Lunar orbit</span>
    </div>
  </div>
</div>

<style>
.orbit-frame {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: radial-gradient(circle at 50% 50%, #061425, #020610 80%);
  border: 1px solid var(--c-line);
  border-radius: var(--r-lg);
  overflow: hidden;
  margin-top: 32px;
}
.canvas-host { position: absolute; inset: 0; }
.hud {
  position: absolute; left: 18px; right: 18px; bottom: 18px;
  display: flex; flex-direction: column; gap: 8px;
  background: rgba(5,10,20,.65);
  border: 1px solid var(--c-line);
  border-radius: var(--r-md);
  padding: 12px 14px;
  font-family: var(--f-mono); font-size: 12px;
  color: var(--c-fg-2);
  backdrop-filter: blur(6px);
}
.hud-line { display: flex; gap: 12px; align-items: baseline; }
.lbl { color: var(--c-fg-dim); text-transform: uppercase; letter-spacing: 0.12em; font-size: 10px; min-width: 50px; }
.val { color: var(--c-fg); }
.mono { font-family: var(--f-mono); }
.controls { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.controls input[type=range] {
  flex: 1; min-width: 160px;
  accent-color: var(--c-accent);
}
.controls select {
  background: var(--c-bg-1); color: var(--c-fg);
  border: 1px solid var(--c-line-hi); border-radius: 6px;
  padding: 4px 8px; font-family: var(--f-mono); font-size: 11px;
}
.legend { display: flex; gap: 14px; flex-wrap: wrap; font-size: 11px; color: var(--c-fg-dim); }
.legend i { display: inline-block; width: 14px; vertical-align: middle; margin-right: 4px; }
.legend i.dot     { width: 8px; height: 8px; border-radius: 50%; }
.legend i.tug     { background: var(--c-accent); }
.legend i.pod     { background: var(--c-accent-2); }
.legend i.dash    { height: 0; border-top: 2px dashed; }
.legend i.phasing { border-color: var(--c-accent); }
.legend i.tli     { border-color: var(--c-accent-2); }
.legend i.moonring{ border-color: var(--c-fg-dim); }
</style>
