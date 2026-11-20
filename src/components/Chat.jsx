import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'saans.gemini_key';

const SYSTEM_INSTRUCTION =
  'You are Saans, an air-quality co-pilot. Given location, current PM2.5, and the user’s routine, return ONLY JSON: {"actions":[{"action":str,"pm25_avoided":num,"cigarettes_saved":num}],"net_budget":str,"source_note":str}. Use 22 µg/m³ PM2.5 = 1 cigarette/day. Be concrete, local, family-safe.';

const FALLBACK_PLAN = {
  actions: [
    {
      action: 'Move the sunrise jog indoors or before 6 am, windows shut.',
      pm25_avoided: 110,
      cigarettes_saved: 0.7,
    },
    {
      action: 'Take the metro instead of the e-rickshaw for the 8:15 commute.',
      pm25_avoided: 85,
      cigarettes_saved: 0.7,
    },
    {
      action: 'Run the kitchen exhaust and cook with lids on tonight.',
      pm25_avoided: 65,
      cigarettes_saved: 0.3,
    },
  ],
  net_budget: '11.3',
  source_note: 'Example plan using 22 µg/m³ = 1 cigarette/day. The ledger prices every action.',
};

function readKey() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

function writeKey(value) {
  try {
    if (value) window.localStorage.setItem(STORAGE_KEY, value);
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage unavailable */
  }
}

function parsePlan(raw) {
  if (!raw) return null;
  const cleaned = raw.replace(/```(?:json)?/gi, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) return null;
  try {
    const data = JSON.parse(cleaned.slice(start, end + 1));
    if (!Array.isArray(data.actions)) return null;
    const actions = data.actions
      .filter((item) => item && typeof item.action === 'string')
      .slice(0, 5)
      .map((item) => ({
        action: item.action,
        pm25_avoided: Number(item.pm25_avoided),
        cigarettes_saved: Number(item.cigarettes_saved),
      }));
    if (!actions.length) return null;
    return {
      actions,
      net_budget: data.net_budget != null ? String(data.net_budget) : null,
      source_note: data.source_note ? String(data.source_note) : null,
    };
  } catch {
    return null;
  }
}

function PlanCard({ plan, fallback }) {
  return (
    <div className="space-y-2">
      {fallback ? (
        <p className="border border-amber/30 bg-amber/[0.06] px-3 py-2 font-grotesk text-[9px] uppercase leading-relaxed tracking-[0.12em] text-amber">
          Example plan · Gemini unavailable or key missing. The UI never breaks.
        </p>
      ) : null}

      {plan.actions.map((action, index) => (
        <div key={index} className="border border-white/[0.08] bg-white/[0.02] p-3">
          <p className="text-[12px] leading-snug text-ink/90">{action.action}</p>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 font-grotesk text-[9px] uppercase tracking-[0.12em] text-mute">
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
        <p className="flex items-center justify-between border border-white/[0.08] px-3 py-2 font-grotesk text-[10px] uppercase tracking-[0.14em] text-ink/60">
          <span>Saans net today</span>
          <span className="text-amber">{plan.net_budget} 🚬</span>
        </p>
      ) : null}

      {plan.source_note ? (
        <p className="px-1 font-grotesk text-[9px] leading-relaxed text-mute/60">{plan.source_note}</p>
      ) : null}
    </div>
  );
}

export default function Chat({ open, onOpen, onClose, pm25, place, budget, net, appliedSwaps }) {
  const [apiKey, setApiKey] = useState(readKey);
  const [showKeyForm, setShowKeyForm] = useState(() => !readKey());
  const [draftKey, setDraftKey] = useState('');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const timer = setTimeout(() => inputRef.current?.focus(), 380);
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, loading, open]);

  function saveKey(event) {
    event.preventDefault();
    const trimmed = draftKey.trim();
    if (!trimmed) return;
    writeKey(trimmed);
    setApiKey(trimmed);
    setShowKeyForm(false);
    setDraftKey('');
  }

  function forgetKey() {
    writeKey('');
    setApiKey('');
    setDraftKey('');
    setShowKeyForm(true);
  }

  async function ask(event) {
    event.preventDefault();
    const question = input.trim();
    if (!question || loading) return;
    if (!apiKey) {
      setShowKeyForm(true);
      return;
    }

    setInput('');
    setMessages((prev) => [...prev, { id: `u${Date.now()}`, role: 'user', text: question }]);
    setLoading(true);

    const context = [
      `Location: ${place}.`,
      `Current PM2.5: ${pm25} µg/m³.`,
      `Daily budget: ${budget.toFixed(1)} cigarettes.`,
      `Net after applied swaps: ${net.toFixed(1)} cigarettes.`,
      `Applied swaps: ${appliedSwaps.length ? appliedSwaps.join('; ') : 'none'}.`,
      'Household: two adults and two children (ages 5 and 8).',
      `User asks: ${question}`,
    ].join(' ');

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(
          apiKey
        )}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
            contents: [{ role: 'user', parts: [{ text: context }] }],
            generationConfig: { temperature: 0.4, responseMimeType: 'application/json' },
          }),
        }
      );

      if (!response.ok) throw new Error(`Gemini responded ${response.status}`);

      const data = await response.json();
      const text = (data?.candidates?.[0]?.content?.parts ?? [])
        .map((part) => part?.text ?? '')
        .join('');
      const plan = parsePlan(text);
      if (!plan) throw new Error('Gemini reply was not the expected JSON');

      setMessages((prev) => [...prev, { id: `a${Date.now()}`, role: 'assistant', plan }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: `a${Date.now()}`, role: 'assistant', plan: FALLBACK_PLAN, fallback: true },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <AnimatePresence>
        {!open ? (
          <motion.button
            key="fab"
            type="button"
            onClick={onOpen}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 bg-amber px-5 py-3.5 font-grotesk text-[11px] font-medium uppercase tracking-[0.2em] text-base shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-base/70" />
            Ask Saans
          </motion.button>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {open ? (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-40 bg-black/55"
            />

            <motion.aside
              key="panel"
              role="dialog"
              aria-modal="true"
              aria-label="Ask Saans"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 260, damping: 32 }}
              className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[420px] flex-col border-l border-white/10 bg-[#0f1219]"
            >
              <div className="flex items-start justify-between border-b border-white/[0.08] px-5 py-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber shadow-[0_0_10px_rgba(232,163,61,0.8)]" />
                    <h2 className="font-grotesk text-sm uppercase tracking-[0.2em] text-ink">
                      Ask Saans
                    </h2>
                  </div>
                  <p className="mt-1.5 font-grotesk text-[10px] leading-relaxed text-mute">
                    Priced by the ledger · narrated by Gemini
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close chat"
                  className="px-2 py-1 font-grotesk text-lg leading-none text-mute transition-colors hover:text-ink"
                >
                  ×
                </button>
              </div>

              <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
                <div className="border border-white/[0.08] bg-white/[0.015] p-4">
                  <p className="micro text-[9px] text-amber">Saans</p>
                  <p className="mt-2 text-[13px] leading-relaxed text-ink/70">
                    I read the same ledger you do — same PM2.5, same maths. Tell me what your day looks
                    like and I’ll find the cheapest air in it.
                  </p>
                  <p className="mt-2 font-grotesk text-[10px] text-ink/40">
                    {place} · {pm25} µg/m³ · {budget.toFixed(1)} 🚬 today
                  </p>
                </div>

                {!apiKey || showKeyForm ? (
                  <form onSubmit={saveKey} className="border border-white/10 bg-[#12151d] p-4">
                    <div className="flex items-center justify-between">
                      <p className="micro text-[9px]">Gemini API key</p>
                      <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noreferrer"
                        className="font-grotesk text-[9px] uppercase tracking-[0.14em] text-amber hover:text-ink"
                      >
                        Get one ↗
                      </a>
                    </div>
                    <p className="mt-2 text-[11px] leading-relaxed text-ink/45">
                      Stored in this browser only. Sent only to Google’s Gemini endpoint — never to
                      SAANS, Supabase, or anyone else.
                    </p>
                    <input
                      type="password"
                      value={draftKey}
                      onChange={(event) => setDraftKey(event.target.value)}
                      placeholder="AIza…"
                      autoComplete="off"
                      spellCheck="false"
                      className="mt-3 w-full border border-white/10 bg-base px-3 py-2 font-grotesk text-xs text-ink placeholder:text-mute/50 focus:border-amber focus:outline-none"
                    />
                    <div className="mt-3 flex items-center justify-between gap-3">
                      {apiKey ? (
                        <button
                          type="button"
                          onClick={() => setShowKeyForm(false)}
                          className="font-grotesk text-[9px] uppercase tracking-[0.14em] text-mute hover:text-ink"
                        >
                          Cancel
                        </button>
                      ) : (
                        <span className="font-grotesk text-[9px] uppercase tracking-[0.14em] text-mute/60">
                          no key · example plans still work
                        </span>
                      )}
                      <button type="submit" className="btn-solid px-3 py-2 text-[10px]">
                        Save key
                      </button>
                    </div>
                  </form>
                ) : null}

                {!apiKey && messages.length === 0 ? (
                  <div className="pt-1">
                    <PlanCard plan={FALLBACK_PLAN} fallback />
                  </div>
                ) : null}

                {messages.map((message) =>
                  message.role === 'user' ? (
                    <div key={message.id} className="flex justify-end">
                      <p className="max-w-[85%] border border-amber/25 bg-amber/[0.07] px-3 py-2.5 text-[13px] leading-relaxed text-ink/90">
                        {message.text}
                      </p>
                    </div>
                  ) : (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <p className="micro text-[8px] text-amber/80">Saans</p>
                      <div className="mt-2">
                        <PlanCard plan={message.plan} fallback={message.fallback} />
                      </div>
                    </motion.div>
                  )
                )}

                {loading ? (
                  <div className="flex items-center gap-2 border border-white/[0.08] px-3 py-3">
                    <span className="micro text-[9px]">Reading the air</span>
                    <span className="flex gap-1">
                      {[0, 1, 2].map((dot) => (
                        <motion.span
                          key={dot}
                          className="h-1 w-1 rounded-full bg-amber"
                          animate={{ opacity: [0.2, 1, 0.2] }}
                          transition={{ duration: 1.1, repeat: Infinity, delay: dot * 0.18 }}
                        />
                      ))}
                    </span>
                  </div>
                ) : null}

                {apiKey && !showKeyForm ? (
                  <button
                    type="button"
                    onClick={forgetKey}
                    className="font-grotesk text-[9px] uppercase tracking-[0.14em] text-mute/50 transition-colors hover:text-alarm"
                  >
                    Key saved on this device · forget it
                  </button>
                ) : null}
              </div>

              <form onSubmit={ask} className="border-t border-white/[0.08] px-4 py-4">
                <div className="flex items-center gap-2 border border-white/10 bg-base px-3 py-2 focus-within:border-amber/60">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder={apiKey ? 'Ask about today’s air…' : 'Add a key to ask…'}
                    disabled={loading}
                    className="min-w-0 flex-1 bg-transparent text-[13px] text-ink placeholder:text-mute/50 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    aria-label="Send message"
                    className="flex h-7 w-7 items-center justify-center bg-amber font-grotesk text-sm text-base transition-opacity hover:opacity-90 disabled:opacity-30"
                  >
                    ↑
                  </button>
                </div>
                <p className="mt-2 font-grotesk text-[9px] leading-relaxed text-mute/40">
                  Gemini proposes. The ledger prices. SAANS never lets the model compute your budget.
                </p>
              </form>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
