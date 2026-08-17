import React from 'react';
import { useClock } from '../hooks/useClock.js';

const FONT_CLASS = {
  modern: 'font-display font-semibold tracking-tight',
  mono: 'font-mono tracking-tight',
  led: 'led-text neon-text',
};

export function fontOptions() {
  return [
    { id: 'modern', label: 'Minimal Modern' },
    { id: 'mono', label: 'Monospace' },
    { id: 'led', label: 'Digital LED' },
  ];
}

/**
 * DigitalClock — HH:MM:SS readout with 12h/24h toggle, full date/day, and
 * UTC offset. Runs at 'second' precision: it re-renders once per second,
 * never on every animation frame.
 */
export default function DigitalClock({
  timeZone,
  format = '24',
  font = 'modern',
  accentColor = 'var(--accent)',
  label,
}) {
  const info = useClock({ precision: 'second', timeZone });
  const fontClass = FONT_CLASS[font] || FONT_CLASS.modern;

  const timeString =
    format === '12'
      ? `${info.hh12}:${info.mm}:${info.ss}`
      : `${info.hh}:${info.mm}:${info.ss}`;

  return (
    <div className="flex flex-col items-center gap-1 text-center">
      {label && (
        <span className="text-xs uppercase tracking-[0.2em] text-ink-faint font-medium mb-1">
          {label}
        </span>
      )}
      <div
        className={`text-4xl sm:text-5xl ${fontClass}`}
        style={{ color: font === 'led' ? accentColor : 'var(--ink)' }}
      >
        {timeString}
        {format === '12' && (
          <span className="text-lg sm:text-xl ml-2 align-middle text-ink-dim font-medium">
            {info.meridiem}
          </span>
        )}
      </div>
      <div className="text-sm text-ink-dim font-medium">{info.dateLabel}</div>
      <div className="text-xs text-ink-faint tracking-wide">{info.offsetLabel}</div>
    </div>
  );
}
