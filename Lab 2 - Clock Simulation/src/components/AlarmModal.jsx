import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellRing, Clock, X } from 'lucide-react';

export default function AlarmModal({ alarm, format, onDismiss, onSnooze }) {
  return (
    <AnimatePresence>
      {alarm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          role="alertdialog"
          aria-modal="true"
          aria-label={`Alarm: ${alarm.title}`}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 10 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            className="card-edge bg-surface-raised rounded-3xl p-8 w-full max-w-sm text-center shadow-panel relative"
          >
            <motion.div
              className="mx-auto mb-5 w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: 'var(--accent-soft)' }}
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ repeat: Infinity, duration: 1.1, ease: 'easeInOut' }}
            >
              <BellRing size={28} style={{ color: 'var(--accent)' }} />
            </motion.div>

            <h3 className="font-display font-bold text-xl text-ink mb-1">{alarm.title}</h3>
            <p className="text-ink-dim flex items-center justify-center gap-1.5 text-sm mb-6">
              <Clock size={14} />
              {String(alarm.hour).padStart(2, '0')}:{String(alarm.minute).padStart(2, '0')}
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => onSnooze(alarm.id)}
                className="flex-1 px-4 py-3 rounded-xl card-edge text-ink font-medium hover:bg-surface-sunken transition-colors"
              >
                Snooze (5 min)
              </button>
              <button
                onClick={() => onDismiss(alarm.id)}
                className="flex-1 px-4 py-3 rounded-xl font-semibold text-white transition-transform active:scale-95"
                style={{ background: 'var(--accent)' }}
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
