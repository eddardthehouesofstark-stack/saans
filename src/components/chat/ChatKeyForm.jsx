/**
 * Where the visitor pastes their own Gemini key. The copy is explicit that the
 * key never reaches SAANS, and the input is a password field with no
 * autocomplete so browsers do not offer to save it.
 *
 * @param {{
 *   draftKey: string,
 *   onChange: (value: string) => void,
 *   onSave: (event: import('react').FormEvent<HTMLFormElement>) => void,
 * }} props
 */
export default function ChatKeyForm({ draftKey, onChange, onSave }) {
  return (
    <form onSubmit={onSave} className="border border-white/10 bg-[#12151d] p-4">
      <div className="flex items-center justify-between">
        <label htmlFor="gemini-key" className="micro text-[10px]">
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
        Kept in this tab only, and sent only to Google’s Gemini endpoint as a request header — never
        to SAANS, Supabase, or anyone else.
      </p>
      <input
        id="gemini-key"
        type="password"
        value={draftKey}
        onChange={(event) => onChange(event.target.value)}
        placeholder="AIza…"
        autoComplete="off"
        spellCheck="false"
        aria-describedby="gemini-key-note"
        className="mt-3 w-full border border-white/15 bg-base px-3 py-2 font-grotesk text-xs text-ink placeholder:text-mute/85 focus:border-amber focus:outline-none"
      />
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="font-grotesk text-[10px] uppercase tracking-[0.14em] text-mute/85">
          no key · example plans still work
        </span>
        <button type="submit" className="btn-solid px-3 py-2 text-[10px]">
          Save key
        </button>
      </div>
    </form>
  );
}
