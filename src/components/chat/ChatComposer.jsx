/**
 * The composer. Submission is guarded by `canSend` so an empty message, an
 * in-flight request or the post-reply cooldown cannot fire a second call.
 *
 * @param {{
 *   value: string,
 *   onChange: (value: string) => void,
 *   onSubmit: (event: import('react').FormEvent<HTMLFormElement>) => void,
 *   inputRef: import('react').RefObject<HTMLInputElement>,
 *   loading: boolean,
 *   canSend: boolean,
 *   hasKey: boolean,
 * }} props
 */
export default function ChatComposer({
  value,
  onChange,
  onSubmit,
  inputRef,
  loading,
  canSend,
  hasKey,
}) {
  return (
    <form onSubmit={onSubmit} className="border-t border-white/[0.08] px-4 py-4">
      <div className="flex items-center gap-2 border border-white/15 bg-base px-3 py-2 focus-within:border-amber/60">
        <label htmlFor="saans-question" className="sr-only">
          Ask Saans about today’s air
        </label>
        <input
          id="saans-question"
          ref={inputRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={hasKey ? 'Ask about today’s air…' : 'Add a key to ask…'}
          disabled={loading}
          className="min-w-0 flex-1 bg-transparent text-[13px] text-ink placeholder:text-mute/85 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!canSend}
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
  );
}
