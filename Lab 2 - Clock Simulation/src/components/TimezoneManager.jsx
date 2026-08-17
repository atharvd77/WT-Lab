import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Plus, Globe2, GripVertical } from 'lucide-react';
import { useClock, LOCAL_TIME_ZONE, getTimeZoneOffsetMinutes } from '../hooks/useClock.js';
import { usePersistentState } from '../hooks/usePersistentState.js';
import { searchTimezones } from '../utils/timezones.js';

function TimezoneCard({ tz, onRemove, format, accentColor }) {
  const info = useClock({ precision: 'second', timeZone: tz.id });
  const now = new Date();
  const localOffset = getTimeZoneOffsetMinutes(now, LOCAL_TIME_ZONE);
  const remoteOffset = getTimeZoneOffsetMinutes(now, tz.id);
  const diffMinutes = remoteOffset - localOffset;

  const relativeLabel = useMemo(() => {
    if (diffMinutes === 0) return 'Same as local time';
    const hrs = Math.abs(diffMinutes) / 60;
    const hrsLabel = Number.isInteger(hrs) ? hrs : hrs.toFixed(1);
    return `${hrsLabel} hr${hrsLabel === 1 ? '' : 's'} ${diffMinutes > 0 ? 'ahead of' : 'behind'} local time`;
  }, [diffMinutes]);

  const timeString =
    format === '12' ? `${info.hh12}:${info.mm}:${info.ss}` : `${info.hh}:${info.mm}:${info.ss}`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
      transition={{ type: 'spring', stiffness: 300, damping: 26 }}
      className="card-edge bg-surface-raised rounded-2xl p-4 flex items-center justify-between gap-3 group"
    >
      <div className="flex items-center gap-3 min-w-0">
        <GripVertical size={16} className="text-ink-faint shrink-0 opacity-0 group-hover:opacity-60 transition-opacity" />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-ink truncate">{tz.city}</span>
            <span className="text-xs text-ink-faint">{tz.country}</span>
          </div>
          <div className="text-xs text-ink-faint truncate">{tz.id.replace('_', ' ')}</div>
          <div className="text-xs mt-0.5" style={{ color: accentColor }}>
            {relativeLabel}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right">
          <div className="font-mono text-xl font-semibold text-ink tabular-nums">
            {timeString}
            {format === '12' && <span className="text-xs ml-1 text-ink-dim">{info.meridiem}</span>}
          </div>
          <div className="text-[11px] text-ink-faint">{info.offsetLabel}</div>
        </div>
        <button
          onClick={() => onRemove(tz.id)}
          aria-label={`Remove ${tz.city}`}
          className="p-1.5 rounded-full text-ink-faint hover:text-ink hover:bg-surface-sunken transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </motion.div>
  );
}

export default function TimezoneManager({ format, accentColor }) {
  const [timezones, setTimezones] = usePersistentState('clock:timezones', [
    { id: 'America/New_York' },
    { id: 'Europe/London' },
    { id: 'Asia/Tokyo' },
    { id: 'Australia/Sydney' },
  ]);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  const results = useMemo(() => searchTimezones(query), [query]);
  const enriched = useMemo(
    () =>
      timezones
        .map((t) => {
          const found = searchTimezones(t.id.split('/').pop().replace('_', ' '))[0];
          const meta = found && found.id === t.id ? found : null;
          const fallback = { id: t.id, city: t.id.split('/').pop().replace('_', ' '), country: '' };
          return meta || fallback;
        }),
    [timezones]
  );

  useEffect(() => {
    const handleClick = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const addTimezone = (tz) => {
    if (timezones.some((t) => t.id === tz.id)) return;
    setTimezones((prev) => [...prev, { id: tz.id }]);
    setQuery('');
    setOpen(false);
  };

  const removeTimezone = (id) => {
    setTimezones((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="card-edge bg-surface rounded-3xl p-5 sm:p-6 shadow-panel">
      <div className="flex items-center gap-2 mb-4">
        <Globe2 size={18} style={{ color: accentColor }} />
        <h2 className="font-display font-semibold text-lg text-ink">World Clocks</h2>
      </div>

      <div className="relative mb-5" ref={boxRef}>
        <div className="flex items-center gap-2 bg-surface-sunken card-edge rounded-xl px-3 py-2.5">
          <Search size={16} className="text-ink-faint shrink-0" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder="Search a city or country to add…"
            className="bg-transparent outline-none text-sm w-full text-ink placeholder:text-ink-faint"
          />
        </div>

        <AnimatePresence>
          {open && (
            <motion.ul
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="absolute z-20 mt-2 w-full max-h-64 overflow-y-auto card-edge bg-surface-raised rounded-xl shadow-panel divide-y divide-[var(--edge)]"
            >
              {results.length === 0 && (
                <li className="px-4 py-3 text-sm text-ink-faint">No matching timezones.</li>
              )}
              {results.map((tz) => {
                const already = timezones.some((t) => t.id === tz.id);
                return (
                  <li key={tz.id}>
                    <button
                      onClick={() => addTimezone(tz)}
                      disabled={already}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-surface-sunken transition-colors disabled:opacity-40"
                    >
                      <span>
                        <span className="text-ink font-medium">{tz.city}</span>{' '}
                        <span className="text-ink-faint">· {tz.country}</span>
                      </span>
                      {already ? (
                        <span className="text-xs text-ink-faint">Added</span>
                      ) : (
                        <Plus size={14} style={{ color: accentColor }} />
                      )}
                    </button>
                  </li>
                );
              })}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col gap-3">
        <AnimatePresence initial={false}>
          {enriched.map((tz) => (
            <TimezoneCard
              key={tz.id}
              tz={tz}
              onRemove={removeTimezone}
              format={format}
              accentColor={accentColor}
            />
          ))}
        </AnimatePresence>
        {enriched.length === 0 && (
          <p className="text-sm text-ink-faint text-center py-6">
            No world clocks yet — search above to add one.
          </p>
        )}
      </div>
    </div>
  );
}
