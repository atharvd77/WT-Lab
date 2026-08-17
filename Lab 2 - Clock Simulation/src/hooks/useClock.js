import { useEffect, useMemo, useRef, useState } from 'react';

/**
 * ClockEngine
 * ------------
 * A single module-level requestAnimationFrame loop shared by the entire app.
 * No matter how many <AnalogClock />, <DigitalClock /> or timezone cards are
 * mounted, only ONE rAF loop (and zero setInterval calls) ever runs. Each
 * consumer subscribes and decides for itself how often it actually needs to
 * re-render (see `precision` below), so a smoothly sweeping second hand does
 * not force unrelated components to re-render 60 times a second.
 */
class ClockEngine {
  constructor() {
    this.time = new Date();
    this.listeners = new Set();
    this.rafId = null;
    this._tick = this._tick.bind(this);
  }

  _tick() {
    this.time = new Date();
    this.listeners.forEach((fn) => fn(this.time));
    this.rafId = requestAnimationFrame(this._tick);
  }

  subscribe(fn) {
    if (this.listeners.size === 0 && this.rafId === null) {
      this.rafId = requestAnimationFrame(this._tick);
    }
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
      if (this.listeners.size === 0 && this.rafId !== null) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
    };
  }

  getTime() {
    return this.time;
  }
}

const engine = typeof window !== 'undefined' ? new ClockEngine() : null;

/** Resolves the local IANA timezone once (cheap, cached by the JS engine). */
export const LOCAL_TIME_ZONE = typeof Intl !== 'undefined'
  ? Intl.DateTimeFormat().resolvedOptions().timeZone
  : 'UTC';

/** Computes the UTC offset (in minutes) of `timeZone` at instant `date`. */
export function getTimeZoneOffsetMinutes(date, timeZone) {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const parts = dtf.formatToParts(date).reduce((acc, p) => {
    acc[p.type] = p.value;
    return acc;
  }, {});
  const hour = parts.hour === '24' ? 0 : Number(parts.hour);
  const asUTC = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    hour,
    Number(parts.minute),
    Number(parts.second)
  );
  return Math.round((asUTC - date.getTime()) / 60000);
}

function formatOffsetLabel(offsetMinutes) {
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const abs = Math.abs(offsetMinutes);
  const hh = String(Math.floor(abs / 60)).padStart(2, '0');
  const mm = String(abs % 60).padStart(2, '0');
  return `UTC${sign}${hh}:${mm}`;
}

/**
 * Derives all zone-aware, render-ready fields for a given instant.
 * Pure function — safe to memoize on [date, timeZone].
 */
export function getZonedInfo(date, timeZone) {
  const tz = timeZone || LOCAL_TIME_ZONE;

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    weekday: 'long',
  }).formatToParts(date).reduce((acc, p) => {
    acc[p.type] = p.value;
    return acc;
  }, {});

  let hours = Number(parts.hour);
  if (hours === 24) hours = 0;
  const minutes = Number(parts.minute);
  const seconds = Number(parts.second);
  const ms = date.getMilliseconds();

  const secondsFraction = seconds + ms / 1000;
  const minutesFraction = minutes + secondsFraction / 60;
  const hoursFraction = (hours % 12) + minutesFraction / 60;

  const offsetMinutes = getTimeZoneOffsetMinutes(date, tz);

  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  const meridiem = hours >= 12 ? 'PM' : 'AM';

  return {
    timeZone: tz,
    year: parts.year,
    month: parts.month,
    day: parts.day,
    weekday: parts.weekday,
    hours,
    hour12,
    meridiem,
    minutes,
    seconds,
    ms,
    hoursFraction,
    minutesFraction,
    secondsFraction,
    offsetMinutes,
    offsetLabel: formatOffsetLabel(offsetMinutes),
    hh: String(hours).padStart(2, '0'),
    hh12: String(hour12).padStart(2, '0'),
    mm: String(minutes).padStart(2, '0'),
    ss: String(seconds).padStart(2, '0'),
    dateLabel: `${parts.weekday}, ${parts.month}/${parts.day}/${parts.year}`,
  };
}

/**
 * useClock — subscribe a component to the shared clock engine.
 *
 * @param {'frame'|'second'} precision
 *   'frame'  -> re-render every animation frame (smooth sweeping hands)
 *   'second' -> re-render only when the second value changes (digital
 *               displays, lists, alarms — much cheaper)
 * @param {string} [timeZone] IANA zone id; defaults to the local zone.
 */
export function useClock({ precision = 'second', timeZone } = {}) {
  const timeRef = useRef(engine ? engine.getTime() : new Date());
  const lastSecondRef = useRef(-1);
  const [, bump] = useState(0);

  useEffect(() => {
    if (!engine) return undefined;
    const handleTick = (now) => {
      timeRef.current = now;
      if (precision === 'frame') {
        bump((n) => (n + 1) % 1_000_000);
        return;
      }
      const sec = now.getSeconds();
      if (sec !== lastSecondRef.current) {
        lastSecondRef.current = sec;
        bump((n) => (n + 1) % 1_000_000);
      }
    };
    return engine.subscribe(handleTick);
  }, [precision]);

  const zoned = useMemo(
    () => getZonedInfo(timeRef.current, timeZone),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [timeRef.current, timeZone]
  );

  return { date: timeRef.current, ...zoned };
}
