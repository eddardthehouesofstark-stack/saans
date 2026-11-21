import { motion } from 'framer-motion';

/** The three-dot "reading the air" indicator shown while a plan is in flight. */
export default function ChatTyping() {
  return (
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
  );
}
