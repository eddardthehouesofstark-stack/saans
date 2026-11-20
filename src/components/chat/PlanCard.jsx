export default function PlanCard({ plan, fallback }) {
  return (
    <div className="space-y-2">
      {fallback ? (
        <p className="border border-amber/30 bg-amber/[0.06] px-3 py-2 font-grotesk text-[10px] uppercase leading-relaxed tracking-[0.12em] text-amber">
          Example plan · Gemini unavailable or key missing. The UI never breaks.
        </p>
      ) : null}

      {plan.actions.map((action, index) => (
        <div key={index} className="border border-white/[0.08] bg-white/[0.02] p-3">
          <p className="text-[13px] leading-snug text-ink/90">{action.action}</p>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 font-grotesk text-[10px] uppercase tracking-[0.12em] text-mute">
            {Number.isFinite(action.cigarettes_saved) ? (
              <span className="text-green">−{action.cigarettes_saved.toFixed(1)} 🚬</span>
            ) : null}
            {Number.isFinite(action.pm25_avoided) ? (
              <span>{action.pm25_avoided} µg/m³ avoided</span>
            ) : null}
          </div>
        </div>
      ))}

      {plan.net_budget ? (
        <p className="flex items-center justify-between border border-white/[0.08] px-3 py-2 font-grotesk text-[11px] uppercase tracking-[0.14em] text-ink/80">
          <span>Saans net today</span>
          <span className="text-amber">{plan.net_budget} 🚬</span>
        </p>
      ) : null}

      {plan.source_note ? (
        <p className="px-1 font-grotesk text-[10px] leading-relaxed text-mute/85">
          {plan.source_note}
        </p>
      ) : null}
    </div>
  );
}
