"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReduced } from "@/lib/anim";
import SectionHead from "./SectionHead";

/* wireframe path builders — everything is a <path> so pathLength/dash
   drawing works identically across browsers */
const r = (x: number, y: number, w: number, h: number) =>
  `M${x} ${y}h${w}v${h}h${-w}Z`;
const ln = (x1: number, y1: number, x2: number, y2: number) =>
  `M${x1} ${y1}L${x2} ${y2}`;
const xr = (x: number, y: number, w: number, h: number) => [
  r(x, y, w, h),
  ln(x, y, x + w, y + h),
  ln(x + w, y, x, y + h),
];

const NAV = [
  r(24, 20, 64, 20),
  ln(620, 32, 656, 32),
  ln(672, 32, 708, 32),
  ln(724, 32, 760, 32),
  ln(24, 56, 776, 56),
];

interface Callout {
  text: string;
  mx: number; // marker position, % of frame
  my: number;
}

interface PlateData {
  n: string;
  name: string;
  place: string;
  brief: string;
  url: string;
  flip: boolean;
  wire: string[];
  callouts: Callout[];
}

const PLATES: PlateData[] = [
  {
    n: "01",
    name: "The Marsh Harrier",
    place: "Oxford",
    brief:
      "A pub site with a custom QR table-ordering system — scan at the table, and the kitchen has it before you’ve put your phone down.",
    url: "themarshharrier.co.uk — demo",
    flip: false,
    wire: [
      ...NAV,
      ...xr(24, 72, 580, 150),
      r(24, 252, 264, 104),
      ln(44, 284, 244, 284),
      ln(44, 304, 204, 304),
      r(320, 252, 264, 104),
      ln(340, 284, 540, 284),
      ln(340, 304, 500, 304),
      r(632, 88, 132, 268),
      r(660, 116, 22, 22),
      r(714, 116, 22, 22),
      r(660, 170, 22, 22),
      r(694, 124, 6, 6),
      r(668, 148, 6, 6),
      r(722, 148, 6, 6),
      r(694, 174, 6, 6),
      ln(652, 224, 744, 224),
      ln(652, 244, 728, 244),
      r(652, 300, 92, 26),
      ln(24, 396, 288, 396),
      ln(24, 416, 224, 416),
    ],
    callouts: [
      { text: "order-to-kitchen in one tap", mx: 87, my: 42 },
      { text: "built for a Sunday rush", mx: 38, my: 60 },
    ],
  },
  {
    n: "02",
    name: "Effra Hall Tavern",
    place: "Brixton",
    brief:
      "A Victorian pub with a contemporary crowd — the site had to hold both without blinking.",
    url: "effrahalltavern.co.uk — demo",
    flip: true,
    wire: [
      ...NAV,
      ...xr(24, 72, 752, 230),
      ln(330, 170, 470, 170),
      ln(360, 195, 440, 195),
      r(24, 330, 364, 120),
      ln(44, 362, 348, 362),
      ln(44, 382, 308, 382),
      ln(44, 402, 328, 402),
      r(412, 330, 364, 120),
      ln(432, 362, 736, 362),
      ln(432, 382, 696, 382),
      ln(432, 402, 716, 402),
    ],
    callouts: [
      { text: "a Victorian house owned by a hip tech guy", mx: 50, my: 37 },
      { text: "built in Astro, loads instantly", mx: 10, my: 6 },
    ],
  },
  {
    n: "03",
    name: "Brotherton’s Brasserie",
    place: "Woodstock",
    brief:
      "A brasserie where what’s on matters as much as what’s cooking.",
    url: "brothertons.co.uk — demo",
    flip: false,
    wire: [
      ...NAV,
      ...xr(24, 72, 460, 240),
      ln(516, 88, 700, 88),
      r(516, 108, 40, 32),
      ln(568, 118, 756, 118),
      ln(568, 132, 716, 132),
      r(516, 152, 40, 32),
      ln(568, 162, 756, 162),
      ln(568, 176, 716, 176),
      r(516, 196, 40, 32),
      ln(568, 206, 756, 206),
      ln(568, 220, 716, 220),
      r(516, 252, 180, 36),
      r(24, 344, 752, 116),
      "M64 412 Q100 384 136 404 Q172 424 208 396 Q244 372 280 402",
      "M314 418 m6 0 a6 6 0 1 1 -12 0 a6 6 0 1 1 12 0",
      "M320 416 L320 384",
      "M320 384 Q334 388 331 402",
    ],
    callouts: [
      { text: "live music every Wednesday, front and centre", mx: 40, my: 80 },
      { text: "bookings via ResDiary", mx: 76, my: 54 },
    ],
  },
];

function Leader({ flipped }: { flipped: boolean }) {
  return (
    <svg
      viewBox="0 0 72 28"
      width="72"
      height="28"
      aria-hidden="true"
      className={`leader hidden md:block ${flipped ? "-scale-x-100" : ""}`}
      fill="none"
      stroke="var(--color-underlay)"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M70 24 C52 20 30 13 6 5" pathLength={1} />
      <path d="M14 3 L5 5 L12 12" pathLength={1} />
    </svg>
  );
}

function Plate({ p }: { p: PlateData }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (prefersReduced()) return;
    const el = ref.current;
    if (!el) return;

    const gctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: "top 70%", once: true },
      });
      tl.from(".plate-head", { autoAlpha: 0, y: 18, duration: 0.55 })
        .from(
          ".dim path",
          { strokeDashoffset: 1, duration: 0.45, stagger: 0.08, ease: "power2.out" },
          0.1,
        )
        .from(
          ".wire path",
          {
            strokeDashoffset: 1,
            duration: 0.8,
            stagger: 0.014,
            ease: "power1.inOut",
          },
          0.15,
        )
        .from(
          ".callout",
          { autoAlpha: 0, y: 10, duration: 0.45, stagger: 0.15 },
          0.65,
        )
        .from(
          ".leader path",
          { strokeDashoffset: 1, duration: 0.4, stagger: 0.1 },
          0.7,
        )
        .from(".marker", { autoAlpha: 0, scale: 0.4, duration: 0.3, stagger: 0.12 }, 0.8)
        /* …then ink: the plate resolves from underlay to iron-gall */
        .fromTo(
          [".plate-frame", ".plate-chrome"],
          { borderColor: "rgba(127,180,214,0.75)" },
          { borderColor: "#1C1B18", duration: 0.55 },
          1.05,
        )
        .fromTo(
          ".plate-title",
          { color: "#3E6B8A" },
          { color: "#1C1B18", duration: 0.55 },
          1.1,
        );
    }, el);

    return () => gctx.revert();
  }, []);

  return (
    <article
      ref={ref}
      className="grid items-start gap-8 md:grid-cols-12 md:gap-12"
    >
      <div className={`md:col-span-8 ${p.flip ? "md:order-2" : ""}`}>
        <div className="plate-head mb-6">
          <div className="flex items-center gap-4">
            <p className="anno">PLATE {p.n}</p>
            <svg
              viewBox="0 0 120 10"
              width="120"
              height="10"
              className="dim"
              aria-hidden="true"
              stroke="var(--color-underlay)"
              strokeWidth={1.2}
              fill="none"
            >
              <path d="M2 5 L118 5" pathLength={1} />
              <path d="M2 1 L2 9" pathLength={1} />
              <path d="M118 1 L118 9" pathLength={1} />
            </svg>
          </div>
          <h3 className="plate-title display mt-3 text-[clamp(1.8rem,3vw,2.5rem)] text-ink">
            {p.name}
            <span className="text-ink-soft"> — {p.place}</span>
          </h3>
          <p className="mt-2 max-w-[56ch] text-ink-soft">{p.brief}</p>
        </div>

        <div className="plate-frame border-[1.5px] border-ink">
          <div className="plate-chrome flex items-center gap-1.5 border-b-[1.5px] border-ink px-3 py-2.5">
            <span className="h-2 w-2 border border-ink/60" aria-hidden="true" />
            <span className="h-2 w-2 border border-ink/60" aria-hidden="true" />
            <span className="h-2 w-2 border border-ink/60" aria-hidden="true" />
            <span className="anno ml-3 normal-case">{p.url}</span>
          </div>
          <div className="relative aspect-[16/10]">
            {/* TODO: replace with real screenshot */}
            <svg
              viewBox="0 0 800 500"
              className="wire absolute inset-0 h-full w-full"
              aria-hidden="true"
              fill="none"
              stroke="var(--color-underlay)"
              strokeWidth={1.4}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.85}
            >
              {p.wire.map((d) => (
                <path key={d} d={d} pathLength={1} />
              ))}
            </svg>
            {p.callouts.map((c) => (
              <svg
                key={c.text}
                viewBox="0 0 12 12"
                width="12"
                height="12"
                className="marker absolute hidden md:block"
                style={{ left: `${c.mx}%`, top: `${c.my}%` }}
                aria-hidden="true"
                stroke="var(--color-anno)"
                strokeWidth={1.6}
              >
                <path d="M2 2 L10 10" />
                <path d="M10 2 L2 10" />
              </svg>
            ))}
          </div>
        </div>
      </div>

      <ul
        className={`space-y-8 md:col-span-4 md:pt-40 ${
          p.flip ? "md:order-1 md:text-right" : ""
        }`}
      >
        {p.callouts.map((c) => (
          <li
            key={c.text}
            className={`callout flex flex-col gap-2 ${p.flip ? "md:items-end" : ""}`}
          >
            <Leader flipped={p.flip} />
            <p className="anno max-w-[26ch] normal-case">
              <span className="md:hidden">— </span>
              {c.text}
            </p>
          </li>
        ))}
      </ul>
    </article>
  );
}

export default function Plates() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (prefersReduced()) return;
    const root = rootRef.current;
    if (!root) return;
    const gctx = gsap.context(() => {
      gsap.from("[data-reveal]", {
        autoAlpha: 0,
        y: 20,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: { trigger: root, start: "top 75%", once: true },
      });
    }, root);
    return () => gctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      id="plates"
      className="border-t border-ink/15 px-6 py-24 md:px-10 md:py-32"
    >
      <div className="mx-auto max-w-[74rem]">
        <SectionHead
          index="03"
          name="SELECTED WORK"
          title="The plates."
          support="Three recent builds, drawn to scale. Screen captures pending — the linework holds their place."
        />
        <div className="space-y-24 md:space-y-32">
          {PLATES.map((p) => (
            <Plate key={p.n} p={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
