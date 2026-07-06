"use client";

import { useEffect, useRef } from "react";
import { drawThread, gsap } from "@/lib/anim";
import type { Pt } from "@/lib/sketch";
import { threadX } from "@/lib/thread";
import SectionHead from "./SectionHead";
import ThreadSeg from "./ThreadSeg";

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

function PlateBody({ p }: { p: PlateData }) {
  return (
    <article className="grid items-start gap-8 md:grid-cols-12 md:gap-12">
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

        <div className="plate-fit">
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

/* blue lines first, then ink, then the frame settles — one plate, ~1.6 units */
function plateAssembly(el: Element): gsap.core.Timeline {
  const q = (s: string) => el.querySelectorAll(s);
  const tl = gsap.timeline({ defaults: { ease: "none" } });
  tl.fromTo(q(".plate-head"), { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.35 }, 0)
    .fromTo(
      q(".dim path"),
      { strokeDashoffset: 1 },
      { strokeDashoffset: 0, duration: 0.22, stagger: 0.05 },
      0.05,
    )
    .fromTo(
      q(".wire path"),
      { strokeDashoffset: 1 },
      { strokeDashoffset: 0, duration: 0.85, stagger: 0.012 },
      0.15,
    )
    .fromTo(
      q(".callout"),
      { autoAlpha: 0, y: 12 },
      { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.12 },
      0.7,
    )
    .fromTo(
      q(".leader path"),
      { strokeDashoffset: 1 },
      { strokeDashoffset: 0, duration: 0.3, stagger: 0.08 },
      0.75,
    )
    .fromTo(
      q(".marker"),
      { autoAlpha: 0, scale: 0.4 },
      { autoAlpha: 1, scale: 1, duration: 0.2, stagger: 0.1 },
      0.9,
    )
    .fromTo(
      q(".plate-frame, .plate-chrome"),
      { borderColor: "rgba(127,180,214,0.75)" },
      { borderColor: "#1C1B18", duration: 0.4 },
      1.1,
    )
    .fromTo(
      q(".plate-title"),
      { color: "#3E6B8A" },
      { color: "#1C1B18", duration: 0.4 },
      1.15,
    )
    .fromTo(
      q(".plate-frame"),
      { y: 16, rotate: 0.4 },
      { y: 0, rotate: 0, duration: 0.45, ease: "power1.out" },
      1.15,
    );
  return tl;
}

/* the thread weaves behind the plates while they assemble and hand off */
const platesAnchors = (w: number, h: number): Pt[] => {
  const tx = threadX(w);
  if (w < 768) {
    return [
      { x: tx, y: 0 },
      { x: tx + 10, y: h * 0.5 },
      { x: tx, y: h },
    ];
  }
  /* dives behind the opaque frame, loops the right margin, recrosses under
     the callouts — fully exposed only while plates hand off */
  return [
    { x: tx, y: 0 },
    { x: tx, y: h * 0.45 },
    { x: w * 0.55, y: h * 0.68 },
    { x: w - 30, y: h * 0.64 },
    { x: w - 26, y: h * 0.32 },
    { x: w - 34, y: h * 0.7 },
    { x: w * 0.45, y: h * 0.78 },
    { x: tx + 8, y: h * 0.88 },
    { x: tx, y: h },
  ];
};

export default function Plates() {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const slides = Array.from(wrap.querySelectorAll(".plate-inner"));
    const threadPaths = wrap.querySelectorAll(".thread path");

    const mm = gsap.matchMedia(wrap);

    mm.add("(min-width: 48rem) and (prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        wrap.querySelectorAll("[data-reveal]"),
        { autoAlpha: 0, y: 20 },
        {
          autoAlpha: 1,
          y: 0,
          ease: "none",
          scrollTrigger: { trigger: wrap, start: "top 85%", end: "top 45%", scrub: 0.6 },
        },
      );

      const master = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: wrap,
          start: "top 75%",
          end: "bottom bottom",
          scrub: 0.5,
        },
      });
      master.add(drawThread(threadPaths, { duration: 7.6 }), 0);
      // plate 1 assembles; releases as plate 2 enters; and again for plate 3
      master.add(plateAssembly(slides[0]), 0.3);
      master.to(slides[0], { autoAlpha: 0, y: -60, duration: 0.4 }, 2.3);
      master.fromTo(
        slides[1],
        { autoAlpha: 0, y: 80 },
        { autoAlpha: 1, y: 0, duration: 0.4 },
        2.55,
      );
      master.add(plateAssembly(slides[1]), 2.85);
      master.to(slides[1], { autoAlpha: 0, y: -60, duration: 0.4 }, 4.85);
      master.fromTo(
        slides[2],
        { autoAlpha: 0, y: 80 },
        { autoAlpha: 1, y: 0, duration: 0.4 },
        5.1,
      );
      master.add(plateAssembly(slides[2]), 5.4);
      // remaining scroll lets the thread finish its exit while plate 3 holds
    });

    mm.add("(max-width: 47.99rem) and (prefers-reduced-motion: no-preference)", () => {
      drawThread(threadPaths, {
        scrollTrigger: { trigger: wrap, start: "top 80%", end: "bottom 95%", scrub: 0.6 },
      });
      slides.forEach((el) => {
        gsap
          .timeline({
            scrollTrigger: { trigger: el, start: "top 82%", end: "top 28%", scrub: 0.7 },
          })
          .add(plateAssembly(el));
      });
    });

    return () => mm.revert();
  }, []);

  return (
    <div ref={wrapRef} className="stage-wrap-plates">
      <section
        id="plates"
        className="stage-sticky relative border-t border-ink/15 px-6 py-24 md:px-10 md:py-32"
      >
        <ThreadSeg
          seed={57}
          from={0.34}
          to={0.68}
          anchors={platesAnchors}
          className="-z-[1]"
        />
        <div className="stage-center mx-auto w-full max-w-[74rem]">
          <div className="stage-pad">
            <SectionHead
              tight
              index="03"
              name="SELECTED WORK"
              title="The plates."
              support="Three recent builds, drawn to scale. Screen captures pending — the linework holds their place."
            />
          </div>
          <div className="plates-track">
            {PLATES.map((p) => (
              <div key={p.n} className="plate-slide">
                <div className="plate-inner w-full">
                  <PlateBody p={p} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
