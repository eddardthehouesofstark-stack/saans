import { motion } from 'framer-motion';
import PlanCard from './PlanCard';

/**
 * One transcript entry. User questions are plain bubbles; assistant replies are
 * validated plans rendered by `PlanCard`, never raw model text.
 *
 * @param {{
 *   message: {
 *     id: string,
 *     role: 'user' | 'assistant',
 *     text?: string,
 *     plan?: object,
 *     fallback?: boolean,
 *   },
 * }} props
 */
export default function ChatMessage({ message }) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <p className="max-w-[85%] border border-amber/25 bg-amber/[0.07] px-3 py-2.5 text-[13px] leading-relaxed text-ink/90">
          {message.text}
        </p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <p className="micro text-[10px] text-amber/90">Saans</p>
      <div className="mt-2">
        <PlanCard plan={message.plan} fallback={message.fallback} />
      </div>
    </motion.div>
  );
}
