// FX that sell weight (Ink Game study, 2026-10-28): DUST puffs where feet hit the ground, landings, things slam down.
//   const D = dust(scene, [{ t, p: [x, y, z], n: 6, size: .25, col: '#d9c9a8' }, ...]); fx.add(D.group); D.update(t)
// Soft sprites burst out low and sideways, grow, rise a little, fade in ~0.7 s. Pure function of t. Cheap (a few sprites).
import * as THREE from 'three';
let tex = null;
function puffTex() {
  if (tex) return tex; const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,.95)'); gr.addColorStop(.55, 'rgba(255,255,255,.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  return (tex = new THREE.CanvasTexture(c));
}
export function dust(events) {
  const group = new THREE.Group(), parts = [];
  events.forEach((e, ei) => { const n = e.n || 6;
    for (let i = 0; i < n; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffTex(), color: e.col || '#d8cdb8', transparent: true, depthWrite: false, opacity: 0 }));
      const a = (i / n) * Math.PI * 2 + ei * 1.3, sp = .6 + ((i * 37 + ei * 11) % 10) / 14;
      s.visible = false; group.add(s); parts.push({ s, e, dx: Math.cos(a) * sp, dz: Math.sin(a) * sp, up: .15 + (i % 3) * .08 }); } });
  return { group, update(t) { for (const q of parts) { const u = t - q.e.t, L = q.e.life || .7; q.s.visible = u > 0 && u < L; if (!q.s.visible) continue;
    const k = u / L, sz = (q.e.size || .22) * (.4 + 1.6 * Math.sqrt(k)), out = (q.e.spread || .35) * (1 - Math.pow(1 - k, 3));
    q.s.position.set(q.e.p[0] + q.dx * out, q.e.p[1] + .04 + q.up * k * (q.e.size || .22) * 2, q.e.p[2] + q.dz * out); q.s.scale.setScalar(sz); q.s.material.opacity = (q.e.alpha || .85) * (1 - k) * Math.min(1, k * 10); } } };
}
