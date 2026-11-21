import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import ChatComposer from './chat/ChatComposer';
import ChatIntro from './chat/ChatIntro';
import ChatKeyForm from './chat/ChatKeyForm';
import ChatMessage from './chat/ChatMessage';
import PlanCard from './chat/PlanCard';
import { FALLBACK_PLAN, buildContext, requestPlan } from '../lib/gemini';
import { clearLegacyKey, readSessionKey, writeSessionKey } from '../lib/sessionKey';
import { useFocusTrap } from '../lib/useFocusTrap';

/** Blocks a second request for a moment after a reply, so double-taps cost nothing. */
const COOLDOWN_MS = 1500;

let messageSeq = 0;

/** Monotonic ids keep React keys unique even within one millisecond. */
function nextMessageId(prefix) {
  messageSeq += 1;
  return `${prefix}${messageSeq}`;
}

/**
 * The "Ask Saans" co-pilot panel: a focus-trapped dialog that sends a compact
 * ledger summary to Gemini and renders only schema-checked plans. Every number
 * shown in a reply is re-priced by the ledger, never taken from the model.
 *
 * @param {{
 *   open: boolean,
 *   onOpen: () => void,
 *   onClose: () => void,
 *   pm25: number,
 *   place: string,
 *   budget: number,
 *   net: number,
 *   appliedSwaps: string[],
 * }} props
 */
export default function Chat({ open, onOpen, onClose, pm25, place, budget, net, appliedSwaps }) {
  const [apiKey, setApiKey] = useState(readSessionKey);
  const [draftKey, setDraftKey] = useState('');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [coolingDown, setCoolingDown] = useState(false);

  const panelRef = useRef(null);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const cooldownTimer = useRef(null);

  useEffect(clearLegacyKey, []);
  useEffect(() => () => clearTimeout(cooldownTimer.current), []);
  useFocusTrap(panelRef, open, { onEscape: onClose, initialFocusRef: inputRef });

  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, loading, open]);

  function saveKey(event) {
    event.preventDefault();
    const trimmed = draftKey.trim();
    if (!trimmed) return;
    writeSessionKey(trimmed);
    setApiKey(trimmed);
    setDraftKey('');
  }

  function forgetKey() {
    writeSessionKey('');
    setApiKey('');
    setDraftKey('');
  }

  async function ask(event) {
    event.preventDefault();
    const question = input.trim();
    if (!question || loading || coolingDown) return;
    if (!apiKey) return;

    setInput('');
    setMessages((prev) => [
      ...prev,
      { id: nextMessageId('u'), role: 'user', text: question },
    ]);
    setLoading(true);

    try {
      const plan = await requestPlan({
        apiKey,
        context: buildContext({ place, pm25, budget, net, appliedSwaps, question }),
      });
      setMessages((prev) => [...prev, { id: nextMessageId('a'), role: 'assistant', plan }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: nextMessageId('a'), role: 'assistant', plan: FALLBACK_PLAN, fallback: true },
      ]);
    } finally {
      setLoading(false);
      setCoolingDown(true);
      clearTimeout(cooldownTimer.current);
      cooldownTimer.current = setTimeout(() => setCoolingDown(false), COOLDOWN_MS);
    }
  }

  const canSend = Boolean(input.trim()) && !loading && !coolingDown;

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
              aria-labelledby="saans-chat-title"
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
                    <h2
                      id="saans-chat-title"
                      className="font-grotesk text-sm uppercase tracking-[0.2em] text-ink"
                    >
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
                aria-atomic="false"
                aria-busy={loading}
                className="flex-1 space-y-4 overflow-y-auto px-5 py-5"
              >
                <ChatIntro place={place} pm25={pm25} budget={budget} />

                {!apiKey ? (
                  <ChatKeyForm draftKey={draftKey} onChange={setDraftKey} onSave={saveKey} />
                ) : null}

                {!apiKey && messages.length === 0 ? (
                  <div className="pt-1">
                    <PlanCard plan={FALLBACK_PLAN} fallback />
                  </div>
                ) : null}

                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}

                {loading ? (
                  <div
                    role="status"
                    className="flex items-center gap-2 border border-white/[0.08] px-3 py-3"
                  >
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

                {apiKey ? (
                  <button
                    type="button"
                    onClick={forgetKey}
                    className="font-grotesk text-[10px] uppercase tracking-[0.14em] text-mute/85 transition-colors hover:text-alarm"
                  >
                    Key saved for this tab · forget it
                  </button>
                ) : null}
              </div>

              <ChatComposer
                value={input}
                onChange={setInput}
                onSubmit={ask}
                inputRef={inputRef}
                loading={loading}
                canSend={canSend}
                hasKey={Boolean(apiKey)}
              />
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
