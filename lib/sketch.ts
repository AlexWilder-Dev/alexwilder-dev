/**
 * Hand-drawn line engine for the hero canvas.
 * Strokes are pre-computed wobbled polylines with a timeline window [t0, t1];
 * render() replays any master progress t deterministically, so the sequence
 * is skippable and resumable at any point.
 */

export interface Pt {
  x: number;
  y: number;
}
export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type StrokeKind = "blue" | "ink";

export interface Stroke {
  pts: Pt[];
  kind: StrokeKind;
  width: number;
  alpha: number;
  taper: boolean;
  t0: number;
  t1: number;
}

export interface Label {
  x: number;
  y: number;
  text: string;
  size: number;
  align: CanvasTextAlign;
  t0: number;
  t1: number;
}

export interface Scene {
  strokes: Stroke[];
  labels: Label[];
  mono: string;
  mobile: boolean;
}

const BLUE = "#7FB4D6";
const INK = "#1C1B18";
const PENCIL_TEXT = "#4E7E9E";

/* deterministic pseudo-random + smooth 1D value noise */
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

export function wobbleLine(
  a: Pt,
  b: Pt,
  seed: number,
  amp = 1.3,
  overshoot = 0,
): Pt[] {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len0 = Math.hypot(dx, dy) || 1;
  const ux = dx / len0;
  const uy = dy / len0;
  const len = len0 + overshoot;
  const px = -uy;
  const py = ux;
  const steps = Math.max(3, Math.round(len / 12));
  const drift = (hash(seed * 3.7) - 0.5) * amp;
  const pts: Pt[] = [];
  for (let i = 0; i <= steps; i++) {
    const u = i / steps;
    const d = u * len;
    const env = Math.sin(Math.min(1, d / len0) * Math.PI) * 0.85 + 0.15;
    const off = noise(d / 26, seed) * amp * env + drift * u;
    pts.push({ x: a.x + ux * d + px * off, y: a.y + uy * d + py * off });
  }
  return pts;
}

/* four hand strokes with corner jitter + overshoot — lines miss, like a pencil does */
export function sketchRect(
  b: Box,
  seed: number,
  amp = 1.3,
  overshoot = 3,
): Pt[][] {
  const j = (n: number) => (hash(seed + n) - 0.5) * 3;
  const tl = { x: b.x + j(1), y: b.y + j(2) };
  const tr = { x: b.x + b.w + j(3), y: b.y + j(4) };
  const br = { x: b.x + b.w + j(5), y: b.y + b.h + j(6) };
  const bl = { x: b.x + j(7), y: b.y + b.h + j(8) };
  return [
    wobbleLine(tl, tr, seed + 11, amp, overshoot),
    wobbleLine(tr, br, seed + 22, amp, overshoot),
    wobbleLine(br, bl, seed + 33, amp, overshoot),
    wobbleLine(bl, tl, seed + 44, amp, overshoot),
  ];
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const pencilEase = (p: number) => 1 - Math.pow(1 - p, 3);
const inkEase = (p: number) =>
  p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;

/* blue underlay settles back once the ink takes over */
const blueFade = (t: number) => {
  if (t <= 0.72) return 1;
  const u = clamp01((t - 0.72) / 0.28);
  return 1 - 0.55 * (u * u * (3 - 2 * u));
};

function drawStroke(
  ctx: CanvasRenderingContext2D,
  s: Stroke,
  p: number,
  alphaMul: number,
) {
  const pts = s.pts;
  const total = pts.length - 1;
  if (total < 1) return;
  const f = p * total;
  const full = Math.floor(f);
  const frac = f - full;

  ctx.strokeStyle = s.kind === "blue" ? BLUE : INK;
  ctx.globalAlpha = s.alpha * alphaMul;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const tip = (i: number): Pt =>
    i < total && frac > 0 && i === full
      ? {
          x: pts[i].x + (pts[i + 1].x - pts[i].x) * frac,
          y: pts[i].y + (pts[i + 1].y - pts[i].y) * frac,
        }
      : pts[Math.min(i + 1, total)];

  if (!s.taper) {
    ctx.lineWidth = s.width;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 0; i < full; i++) ctx.lineTo(pts[i + 1].x, pts[i + 1].y);
    if (frac > 0 && full < total) {
      const q = tip(full);
      ctx.lineTo(q.x, q.y);
    }
    ctx.stroke();
    return;
  }

  /* pressure taper: stroke short segments with a width envelope */
  const end = frac > 0 ? full + 1 : full;
  for (let i = 0; i < end && i < total; i++) {
    const u = i / total;
    ctx.lineWidth = s.width * (0.5 + 0.85 * Math.sin(Math.PI * u));
    const q = i === full ? tip(i) : pts[i + 1];
    ctx.beginPath();
    ctx.moveTo(pts[i].x, pts[i].y);
    ctx.lineTo(q.x, q.y);
    ctx.stroke();
  }
}

export function renderScene(
  ctx: CanvasRenderingContext2D,
  scene: Scene,
  t: number,
  dpr: number,
  w: number,
  h: number,
) {
  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);

  const bf = blueFade(t);
  for (const s of scene.strokes) {
    const local = clamp01((t - s.t0) / (s.t1 - s.t0));
    if (local <= 0) continue;
    const eased = s.kind === "blue" ? pencilEase(local) : inkEase(local);
    drawStroke(ctx, s, eased, s.kind === "blue" ? bf : 1);
  }

  ctx.fillStyle = PENCIL_TEXT;
  for (const l of scene.labels) {
    const local = clamp01((t - l.t0) / (l.t1 - l.t0));
    if (local <= 0) continue;
    ctx.globalAlpha = Math.min(1, local * 3) * bf;
    ctx.font = `${l.size}px ${scene.mono}`;
    ctx.textAlign = l.align;
    ctx.textBaseline = "alphabetic";
    const chars = Math.ceil(local * l.text.length);
    ctx.fillText(l.text.slice(0, chars), l.x, l.y);
  }
  ctx.restore();
}

/* ------------------------------------------------------------------ */
/* scene composition                                                   */
/* ------------------------------------------------------------------ */

export interface HeroBoxes {
  word: Box;
  strap: Box;
  seal: Box;
  cta: Box | null;
}

export function buildScene(opts: {
  w: number;
  h: number;
  boxes: HeroBoxes;
  mono: string;
  mobile: boolean;
}): Scene {
  const { w, h, boxes, mono, mobile } = opts;
  const strokes: Stroke[] = [];
  const labels: Label[] = [];
  const m = Math.min(56, Math.max(20, Math.min(w, h) * 0.05));

  const S = (
    pts: Pt[],
    t0: number,
    t1: number,
    o?: Partial<Pick<Stroke, "kind" | "width" | "alpha" | "taper">>,
  ) =>
    strokes.push({
      pts,
      t0,
      t1,
      kind: o?.kind ?? "blue",
      width: o?.width ?? 1.2,
      alpha: o?.alpha ?? 0.9,
      taper: o?.taper ?? false,
    });

  const L = (
    x: number,
    y: number,
    text: string,
    t0: number,
    t1: number,
    align: CanvasTextAlign = "left",
    size = 11,
  ) => labels.push({ x, y, text, size, align, t0, t1 });

  /* sheet margin */
  sketchRect({ x: m, y: m, w: w - 2 * m, h: h - 2 * m }, 1, 1.6, 6).forEach(
    (pts, i) => S(pts, i * 0.025, i * 0.025 + 0.05),
  );

  /* crop marks */
  const cm = 14;
  const corners: Pt[] = [
    { x: m, y: m },
    { x: w - m, y: m },
    { x: w - m, y: h - m },
    { x: m, y: h - m },
  ];
  corners.forEach((c, i) => {
    const sx = c.x < w / 2 ? -1 : 1;
    const sy = c.y < h / 2 ? -1 : 1;
    const t0 = 0.03 + i * 0.012;
    S(
      wobbleLine(
        { x: c.x + sx * 4, y: c.y },
        { x: c.x + sx * (4 + cm), y: c.y },
        30 + i,
        0.8,
      ),
      t0,
      t0 + 0.03,
      { alpha: 0.75 },
    );
    S(
      wobbleLine(
        { x: c.x, y: c.y + sy * 4 },
        { x: c.x, y: c.y + sy * (4 + cm) },
        40 + i,
        0.8,
      ),
      t0 + 0.01,
      t0 + 0.04,
      { alpha: 0.75 },
    );
  });

  /* thirds guides, full bleed */
  const thirds: Array<[Pt, Pt]> = mobile
    ? [
        [
          { x: w / 2, y: 0 },
          { x: w / 2, y: h },
        ],
      ]
    : [
        [
          { x: w / 3, y: 0 },
          { x: w / 3, y: h },
        ],
        [
          { x: (2 * w) / 3, y: 0 },
          { x: (2 * w) / 3, y: h },
        ],
        [
          { x: 0, y: h / 3 },
          { x: w, y: h / 3 },
        ],
      ];
  thirds.forEach(([a, b], i) =>
    S(wobbleLine(a, b, 50 + i, 1.0), 0.05 + i * 0.02, 0.13 + i * 0.02, {
      alpha: 0.45,
    }),
  );

  /* header sits inside the margin on mobile — drop the note below it */
  L(
    m + 8,
    m + (mobile ? 38 : 20),
    mobile ? "sheet 01 — 360 ok" : "sheet 01 — alexwilder-dev",
    0.1,
    0.18,
  );

  /* top dimension run (desktop only — no room above the mobile header) */
  if (!mobile) {
    const dy = m * 0.55;
    S(wobbleLine({ x: m, y: dy }, { x: w - m, y: dy }, 60, 0.9), 0.28, 0.36, {
      alpha: 0.8,
    });
    [m, w - m].forEach((x, i) =>
      S(
        wobbleLine({ x, y: dy - 5 }, { x, y: dy + 5 }, 62 + i, 0.6),
        0.34 + i * 0.015,
        0.37 + i * 0.015,
        { alpha: 0.8 },
      ),
    );
    L(w / 2, dy - 5, "12-col grid — scale 1:1", 0.36, 0.46, "center");
  }

  /* the demo browser, sketched upper-right (desktop only) */
  if (!mobile) {
    const bx: Box = {
      x: w * 0.58,
      y: m + h * 0.08,
      w: w - m - w * 0.04 - w * 0.58,
      h: h * 0.42,
    };
    sketchRect(bx, 70, 1.4, 4).forEach((pts, i) =>
      S(pts, 0.12 + i * 0.02, 0.17 + i * 0.02),
    );
    /* chrome bar + dots */
    S(
      wobbleLine(
        { x: bx.x, y: bx.y + 26 },
        { x: bx.x + bx.w, y: bx.y + 26 },
        80,
        1.1,
        3,
      ),
      0.16,
      0.21,
    );
    for (let i = 0; i < 3; i++) {
      const x = bx.x + 12 + i * 12;
      S(
        wobbleLine({ x, y: bx.y + 11 }, { x: x + 5, y: bx.y + 15 }, 82 + i, 0.5),
        0.17 + i * 0.008,
        0.19 + i * 0.008,
      );
    }
    /* nav: logo box + link ticks */
    sketchRect({ x: bx.x + 14, y: bx.y + 40, w: 48, h: 14 }, 90, 1.0, 2).forEach(
      (pts, i) => S(pts, 0.2 + i * 0.01, 0.23 + i * 0.01),
    );
    for (let i = 0; i < 3; i++) {
      const x = bx.x + bx.w - 24 - i * 42;
      S(
        wobbleLine({ x, y: bx.y + 47 }, { x: x - 28, y: bx.y + 47 }, 95 + i, 0.7),
        0.22 + i * 0.01,
        0.25 + i * 0.01,
      );
    }
    L(bx.x + 70, bx.y + 51, "nav", 0.24, 0.3);
    /* hero image block with an X through it */
    const hb: Box = { x: bx.x + 14, y: bx.y + 66, w: bx.w - 28, h: bx.h * 0.42 };
    sketchRect(hb, 100, 1.3, 3).forEach((pts, i) =>
      S(pts, 0.26 + i * 0.015, 0.3 + i * 0.015),
    );
    S(
      wobbleLine({ x: hb.x, y: hb.y }, { x: hb.x + hb.w, y: hb.y + hb.h }, 110, 1.5),
      0.3,
      0.35,
      { alpha: 0.7 },
    );
    S(
      wobbleLine({ x: hb.x + hb.w, y: hb.y }, { x: hb.x, y: hb.y + hb.h }, 111, 1.5),
      0.31,
      0.36,
      { alpha: 0.7 },
    );
    L(hb.x + hb.w / 2, hb.y + hb.h / 2 + 4, "hero — the pitch", 0.3, 0.38, "center");
    /* copy rules + a button */
    const ty = hb.y + hb.h + 18;
    S(
      wobbleLine({ x: hb.x, y: ty }, { x: hb.x + hb.w * 0.82, y: ty }, 120, 0.9),
      0.32,
      0.36,
    );
    S(
      wobbleLine(
        { x: hb.x, y: ty + 14 },
        { x: hb.x + hb.w * 0.6, y: ty + 14 },
        121,
        0.9,
      ),
      0.34,
      0.38,
    );
    sketchRect({ x: hb.x, y: ty + 26, w: 92, h: 22 }, 125, 1.0, 2).forEach(
      (pts, i) => S(pts, 0.36 + i * 0.01, 0.39 + i * 0.01),
    );
    /* ink corner brackets — the demo gets approved */
    const bl = 22;
    (
      [
        [
          { x: bx.x - 4, y: bx.y + bl },
          { x: bx.x - 4, y: bx.y - 4 },
          { x: bx.x + bl, y: bx.y - 4 },
        ],
        [
          { x: bx.x + bx.w + 4, y: bx.y + bx.h - bl },
          { x: bx.x + bx.w + 4, y: bx.y + bx.h + 4 },
          { x: bx.x + bx.w - bl, y: bx.y + bx.h + 4 },
        ],
      ] as Pt[][]
    ).forEach((tri, i) => {
      S(wobbleLine(tri[0], tri[1], 130 + i, 0.9), 0.62 + i * 0.03, 0.67 + i * 0.03, {
        kind: "ink",
        width: 2.6,
        taper: true,
        alpha: 1,
      });
      S(wobbleLine(tri[1], tri[2], 140 + i, 0.9), 0.65 + i * 0.03, 0.7 + i * 0.03, {
        kind: "ink",
        width: 2.6,
        taper: true,
        alpha: 1,
      });
    });
  }

  /* guides measured off the real type — the sketch frames the ink */
  const wb = boxes.word;
  S(
    wobbleLine(
      { x: Math.max(8, wb.x - w * 0.06), y: wb.y },
      { x: Math.min(w - 8, wb.x + wb.w + w * 0.12), y: wb.y },
      150,
      1.1,
    ),
    0.18,
    0.26,
    { alpha: 0.8 },
  );
  S(
    wobbleLine(
      { x: Math.max(8, wb.x - w * 0.06), y: wb.y + wb.h },
      { x: Math.min(w - 8, wb.x + wb.w + w * 0.12), y: wb.y + wb.h },
      151,
      1.1,
    ),
    0.2,
    0.28,
    { alpha: 0.8 },
  );
  S(
    wobbleLine(
      { x: wb.x, y: wb.y - 18 },
      { x: wb.x, y: wb.y + wb.h + 18 },
      152,
      1.0,
    ),
    0.22,
    0.28,
    { alpha: 0.8 },
  );
  L(wb.x, wb.y - 8, "cap", 0.24, 0.3, "left", 10);
  L(wb.x + wb.w + 14, wb.y + wb.h + 4, "base", 0.26, 0.32, "left", 10);

  const sb = boxes.strap;
  S(
    wobbleLine(
      { x: sb.x, y: sb.y + sb.h + 6 },
      { x: sb.x + sb.w, y: sb.y + sb.h + 6 },
      160,
      1.0,
    ),
    0.3,
    0.36,
    { alpha: 0.7 },
  );

  /* where the stamp lands */
  const kb = boxes.seal;
  sketchRect(
    { x: kb.x - 5, y: kb.y - 5, w: kb.w + 10, h: kb.h + 10 },
    170,
    1.3,
    3,
  ).forEach((pts, i) => S(pts, 0.34 + i * 0.015, 0.38 + i * 0.015, { alpha: 0.8 }));
  L(kb.x + kb.w / 2, kb.y - 12, "stamp here", 0.38, 0.46, "center");

  /* header CTA gets a pencilled box, like a note to self */
  if (boxes.cta) {
    const cb = boxes.cta;
    sketchRect(
      { x: cb.x - 10, y: cb.y - 6, w: cb.w + 20, h: cb.h + 12 },
      180,
      1.1,
      2,
    ).forEach((pts, i) => S(pts, 0.14 + i * 0.012, 0.18 + i * 0.012, { alpha: 0.7 }));
  }

  /* THE ink strokes: baseline swash under the wordmark, tick beside strapline */
  S(
    wobbleLine(
      { x: wb.x - 6, y: wb.y + wb.h + 12 },
      { x: wb.x + wb.w * 1.04, y: wb.y + wb.h + 5 },
      200,
      2.2,
    ),
    0.5,
    0.62,
    { kind: "ink", width: 3.4, taper: true, alpha: 1 },
  );
  S(
    wobbleLine(
      { x: sb.x - 14, y: sb.y + 2 },
      { x: sb.x - 14, y: sb.y + sb.h - 2 },
      210,
      1.2,
    ),
    0.6,
    0.66,
    { kind: "ink", width: 3, taper: true, alpha: 1 },
  );

  return { strokes, labels, mono, mobile };
}
