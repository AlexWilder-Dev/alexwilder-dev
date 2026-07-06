export default function SectionHead({
  index,
  name,
  title,
  support,
}: {
  index: string;
  name: string;
  title: string;
  support?: string;
}) {
  return (
    <div className="mb-14 flex items-end justify-between gap-6 md:mb-20">
      <div data-reveal>
        <p className="anno">
        {index} — {name}
        </p>
        <h2 className="display mt-3 text-[clamp(2.1rem,4.5vw,3.6rem)]">
          {title}
        </h2>
        {support && <p className="mt-3 max-w-[46ch] text-ink-soft">{support}</p>}
      </div>
      <p className="anno hidden shrink-0 border border-ink/40 px-2.5 py-1 text-[0.62rem] md:block">
        SHEET {index} OF 05
      </p>
    </div>
  );
}
