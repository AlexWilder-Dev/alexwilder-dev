"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReduced } from "@/lib/anim";
import Seal from "./Seal";

export default function Contact() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (prefersReduced()) return;
    const root = rootRef.current;
    if (!root) return;
    const gctx = gsap.context(() => {
      gsap.fromTo(
        "[data-reveal]",
        { autoAlpha: 0, y: 22 },
        {
          autoAlpha: 1,
          y: 0,
          stagger: 0.15,
          ease: "none",
          scrollTrigger: { trigger: root, start: "top 78%", end: "top 35%", scrub: 0.7 },
        },
      );
      /* the second stamp: pressed by the scroll as the thread arrives */
      gsap.fromTo(
        ".cta-seal .seal",
        { scale: 1.45, rotate: -9, autoAlpha: 0 },
        {
          scale: 1,
          rotate: 0,
          autoAlpha: 1,
          ease: "none",
          scrollTrigger: { trigger: root, start: "top 60%", end: "top 30%", scrub: 0.6 },
        },
      );
    }, root);
    return () => gctx.revert();
  }, []);

  return (
    // no border-t: the thread carries the eye from the portrait straight in
    <section
      ref={rootRef}
      id="contact"
      className="px-6 py-28 md:px-10 md:py-40"
    >
      <div className="mx-auto max-w-[74rem]">
        <div className="flex items-start justify-between" data-reveal>
          <p className="anno">05 — THE SEAL</p>
          <p className="anno hidden shrink-0 border border-ink/40 px-2.5 py-1 text-[0.62rem] md:block">
            SHEET 05 OF 05
          </p>
        </div>
        <h2
          className="display mt-6 max-w-[24ch] text-[clamp(2rem,4.5vw,3.6rem)]"
          data-reveal
        >
          If I&rsquo;ve sent you a demo, this is where you say yes.
        </h2>

        <a
          href="mailto:alex@alexwilder.dev"
          data-thread="seal"
          className="cta-seal group mt-12 inline-flex items-center gap-7"
          data-reveal
        >
          <Seal size="7rem" />
          <span className="block">
            <span className="display block text-[clamp(1.6rem,2.6vw,2.2rem)] text-ink underline decoration-underlay decoration-1 underline-offset-8 transition-[text-decoration-color] duration-150 group-hover:decoration-ink">
              Get in touch
            </span>
            <span className="anno mt-2 block normal-case">
              alex@alexwilder.dev
            </span>
          </span>
        </a>

        <p className="mt-10 max-w-[52ch] text-ink-soft" data-reveal>
          And if I haven&rsquo;t — tell me about your place, and I&rsquo;ll
          build you something worth replying to.
        </p>
      </div>
    </section>
  );
}
