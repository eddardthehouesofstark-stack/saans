import { AnimatePresence, motion } from 'framer-motion';

/**
 * The floating "Ask Saans" button, shown while the panel is closed.
 * @param {{ open: boolean, onOpen: () => void }} props
 */
export default function ChatFab({ open, onOpen }) {
  return (
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
  );
}
