import type Lenis from "lenis";

/**
 * Shared handle to the page's single Lenis instance (owned by
 * SmoothScroll). Lets any component trigger a smooth scroll without
 * threading the instance through props.
 */
export const lenisRef: { current: Lenis | null } = { current: null };

export function scrollToTarget(target: string | number, offset = 0) {
  if (lenisRef.current) {
    lenisRef.current.scrollTo(target, { offset });
    return;
  }
  // no Lenis (reduced motion, or not yet mounted): plain scroll fallback
  if (typeof target === "string") {
    document.querySelector(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  } else {
    window.scrollTo({ top: target + offset, behavior: "smooth" });
  }
}
