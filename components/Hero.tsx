"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReduced } from "@/lib/anim";
import { scrollToTarget } from "@/lib/lenis";
import { buildScene, renderScene, type Box, type Scene } from "@/lib/sketch";
import Seal from "./Seal";

function Line({ word }: { word: string }) {
  return (
    <span className="block overflow-hidden pb-[0.06em]">
      {word.split("").map((c, i) => (
        <span key={i} className="hero-letter inline-block will-change-transform">
          {c}
        </span>
      ))}
    </span>
  );
}

export default function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wordRef = useRef<HTMLHeadingElement>(null);
  const strapRef = useRef<HTMLParagraphElement>(null);
  const sealRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const probeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;
    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let scene: Scene | null = null;
    let size = { w: 0, h: 0 };
    const progress = { v: 0 };

    const rel = (el: Element): Box => {
      const r = root.getBoundingClientRect();
      const b = el.getBoundingClientRect();
      return { x: b.left - r.left, y: b.top - r.top, w: b.width, h: b.height };
    };

    const draw = () => {
      if (scene) renderScene(ctx2d, scene, progress.v, dpr, size.w, size.h);
    };

    const measure = () => {
      const r = root.getBoundingClientRect();
      size = { w: r.width, h: r.height };
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(r.height * dpr);
      canvas.style.width = `${r.width}px`;
      canvas.style.height = `${r.height}px`;
      const mono =
        (probeRef.current && getComputedStyle(probeRef.current).fontFamily) ||
        "monospace";
      scene = buildScene({
        w: r.width,
        h: r.height,
        mono,
        mobile: r.width < 760,
        boxes: {
          word: rel(wordRef.current!),
          strap: rel(strapRef.current!),
          seal: rel(sealRef.current!),
          cta: ctaRef.current ? rel(ctaRef.current) : null,
        },
      });
      draw();
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);

    if (prefersReduced()) {
      progress.v = 1;
      draw();
      // re-render once real fonts arrive so pencil labels don't stay in fallback
      document.fonts?.ready.then(measure);
      return () => ro.disconnect();
    }

    const mobile = size.w < 760;
    const D = mobile ? 3 : 4.2; // master duration in seconds
    const at = (t: number) => t * D;

    let cleanupSkip: (() => void) | null = null;

    const gctx = gsap.context(() => {
      gsap.set(".hero-letter", { yPercent: 112 });

      const tl = gsap.timeline({ paused: true });
      tl.to(progress, { v: 1, duration: D, ease: "none", onUpdate: draw }, 0);

      /* letters rise out of the pencil guides as the ink pass begins */
      tl.set(wordRef.current, { autoAlpha: 1 }, at(0.44));
      tl.to(
        ".hero-letter",
        { yPercent: 0, duration: 0.7, stagger: 0.045, ease: "power4.out" },
        at(0.46),
      );
      tl.fromTo(
        strapRef.current,
        { autoAlpha: 0, y: 14 },
        { autoAlpha: 1, y: 0, duration: 0.55, ease: "power3.out" },
        at(0.62),
      );
      tl.fromTo(
        ".hero-sub",
        { autoAlpha: 0, y: 10 },
        { autoAlpha: 1, y: 0, duration: 0.5, ease: "power3.out" },
        at(0.68),
      );
      tl.fromTo(
        ".hero-header",
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.5 },
        at(0.72),
      );
      /* the stamp: the page's one theatrical beat */
      tl.fromTo(
        sealRef.current,
        { autoAlpha: 0, scale: 1.7, rotate: -12 },
        {
          autoAlpha: 1,
          scale: 1,
          rotate: 0,
          duration: 0.45,
          ease: "back.out(1.9)",
        },
        at(0.8),
      );
      tl.fromTo(
        [".hero-titleblock", ".hero-cue"],
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.5, stagger: 0.1 },
        at(0.9),
      );
      tl.to(".hero-skip", { autoAlpha: 0, duration: 0.3 }, at(0.95));

      /* exit scrub: the underlay recedes as you leave the sheet — the load
         sequence above is untouched, this only choreographs the hand-off */
      gsap.to(canvas, {
        autoAlpha: 0.3,
        ease: "none",
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom 30%",
          scrub: 0.5,
        },
      });
      gsap.to("[data-hero-drift]", {
        yPercent: -7,
        ease: "none",
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom 30%",
          scrub: 0.5,
        },
      });

      const skip = () => {
        if (tl.progress() < 1) tl.progress(1);
      };
      const onKey = () => skip();
      const onPointer = () => skip();
      const onWheel = () => skip();
      window.addEventListener("keydown", onKey);
      window.addEventListener("pointerdown", onPointer);
      window.addEventListener("wheel", onWheel, { passive: true });
      window.addEventListener("touchmove", onWheel, { passive: true });
      cleanupSkip = () => {
        window.removeEventListener("keydown", onKey);
        window.removeEventListener("pointerdown", onPointer);
        window.removeEventListener("wheel", onWheel);
        window.removeEventListener("touchmove", onWheel);
        cleanupSkip = null;
      };
      // once the intro has resolved the listeners are dead weight on every
      // wheel/touch event — drop them
      tl.eventCallback("onComplete", () => cleanupSkip?.());

      /* wait for the mono font so pencil labels don't swap mid-draw */
      const fontsReady =
        "fonts" in document ? document.fonts.ready : Promise.resolve();
      Promise.race([fontsReady, new Promise((r) => setTimeout(r, 900))]).then(
        () => {
          measure();
          if (window.scrollY > size.h * 0.4) tl.progress(1);
          else tl.play();
        },
      );
    }, root);

    return () => {
      ro.disconnect();
      cleanupSkip?.();
      gctx.revert();
    };
  }, []);

  return (
    <section
      ref={rootRef}
      className="relative min-h-[100svh] cursor-crosshair overflow-hidden"
      aria-label="Introduction"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        aria-hidden="true"
        role="presentation"
      />

      {/* z-20: must win hit-testing over the data-hero-drift content div below,
          which spans the full section height (its own z-10) despite its
          visible content sitting lower via justify-end */}
      <header className="hero-header hero-anim absolute inset-x-0 top-0 z-20 flex items-baseline justify-between px-6 py-5 md:px-10">
        <p className="anno text-ink!">ALEXWILDER-DEV</p>
        <a
          ref={ctaRef}
          href="#contact"
          onClick={(e) => {
            e.preventDefault();
            scrollToTarget("#contact");
          }}
          className="ink-link font-body text-sm text-ink"
        >
          Get in touch
        </a>
      </header>

      <div
        data-hero-drift
        className="relative z-10 flex min-h-[100svh] flex-col justify-end px-6 pb-24 pt-28 md:px-14 md:pb-28"
      >
        <div className="max-w-[46rem]">
          <div className="relative inline-block">
            <h1
              ref={wordRef}
              aria-label="Alex Wilder"
              className="hero-anim wordmark text-[clamp(4rem,13vw,10.5rem)]"
            >
              <Line word="ALEX" />
              <Line word="WILDER" />
            </h1>
            <div
              ref={sealRef}
              className="hero-anim absolute -right-6 -top-10 md:-right-28 md:top-auto md:bottom-2"
            >
              <Seal />
            </div>
          </div>

          <p
            ref={strapRef}
            className="hero-anim display mt-8 max-w-[30ch] text-[clamp(1.35rem,2.6vw,1.9rem)] text-ink"
          >
            I build your website before you&rsquo;ve paid me a penny.
          </p>
          <p className="hero-sub hero-anim mt-4 max-w-[52ch] text-ink-soft">
            Demo-first web design. See it before you buy it.
            <span className="anno mt-2 block">London</span>
          </p>
        </div>

        <div className="hero-cue hero-anim absolute bottom-7 left-6 flex items-center gap-3 md:left-14">
          <span className="anno">scroll</span>
          <span
            className="block h-px w-16 bg-underlay"
            aria-hidden="true"
          />
        </div>
      </div>

      {/* engineering title block, bottom-right */}
      <div
        ref={probeRef}
        className="hero-titleblock hero-anim anno absolute bottom-7 right-6 z-10 hidden border border-ink/50 md:block"
      >
        <dl className="grid grid-cols-[auto_auto] text-[0.62rem] leading-relaxed">
          {(
            [
              ["DRAWN BY", "A. WILDER"],
              ["SHEET", "01 OF 05"],
              ["SCALE", "1:1"],
              ["DATE", "JUL 2026"],
            ] as const
          ).map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="border-b border-r border-ink/30 px-3 py-1 text-ink-soft last-of-type:border-b-0">
                {k}
              </dt>
              <dd className="border-b border-ink/30 px-3 py-1 text-ink last-of-type:border-b-0">
                {v}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <button
        type="button"
        className="hero-skip anno absolute bottom-7 right-6 z-10 transition-opacity md:bottom-auto md:right-10 md:top-24"
        onClick={() => {
          /* pointerdown listener already fast-forwards; button exists for
             keyboard/AT discoverability */
        }}
        aria-label="Skip intro animation"
      >
        tap to skip —
      </button>
    </section>
  );
}
