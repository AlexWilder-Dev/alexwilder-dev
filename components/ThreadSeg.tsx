"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Pt } from "@/lib/sketch";
import { inkRamp, threadD } from "@/lib/thread";

/* measure before parent effects run: owning timelines tween these paths'
   dashoffset, and GSAP must see a real (non-empty) `d` at tween creation or
   it can't build an interpolatable value and snaps at the midpoint */
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export type AnchorFn = (w: number, h: number, root: HTMLElement) => Pt[];

/**
 * Renders one segment of the page thread as a dumb, measured SVG.
 * Draw choreography (dashoffset scrubbing) belongs to the owning section's
 * timeline via the `.thread path` selector. With no JS/reduced motion the
 * segment renders fully drawn (dashoffset 0 is the authored final state).
 */
export default function ThreadSeg({
  seed,
  anchors,
  from = 0,
  to = 1,
  amp = 2.4,
  className = "",
}: {
  seed: number;
  anchors: AnchorFn;
  from?: number; // position on the global blue→ink ramp
  to?: number;
  amp?: number;
  className?: string;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const anchorsRef = useRef(anchors);
  anchorsRef.current = anchors;
  const [geo, setGeo] = useState<{ w: number; h: number; d: string } | null>(
    null,
  );

  useIsoLayoutEffect(() => {
    const svg = ref.current;
    const parent = svg?.parentElement;
    if (!svg || !parent) return;
    const update = () => {
      const r = parent.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return;
      setGeo({
        w: r.width,
        h: r.height,
        d: threadD(anchorsRef.current(r.width, r.height, parent), seed, amp),
      });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(parent);
    return () => ro.disconnect();
  }, [seed, amp]);

  const gid = `thread-g${seed}`;
  return (
    <svg
      ref={ref}
      className={`thread pointer-events-none absolute inset-0 h-full w-full ${className}`}
      viewBox={geo ? `0 0 ${geo.w} ${geo.h}` : "0 0 1 1"}
      preserveAspectRatio="none"
      aria-hidden="true"
      fill="none"
    >
      <defs>
        <linearGradient
          id={gid}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="0"
          x2="0"
          y2={geo?.h ?? 1}
        >
          <stop offset="0" stopColor={inkRamp(from)} />
          <stop offset="1" stopColor={inkRamp(to)} />
        </linearGradient>
      </defs>
      {/* paths render from the first paint (d filled in after measurement)
          so owning timelines can target them in their mount effects */}
      <g stroke={`url(#${gid})`} strokeLinecap="round" strokeLinejoin="round">
        {/* wide faint pass under a firm narrow pass = pen weight; the ghost
            pass doubles paint cost, so mobile gets the firm stroke only */}
        {(!geo || geo.w >= 768) && (
          <path d={geo?.d ?? ""} pathLength={1} strokeWidth={4.6} opacity={0.16} />
        )}
        <path d={geo?.d ?? ""} pathLength={1} strokeWidth={2.1} />
      </g>
    </svg>
  );
}
