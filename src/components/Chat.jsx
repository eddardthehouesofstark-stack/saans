import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import PlanCard from './chat/PlanCard';
import { FALLBACK_PLAN, buildContext, requestPlan } from '../lib/gemini';

const STORAGE_KEY = 'saans.gemini_key';
const COOLDOWN_MS = 1500;

/* The key lives in sessionStorage: it survives a reload, not the browser closing. */
function readKey() {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

function writeKey(value) {
  try {
    if (value) window.sessionStorage.setItem(STORAGE_KEY, value);
    else window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage unavailable */
  }
}

export default function Chat({ open, onOpen, onClose, pm25, place, budget, net, appliedSwaps }) {
  const [apiKey, setApiKey] = useState(readKey);
  const [showKeyForm, setShowKeyForm] = useState(() => !readKey());
  const [draftKey, setDraftKey] = useState('');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [coolingDown, setCoolingDown] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const panelRef = useRef(null);
  const cooldownTimer = useRef(null);

  // Earlier builds kept the key in localStorage; clear that copy.
  useEffect(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* storage unavailable */
    }
  }, []);

  useEffect(() => () => clearTimeout(cooldownTimer.current), []);

  useEffect(() => {
    if (!open) return undefined;

    const panel = panelRef.current;
    const previous = document.activeElement;
    const focusable = () =>
      Array.from(
        panel?.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]), textarea, [tabindex]:not([tabindex="-1"])'
        ) ?? []
      );

    const onKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = focusable();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const timer = setTimeout(() => (inputRef.current ?? panel)?.focus(), 380);
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', onKey);
      previous?.focus?.();
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
    if (!question || loading || coolingDown) return;
    if (!apiKey) {
      setShowKeyForm(true);
      return;
    }

    setInput('');
    setMessages((prev) => [...prev, { id: `u${Date.now()}`, role: 'user', text: question }]);
    setLoading(true);

    try {
      const plan = await requestPlan({
        apiKey,
        context: buildContext({ place, pm25, budget, net, appliedSwaps, question }),
      });
      setMessages((prev) => [...prev, { id: `a${Date.now()}`, role: 'assistant', plan }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: `a${Date.now()}`, role: 'assistant', plan: FALLBACK_PLAN, fallback: true },
      ]);
    } finally {
      setLoading(false);
      setCoolingDown(true);
      clearTimeout(cooldownTimer.current);
      cooldownTimer.current = setTimeout(() => setCoolingDown(false), COOLDOWN_MS);
    }
  }

  const sendDisabled = loading || coolingDown || !input.trim();

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
            <span className="h-1.5 w-1.5 rounded-full bg-base/70" aria-hidden="true" />
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
              aria-hidden="true"
            />

            <motion.aside
              key="panel"
              ref={panelRef}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-label="Ask Saans"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 260, damping: 32 }}
              className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[420px] flex-col border-l border-white/10 bg-[#0f1219] outline-none"
            >
              <div className="flex items-start justify-between border-b border-white/[0.08] px-5 py-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-amber shadow-[0_0_10px_rgba(232,163,61,0.8)]"
                      aria-hidden="true"
                    />
                    <h2 className="font-grotesk text-sm uppercase tracking-[0.2em] text-ink">
                      Ask Saans
                    </h2>
                  </div>
                  <p className="mt-1.5 font-grotesk text-[11px] leading-relaxed text-mute">
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

              <div
                ref={scrollRef}
                role="log"
                aria-live="polite"
                aria-relevant="additions"
                aria-busy={loading}
                className="flex-1 space-y-4 overflow-y-auto px-5 py-5"
              >
                <div className="border border-white/[0.08] bg-white/[0.015] p-4">
                  <p className="micro text-[10px] text-amber">Saans</p>
                  <p className="mt-2 text-[13px] leading-relaxed text-ink/85">
                    I read the same ledger you do — same PM2.5, same maths. Tell me what your day looks
                    like and I’ll find the cheapest air in it.
                  </p>
                  <p className="mt-2 font-grotesk text-[11px] text-ink/70">
                    {place} · {pm25} µg/m³ · {budget.toFixed(1)} 🚬 today
                  </p>
                </div>

                {!apiKey || showKeyForm ? (
                  <form onSubmit={saveKey} className="border border-white/10 bg-[#12151d] p-4">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="gemini-key"
                        className="micro text-[10px]"
                      >
                        Gemini API key
                      </label>
                      <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noreferrer"
                        className="font-grotesk text-[10px] uppercase tracking-[0.14em] text-amber hover:text-ink"
                      >
                        Get one ↗
                      </a>
                    </div>
                    <p id="gemini-key-note" className="mt-2 text-[12px] leading-relaxed text-ink/70">
                      Kept in this tab only, and sent only to Google’s Gemini endpoint as a request
                      header — never to SAANS, Supabase, or anyone else.
                    </p>
                    <input
                      id="gemini-key"
                      type="password"
                      value={draftKey}
                      onChange={(event) => setDraftKey(event.target.value)}
                      placeholder="AIza…"
                      autoComplete="off"
                      spellCheck="false"
                      aria-describedby="gemini-key-note"
                      className="mt-3 w-full border border-white/15 bg-base px-3 py-2 font-grotesk text-xs text-ink placeholder:text-mute/85 focus:border-amber focus:outline-none"
                    />
                    <div className="mt-3 flex items-center justify-between gap-3">
                      {apiKey ? (
                        <button
                          type="button"
                          onClick={() => setShowKeyForm(false)}
                          className="font-grotesk text-[10px] uppercase tracking-[0.14em] text-mute hover:text-ink"
                        >
                          Cancel
                        </button>
                      ) : (
                        <span className="font-grotesk text-[10px] uppercase tracking-[0.14em] text-mute/85">
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
                      <p className="micro text-[10px] text-amber/90">Saans</p>
                      <div className="mt-2">
                        <PlanCard plan={message.plan} fallback={message.fallback} />
                      </div>
                    </motion.div>
                  )
                )}

                {loading ? (
                  <div role="status" className="flex items-center gap-2 border border-white/[0.08] px-3 py-3">
                    <span className="micro text-[10px]">Reading the air</span>
                    <span className="flex gap-1" aria-hidden="true">
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
                    className="font-grotesk text-[10px] uppercase tracking-[0.14em] text-mute/85 transition-colors hover:text-alarm"
                  >
                    Key saved for this tab · forget it
                  </button>
                ) : null}
              </div>

              <form onSubmit={ask} className="border-t border-white/[0.08] px-4 py-4">
                <div className="flex items-center gap-2 border border-white/15 bg-base px-3 py-2 focus-within:border-amber/60">
                  <label htmlFor="saans-question" className="sr-only">
                    Ask Saans about today’s air
                  </label>
                  <input
                    id="saans-question"
                    ref={inputRef}
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder={apiKey ? 'Ask about today’s air…' : 'Add a key to ask…'}
                    disabled={loading}
                    className="min-w-0 flex-1 bg-transparent text-[13px] text-ink placeholder:text-mute/85 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={sendDisabled}
                    aria-label="Send message"
                    className="flex h-7 w-7 items-center justify-center bg-amber font-grotesk text-sm text-base transition-opacity hover:opacity-90 disabled:opacity-40"
                  >
                    ↑
                  </button>
                </div>
                <p className="mt-2 font-grotesk text-[10px] leading-relaxed text-mute/85">
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
