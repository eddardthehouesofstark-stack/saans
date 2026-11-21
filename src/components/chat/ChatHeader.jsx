/**
 * Title row and close control for the co-pilot panel.
 * @param {{ onClose: () => void }} props
 */
export default function ChatHeader({ onClose }) {
  return (
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
  );
}
