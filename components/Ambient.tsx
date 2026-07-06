"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/anim";
import { inkRamp } from "@/lib/thread";

/* stray construction marks that drift through the sheet margins.
   Decorative only: desktop + motion-ok, transform/opacity, no layout. */

const MARKS: string[][] = [
  ["M8 26 L27 22"], // tick
  ["M8 24 L25 21", "M10 31 L27 28"], // double tick
  ["M6 24 L42 24", "M12 19 L5 24 L12 29", "M36 19 L43 24 L36 29"], // dim arrow
  ["M14 14 L30 30", "M30 14 L14 30"], // cross
  ["M11 11 L31 12 L30 31 L10 30 Z"], // square
  ["M10 34 L11 12 L33 13"], // corner
];

const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

interface Mark {
  y: number;
  left: boolean;
  x: number;
  type: number;
  rot: number;
  scale: number;
  color: string;
}

export default function Ambient() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [marks, setMarks] = useState<Mark[]>([]);

  useEffect(() => {
    const media = window.matchMedia(
      "(min-width: 48rem) and (prefers-reduced-motion: no-preference)",
    );
    if (!media.matches) return;

    let tid: ReturnType<typeof setTimeout>;
    const generate = () => {
      const docH = document.documentElement.scrollHeight;
      const vh = window.innerHeight;
      const start = vh * 1.1; // stay out of the hero
      const gap = vh * 0.62;
      const out: Mark[] = [];
      for (let y = start, i = 0; y < docH - vh * 0.5; y += gap * (0.8 + hash(i) * 0.6), i++) {
        out.push({
          y,
          left: i % 2 === 0,
          x: 6 + hash(i * 3.1) * 22,
          type: Math.floor(hash(i * 7.7) * MARKS.length),
          rot: (hash(i * 11.3) - 0.5) * 14,
          scale: 0.7 + hash(i * 5.9) * 0.6,
          color: inkRamp(y / docH),
        });
      }
      setMarks(out);
    };

    // measure after layout settles (stages inflate document height)
    const raf = requestAnimationFrame(generate);
    const onResize = () => {
      clearTimeout(tid);
      tid = setTimeout(generate, 250);
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(tid);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    if (!marks.length || !rootRef.current) return;
    const gctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".amb").forEach((el) => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: "top 98%",
            end: "top 2%",
            scrub: 0.8,
          },
        });
        tl.fromTo(
          el.querySelectorAll("path"),
          { strokeDashoffset: 1 },
          { strokeDashoffset: 0, duration: 0.32, stagger: 0.06, ease: "none" },
          0,
        )
          .fromTo(el, { y: 12 }, { y: -12, duration: 1, ease: "none" }, 0)
          .to(el, { autoAlpha: 0, duration: 0.24, ease: "none" }, 0.76);
      });
    }, rootRef);
    return () => {
      gctx.revert();
      ScrollTrigger.refresh();
    };
  }, [marks]);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-[1] hidden md:block"
    >
      {marks.map((m, i) => (
        <svg
          key={i}
          className="amb absolute"
          style={{
            top: m.y,
            [m.left ? "left" : "right"]: m.x,
            transform: `rotate(${m.rot}deg) scale(${m.scale})`,
          }}
          width="48"
          height="48"
          viewBox="0 0 48 48"
          fill="none"
          stroke={m.color}
          strokeWidth={1.3}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.42}
        >
          {MARKS[m.type].map((d) => (
            <path key={d} d={d} pathLength={1} className="amb-path" />
          ))}
        </svg>
      ))}
    </div>
  );
}
