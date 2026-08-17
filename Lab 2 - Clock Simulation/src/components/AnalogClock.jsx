import React, { useMemo } from 'react';
import { useClock } from '../hooks/useClock.js';

/**
 * AnalogClock — SVG face with continuously sweeping hands.
 * Subscribes to the shared clock engine at 'frame' precision so its hands
 * glide smoothly, while sibling components (digital readouts, alarm lists)
 * remain on the cheaper 'second' precision and are unaffected.
 */
export default function AnalogClock({
  timeZone,
  size = 280,
  accentColor = 'var(--accent)',
  showNumerals = true,
  label,
}) {
  const { hoursFraction, minutesFraction, secondsFraction } = useClock({
    precision: 'frame',
    timeZone,
  });

  const cx = 150;
  const cy = 150;
  const r = 140;

  const hourAngle = hoursFraction * 30; // 360/12
  const minuteAngle = minutesFraction * 6; // 360/60
  const secondAngle = secondsFraction * 6;

  const ticks = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 60; i++) {
      const angle = i * 6;
      const isHour = i % 5 === 0;
      const outer = r - 6;
      const inner = isHour ? r - 20 : r - 12;
      arr.push({ angle, outer, inner, isHour, key: i });
    }
    return arr;
  }, [r]);

  const point = (angleDeg, radius) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad),
    };
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <svg
        viewBox="0 0 300 300"
        width={size}
        height={size}
        role="img"
        aria-label={label ? `Analog clock for ${label}` : 'Analog clock'}
        className="drop-shadow-[0_8px_30px_rgba(0,0,0,0.25)]"
      >
        <defs>
          <radialGradient id={`face-${size}`} cx="50%" cy="42%" r="70%">
            <stop offset="0%" stopColor="var(--surface-raised)" />
            <stop offset="100%" stopColor="var(--surface-sunken)" />
          </radialGradient>
        </defs>

        {/* Outer rim */}
        <circle cx={cx} cy={cy} r={r + 8} fill="none" stroke="var(--edge)" strokeWidth="1" />
        <circle cx={cx} cy={cy} r={r} fill={`url(#face-${size})`} stroke={accentColor} strokeWidth="2" />

        {/* Ticks */}
        {ticks.map((t) => {
          const p1 = point(t.angle, t.outer);
          const p2 = point(t.angle, t.inner);
          return (
            <line
              key={t.key}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke={t.isHour ? accentColor : 'var(--ink-faint)'}
              strokeWidth={t.isHour ? 2.5 : 1}
              strokeLinecap="round"
            />
          );
        })}

        {/* Numerals */}
        {showNumerals &&
          [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((n, idx) => {
            const p = point(idx * 30, r - 34);
            return (
              <text
                key={n}
                x={p.x}
                y={p.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="15"
                fontFamily="'Space Grotesk', sans-serif"
                fontWeight="600"
                fill="var(--ink-dim)"
              >
                {n}
              </text>
            );
          })}

        {/* Hour hand */}
        <line
          x1={cx}
          y1={cy}
          x2={point(hourAngle, r * 0.5).x}
          y2={point(hourAngle, r * 0.5).y}
          stroke="var(--ink)"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Minute hand */}
        <line
          x1={cx}
          y1={cy}
          x2={point(minuteAngle, r * 0.74).x}
          y2={point(minuteAngle, r * 0.74).y}
          stroke="var(--ink)"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Second hand — smooth, rAF-driven */}
        <line
          x1={cx}
          y1={cy}
          x2={point(secondAngle, r * 0.82).x}
          y2={point(secondAngle, r * 0.82).y}
          stroke={accentColor}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <line
          x1={point(secondAngle + 180, r * 0.18).x}
          y1={point(secondAngle + 180, r * 0.18).y}
          x2={cx}
          y2={cy}
          stroke={accentColor}
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Hub */}
        <circle cx={cx} cy={cy} r="6" fill={accentColor} />
        <circle cx={cx} cy={cy} r="2.2" fill="var(--surface)" />
      </svg>
      {label && (
        <span className="text-xs uppercase tracking-[0.2em] text-ink-faint font-medium">
          {label}
        </span>
      )}
    </div>
  );
}
