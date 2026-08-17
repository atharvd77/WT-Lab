import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SlidersHorizontal,
  ChevronDown,
  Clock,
  CalendarClock,
  Globe2,
  AlarmClock,
  Palette,
  Sun,
  Moon,
  Zap,
  Check,
} from 'lucide-react';
import { fontOptions } from './DigitalClock.jsx';

const MODULE_DEFS = [
  { key: 'analog', label: 'Analog Clock Module', icon: Clock },
  { key: 'digital', label: 'Digital Clock Module', icon: CalendarClock },
  { key: 'timezones', label: 'Timezone Management Module', icon: Globe2 },
  { key: 'alarms', label: 'Alarm System Module', icon: AlarmClock },
  { key: 'customization', label: 'Visual Customization Panel', icon: Palette },
];

const THEMES = [
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'cyberpunk', label: 'Cyberpunk', icon: Zap },
];

const ACCENTS = {
  dark: ['#c98a4b', '#7fb3a8', '#c96b6b', '#8a8fc9'],
  light: ['#a85f2e', '#3f7a6e', '#a34747', '#5a5fa8'],
  cyberpunk: ['#ff2bd6', '#00ffe1', '#ffe600', '#7c4dff'],
};

function Toggle({ checked, onChange, accentColor, label }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className="relative w-10 h-6 rounded-full shrink-0 transition-colors"
      style={{ background: checked ? accentColor : 'var(--surface-sunken)' }}
    >
      <motion.span
        layout
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow"
        animate={{ left: checked ? 18 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
      />
    </button>
  );
}

export default function ControlPanel({
  modules,
  onToggleModule,
  theme,
  onThemeChange,
  accentColor,
  onAccentChange,
  format,
  onFormatChange,
  font,
  onFontChange,
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="card-edge bg-surface rounded-3xl shadow-panel overflow-hidden">
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="w-full flex items-center justify-between px-5 sm:px-6 py-4"
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={18} style={{ color: accentColor }} />
          <span className="font-display font-semibold text-lg text-ink">Control Panel</span>
        </div>
        <motion.span animate={{ rotate: collapsed ? -90 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={18} className="text-ink-faint" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-5 sm:px-6 pb-6 flex flex-col gap-6">
              {/* Module toggles */}
              <div>
                <h3 className="text-xs uppercase tracking-[0.15em] text-ink-faint font-semibold mb-3">
                  Modules
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {MODULE_DEFS.map(({ key, label, icon: Icon }) => (
                    <div
                      key={key}
                      className="flex items-center justify-between card-edge bg-surface-raised rounded-xl px-3.5 py-2.5"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Icon size={15} className="text-ink-faint shrink-0" />
                        <span className="text-sm text-ink truncate">{label}</span>
                      </div>
                      <Toggle
                        checked={modules[key]}
                        onChange={() => onToggleModule(key)}
                        accentColor={accentColor}
                        label={`Toggle ${label}`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Visual Customization Panel — itself a toggleable module */}
              <AnimatePresence initial={false}>
                {modules.customization && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: 'easeInOut' }}
                    className="overflow-hidden flex flex-col gap-6"
                  >
                    <div>
                      <h3 className="text-xs uppercase tracking-[0.15em] text-ink-faint font-semibold mb-3">
                        Theme
                      </h3>
                      <div className="flex gap-2 flex-wrap">
                        {THEMES.map(({ id, label, icon: Icon }) => (
                          <button
                            key={id}
                            onClick={() => onThemeChange(id)}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium card-edge transition-colors"
                            style={{
                              background: theme === id ? accentColor : 'var(--surface-raised)',
                              color: theme === id ? '#fff' : 'var(--ink)',
                            }}
                          >
                            <Icon size={14} />
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs uppercase tracking-[0.15em] text-ink-faint font-semibold mb-3">
                        Accent Color
                      </h3>
                      <div className="flex gap-2.5">
                        {(ACCENTS[theme] || ACCENTS.dark).map((c) => (
                          <button
                            key={c}
                            onClick={() => onAccentChange(c)}
                            aria-label={`Accent color ${c}`}
                            className="w-8 h-8 rounded-full flex items-center justify-center card-edge"
                            style={{ background: c }}
                          >
                            {accentColor === c && <Check size={14} color="#fff" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-xs uppercase tracking-[0.15em] text-ink-faint font-semibold mb-3">
                          Time Format
                        </h3>
                        <div className="flex gap-2">
                          {['24', '12'].map((f) => (
                            <button
                              key={f}
                              onClick={() => onFormatChange(f)}
                              className="px-3.5 py-2 rounded-xl text-sm font-medium card-edge"
                              style={{
                                background: format === f ? accentColor : 'var(--surface-raised)',
                                color: format === f ? '#fff' : 'var(--ink)',
                              }}
                            >
                              {f}-hour
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xs uppercase tracking-[0.15em] text-ink-faint font-semibold mb-3">
                          Digital Font
                        </h3>
                        <div className="flex gap-2 flex-wrap">
                          {fontOptions().map((f) => (
                            <button
                              key={f.id}
                              onClick={() => onFontChange(f.id)}
                              className="px-3 py-2 rounded-xl text-xs font-medium card-edge"
                              style={{
                                background: font === f.id ? accentColor : 'var(--surface-raised)',
                                color: font === f.id ? '#fff' : 'var(--ink)',
                              }}
                            >
                              {f.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
