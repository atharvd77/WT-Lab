import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Watch } from "lucide-react";
import { usePersistentState } from "./hooks/usePersistentState.js";
import { LOCAL_TIME_ZONE } from "./hooks/useClock.js";

import ControlPanel from "./components/ControlPanel.jsx";
import AnalogClock from "./components/AnalogClock.jsx";
import DigitalClock from "./components/DigitalClock.jsx";
import TimezoneManager from "./components/TimezoneManager.jsx";
import AlarmManager from "./components/AlarmManager.jsx";

const DEFAULT_MODULES = {
  analog: true,
  digital: true,
  timezones: true,
  alarms: true,
  customization: true,
};

const sectionMotion = {
  initial: { opacity: 0, y: 16, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -12, scale: 0.98, transition: { duration: 0.18 } },
  transition: { type: "spring", stiffness: 260, damping: 26 },
};

export default function App() {
  const [modules, setModules] = usePersistentState(
    "clock:modules",
    DEFAULT_MODULES,
  );
  const [theme, setTheme] = usePersistentState("clock:theme", "dark");
  const [accentColor, setAccentColor] = usePersistentState(
    "clock:accent",
    "#c98a4b",
  );
  const [format, setFormat] = usePersistentState("clock:format", "24");
  const [font, setFont] = usePersistentState("clock:font", "modern");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleModule = (key) =>
    setModules((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="min-h-screen w-full pb-16">
      <header className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-6 flex items-center gap-3">
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: "var(--accent-soft)" }}
        >
          <Watch size={22} style={{ color: accentColor }} />
        </div>
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-ink leading-tight">
            Chronarch
          </h1>
          <p className="text-sm text-ink-faint">
            Precision clock simulation · local zone {LOCAL_TIME_ZONE}
          </p>
        </div>

        <div className="ml-auto flex flex-col items-end text-right">
          <span className="text-[10px] uppercase tracking-[0.2em] text-ink-faint">
            Student
          </span>
          <span className="font-semibold text-ink">Atharv Dubal</span>
          <span className="font-semibold text-ink">RollNO: 76</span>
          <span className="text-xs text-ink-faint">PRN: 12415024</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col gap-6">
        <ControlPanel
          modules={modules}
          onToggleModule={toggleModule}
          theme={theme}
          onThemeChange={setTheme}
          accentColor={accentColor}
          onAccentChange={setAccentColor}
          format={format}
          onFormatChange={setFormat}
          font={font}
          onFontChange={setFont}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <AnimatePresence>
            {modules.analog && (
              <motion.div
                key="analog"
                {...sectionMotion}
                className="card-edge bg-surface rounded-3xl p-6 sm:p-8 shadow-panel flex justify-center"
              >
                <AnalogClock
                  timeZone={undefined}
                  accentColor={accentColor}
                  label={LOCAL_TIME_ZONE}
                  size={280}
                />
              </motion.div>
            )}

            {modules.digital && (
              <motion.div
                key="digital"
                {...sectionMotion}
                className="card-edge bg-surface rounded-3xl p-6 sm:p-8 shadow-panel flex items-center justify-center"
              >
                <DigitalClock
                  timeZone={undefined}
                  format={format}
                  font={font}
                  accentColor={accentColor}
                  label="Local Time"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <AnimatePresence>
            {modules.timezones && (
              <motion.div key="timezones" {...sectionMotion}>
                <TimezoneManager format={format} accentColor={accentColor} />
              </motion.div>
            )}

            {modules.alarms && (
              <motion.div key="alarms" {...sectionMotion}>
                <AlarmManager format={format} accentColor={accentColor} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <footer className="max-w-6xl mx-auto px-4 sm:px-6 mt-10 text-center text-xs text-ink-faint">
        Built with React 18, Tailwind CSS &amp; Framer Motion — all clocks run
        off a single shared animation-frame engine.
      </footer>
    </div>
  );
}
