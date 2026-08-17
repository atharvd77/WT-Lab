# Chronarch — Advanced Clock Simulation

A fully functional clock simulation built with React 18, Tailwind CSS, Framer
Motion, and Lucide icons.

## Features

- **Control Panel** — collapsible panel with checkboxes to show/hide every
  module (Analog Clock, Digital Clock, Timezones, Alarms, Visual
  Customization). All choices persist to `localStorage`.
- **Analog Clock** — SVG face with a continuously sweeping second hand driven
  by `requestAnimationFrame` (no 1-second jumps), plus smoothly animated hour
  and minute hands.
- **Digital Clock** — `HH:MM:SS` readout, 12h/24h toggle, full date + weekday
  + UTC offset, and a font switcher (Minimal Modern / Monospace / Digital
  LED).
- **Timezone Manager** — searchable city/country selector (powered by
  `Intl.DateTimeFormat`), add/remove multiple world-clock cards, each showing
  its offset relative to your local time.
- **Alarm System** — create/edit/delete/toggle multiple alarms, a built-in
  Web Audio API chime generator (zero external audio files), a firing modal
  with **Dismiss** and **Snooze (5 min)**, and persistent storage.
- **Themes** — Dark, Light, and Cyberpunk/Neon, each with its own accent
  palette.
- **Performance** — a single shared `requestAnimationFrame` loop
  (`useClock.js`) powers every clock on the page. Components subscribe at
  either `'frame'` precision (smooth analog sweep) or `'second'` precision
  (digital displays, timezone cards, alarms), so no component re-renders more
  often than it needs to, and there isn't a single `setInterval` in the app.

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL (typically `http://localhost:5173`).

## Build for production

```bash
npm run build
npm run preview
```

## Project structure

```
src/
  hooks/
    useClock.js            # shared rAF clock engine + zone-aware time derivation
    usePersistentState.js  # useState that mirrors to localStorage
  utils/
    audio.js                # Web Audio API chime generator
    timezones.js             # searchable IANA timezone catalogue
  components/
    AnalogClock.jsx
    DigitalClock.jsx
    TimezoneManager.jsx
    AlarmManager.jsx
    AlarmModal.jsx
    ControlPanel.jsx
  App.jsx
  index.css
```

## Notes

- All settings (module visibility, theme, accent color, time format, font,
  alarms, and world clocks) are persisted in `localStorage`, so a page reload
  keeps everything exactly as you left it.
- The alarm chime is synthesized on the fly with `AudioContext` — there are
  no external audio assets to download or bundle.
