/**
 * The maker's mark. Red is rationed: this component renders both of the
 * page's only two red elements — once in the hero, once as the closing CTA.
 */
export default function Seal({ size = "5.75rem" }: { size?: string }) {
  return (
    <span
      className="seal select-none"
      style={{ "--seal-size": size } as React.CSSProperties}
      aria-hidden="true"
    >
      <span className="seal-aw">AW</span>
      <span className="seal-est">EST. LONDON</span>
    </span>
  );
}
