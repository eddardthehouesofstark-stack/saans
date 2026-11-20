export default function SectionHeading({ index, kicker, title, lede, className = '' }) {
  return (
    <div className={className}>
      <div className="flex items-center gap-4">
        <span className="font-grotesk text-[10px] font-medium uppercase tracking-[0.28em] text-amber">
          {index}
        </span>
        <span className="h-px w-8 bg-white/20" />
        <span className="micro">{kicker}</span>
      </div>
      <h2 className="mt-5 max-w-3xl font-display text-[clamp(2rem,4.4vw,3.6rem)] leading-[0.98] tracking-[-0.02em]">
        {title}
      </h2>
      {lede ? <p className="mt-5 max-w-xl text-sm leading-relaxed text-ink/55">{lede}</p> : null}
    </div>
  );
}
