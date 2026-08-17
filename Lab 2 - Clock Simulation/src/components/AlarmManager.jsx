import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlarmClock, Plus, Trash2, Pencil, Check, X, Volume2, BellRing, Bell } from 'lucide-react';
import { useClock } from '../hooks/useClock.js';
import { usePersistentState } from '../hooks/usePersistentState.js';
import { alarmSound } from '../utils/audio.js';
import AlarmModal from './AlarmModal.jsx';

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function pad(n) {
  return String(n).padStart(2, '0');
}

const emptyDraft = () => ({ id: null, title: '', hour: 8, minute: 0 });

export default function AlarmManager({ accentColor, format }) {
  const [alarms, setAlarms] = usePersistentState('clock:alarms', [
    { id: uid(), title: 'Morning Focus', hour: 7, minute: 30, enabled: true },
    { id: uid(), title: 'Stretch Break', hour: 15, minute: 0, enabled: false },
  ]);

  const [snoozes, setSnoozes] = useState({}); // alarmId -> timestamp(ms) to re-fire
  const [queue, setQueue] = useState([]); // alarmIds currently ringing, oldest first
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState(emptyDraft());

  const firedKeys = useRef(new Set());
  const info = useClock({ precision: 'second' });

  const fire = useCallback((id) => {
    setQueue((q) => (q.includes(id) ? q : [...q, id]));
  }, []);

  // Sweep alarms once per second (info updates on second boundaries only)
  useEffect(() => {
    const nowMs = Date.now();
    alarms.forEach((a) => {
      if (!a.enabled) return;

      const snoozeAt = snoozes[a.id];
      if (snoozeAt) {
        if (nowMs >= snoozeAt) {
          setSnoozes((s) => {
            const next = { ...s };
            delete next[a.id];
            return next;
          });
          fire(a.id);
        }
        return;
      }

      if (a.hour === info.hours && a.minute === info.minutes) {
        const key = `${a.id}-${info.hours}:${info.minutes}`;
        if (!firedKeys.current.has(key)) {
          firedKeys.current.add(key);
          fire(a.id);
        }
      }
    });
    if (firedKeys.current.size > 300) firedKeys.current.clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [info.seconds]);

  // Drive the Web Audio chime whenever something is ringing
  useEffect(() => {
    if (queue.length > 0) {
      alarmSound.start();
    } else {
      alarmSound.stop();
    }
  }, [queue.length]);

  useEffect(() => () => alarmSound.stop(), []);

  const activeAlarm = useMemo(
    () => (queue.length > 0 ? alarms.find((a) => a.id === queue[0]) || null : null),
    [queue, alarms]
  );

  const dismiss = (id) => setQueue((q) => q.filter((qid) => qid !== id));
  const snooze = (id) => {
    setQueue((q) => q.filter((qid) => qid !== id));
    setSnoozes((s) => ({ ...s, [id]: Date.now() + 5 * 60 * 1000 }));
  };

  const toggleAlarm = (id) =>
    setAlarms((prev) => prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a)));

  const deleteAlarm = (id) => {
    setAlarms((prev) => prev.filter((a) => a.id !== id));
    setQueue((q) => q.filter((qid) => qid !== id));
  };

  const openNewForm = () => {
    setDraft(emptyDraft());
    setShowForm(true);
  };

  const openEditForm = (alarm) => {
    setDraft({ id: alarm.id, title: alarm.title, hour: alarm.hour, minute: alarm.minute });
    setShowForm(true);
  };

  const saveDraft = (e) => {
    e.preventDefault();
    const title = draft.title.trim() || 'Alarm';
    if (draft.id) {
      setAlarms((prev) =>
        prev.map((a) => (a.id === draft.id ? { ...a, title, hour: draft.hour, minute: draft.minute } : a))
      );
    } else {
      setAlarms((prev) => [
        ...prev,
        { id: uid(), title, hour: draft.hour, minute: draft.minute, enabled: true },
      ]);
    }
    setShowForm(false);
  };

  const activeCount = alarms.filter((a) => a.enabled).length;

  const sortedAlarms = useMemo(
    () => [...alarms].sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute)),
    [alarms]
  );

  return (
    <div className="card-edge bg-surface rounded-3xl p-5 sm:p-6 shadow-panel">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlarmClock size={18} style={{ color: accentColor }} />
          <h2 className="font-display font-semibold text-lg text-ink">Alarms</h2>
          {activeCount > 0 && (
            <span
              className="text-[11px] font-semibold px-2 py-0.5 rounded-full animate-pulseRing"
              style={{ background: 'var(--accent-soft)', color: accentColor }}
            >
              {activeCount} active
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => alarmSound.playTone(1046.5, 0.3)}
            title="Test alarm sound"
            className="p-2 rounded-full text-ink-faint hover:text-ink hover:bg-surface-sunken transition-colors"
            aria-label="Test alarm sound"
          >
            <Volume2 size={16} />
          </button>
          <button
            onClick={openNewForm}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-white transition-transform active:scale-95"
            style={{ background: accentColor }}
          >
            <Plus size={15} /> New alarm
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            onSubmit={saveDraft}
            className="overflow-hidden mb-4"
          >
            <div className="card-edge bg-surface-sunken rounded-2xl p-4 flex flex-col sm:flex-row gap-3 sm:items-end">
              <div className="flex-1">
                <label className="block text-xs text-ink-faint mb-1">Title</label>
                <input
                  autoFocus
                  value={draft.title}
                  onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                  placeholder="e.g. Wake up"
                  className="w-full bg-surface-raised card-edge rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-accent"
                  maxLength={40}
                />
              </div>
              <div>
                <label className="block text-xs text-ink-faint mb-1">Time</label>
                <input
                  type="time"
                  value={`${pad(draft.hour)}:${pad(draft.minute)}`}
                  onChange={(e) => {
                    const [h, m] = e.target.value.split(':').map(Number);
                    setDraft((d) => ({ ...d, hour: h, minute: m }));
                  }}
                  className="bg-surface-raised card-edge rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-accent"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="p-2.5 rounded-lg text-white"
                  style={{ background: accentColor }}
                  aria-label="Save alarm"
                >
                  <Check size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="p-2.5 rounded-lg card-edge text-ink-faint hover:text-ink"
                  aria-label="Cancel"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-2.5">
        <AnimatePresence initial={false}>
          {sortedAlarms.map((a) => {
            const isSnoozed = Boolean(snoozes[a.id]);
            return (
              <motion.div
                layout
                key={a.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -12, transition: { duration: 0.15 } }}
                className="card-edge bg-surface-raised rounded-2xl px-4 py-3 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    role="switch"
                    aria-checked={a.enabled}
                    onClick={() => toggleAlarm(a.id)}
                    className="relative w-10 h-6 rounded-full shrink-0 transition-colors"
                    style={{ background: a.enabled ? accentColor : 'var(--surface-sunken)' }}
                  >
                    <motion.span
                      layout
                      className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow"
                      animate={{ left: a.enabled ? 18 : 2 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                    />
                  </button>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-ink truncate">{a.title}</span>
                      {isSnoozed && (
                        <span className="text-[10px] uppercase tracking-wide text-ink-faint">Snoozed</span>
                      )}
                      {a.enabled && !isSnoozed && (
                        <Bell size={12} style={{ color: accentColor }} />
                      )}
                    </div>
                    <span className="font-mono text-sm text-ink-dim tabular-nums">
                      {pad(a.hour)}:{pad(a.minute)}
                      {format === '12' && (
                        <span className="ml-1 text-xs">{a.hour >= 12 ? 'PM' : 'AM'}</span>
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEditForm(a)}
                    className="p-2 rounded-full text-ink-faint hover:text-ink hover:bg-surface-sunken transition-colors"
                    aria-label={`Edit ${a.title}`}
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => deleteAlarm(a.id)}
                    className="p-2 rounded-full text-ink-faint hover:text-red-400 hover:bg-surface-sunken transition-colors"
                    aria-label={`Delete ${a.title}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {sortedAlarms.length === 0 && (
          <p className="text-sm text-ink-faint text-center py-6">
            No alarms yet — add one to get started.
          </p>
        )}
      </div>

      <AlarmModal alarm={activeAlarm} format={format} onDismiss={dismiss} onSnooze={snooze} />
    </div>
  );
}
