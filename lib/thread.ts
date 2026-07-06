/**
 * The thread: one continuous hand-drawn ink line that travels the page.
 * Geometry = Catmull-Rom spline through anchor points, perturbed with the
 * same value-noise wobble as the hero linework, emitted as an SVG path.
 */

import type { Pt } from "./sketch";

const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};
const noise = (x: number, seed: number) => {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  const a = hash(i + seed * 57.31);
  const b = hash(i + 1 + seed * 57.31);
  return (a + (b - a) * u) * 2 - 1;
};

/* the shared margin x — every segment enters/exits here, which is what
   makes chained segments read as a single stroke */
export const threadX = (w: number) => Math.max(18, Math.min(56, w * 0.035));

/* global sketch→ink ramp: 0 = non-photo blue, 1 = iron-gall ink */
export function inkRamp(t: number): string {
  const a = [0x7f, 0xb4, 0xd6];
  const b = [0x1c, 0x1b, 0x18];
  const k = Math.min(1, Math.max(0, t));
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * k));
  return `rgb(${c[0]} ${c[1]} ${c[2]})`;
}

export function threadD(
  anchors: Pt[],
  seed: number,
  amp = 2.4,
  step = 15,
): string {
  if (anchors.length < 2) return "";
  const pts: Pt[] = [];
  for (let i = 0; i < anchors.length - 1; i++) {
    const p0 = anchors[Math.max(0, i - 1)];
    const p1 = anchors[i];
    const p2 = anchors[i + 1];
    const p3 = anchors[Math.min(anchors.length - 1, i + 2)];
    const n = Math.max(
      2,
      Math.round(Math.hypot(p2.x - p1.x, p2.y - p1.y) / step),
    );
    for (let j = 0; j < n; j++) {
      const t = j / n;
      const t2 = t * t;
      const t3 = t2 * t;
      pts.push({
        x:
          0.5 *
          (2 * p1.x +
            (-p0.x + p2.x) * t +
            (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
            (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
        y:
          0.5 *
          (2 * p1.y +
            (-p0.y + p2.y) * t +
            (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
            (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
      });
    }
  }
  pts.push(anchors[anchors.length - 1]);

  let d = "";
  let dist = 0;
  for (let i = 0; i < pts.length; i++) {
    if (i > 0) dist += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    const prev = pts[Math.max(0, i - 1)];
    const next = pts[Math.min(pts.length - 1, i + 1)];
    const dx = next.x - prev.x;
    const dy = next.y - prev.y;
    const len = Math.hypot(dx, dy) || 1;
    const off = noise(dist / 34, seed) * amp;
    const x = pts[i].x + (-dy / len) * off;
    const y = pts[i].y + (dx / len) * off;
    d += `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return d;
}
