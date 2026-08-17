# Clock Simulation - Project Requirements

---

## AIM

To develop an **advanced, feature-rich clock simulation application** that provides users with a comprehensive time management and visualization platform. The project aims to create a fully functional web-based application that combines multiple clock representations (analog and digital), timezone management, alarm functionality, and visual customization options. The application should demonstrate modern web development practices including state management, performance optimization, and responsive user interface design while maintaining a polished, professional user experience.

---

## OBJECTIVES

### Primary Objectives

1. **Create Multiple Clock Representations**
   - Implement a high-fidelity **Analog Clock** with continuously sweeping second hand using `requestAnimationFrame` for smooth, jitter-free animation
   - Develop a **Digital Clock** with HH:MM:SS readout supporting both 12-hour and 24-hour time formats
   - Display comprehensive time information including date, weekday, and UTC offset
   - Support multiple font styles (Minimal Modern, Monospace, Digital LED) for digital clock display

2. **Implement Global Timezone Management**
   - Create a searchable **Timezone Manager** with city/country selector powered by `Intl.DateTimeFormat` API
   - Enable users to add, remove, and manage multiple world-clock cards displaying different timezones
   - Calculate and display time offsets relative to local timezone
   - Provide real-time timezone conversion for all managed locations

3. **Develop Alarm System with Audio Notifications**
   - Build a complete **Alarm Manager** with create, edit, delete, and toggle functionality for multiple alarms
   - Implement a **Web Audio API-based chime generator** that creates alarm sounds without external audio files
   - Design an interactive **Alarm Modal** with Dismiss and Snooze (5-minute) options when alarm fires
   - Persist all alarm data to browser's `localStorage` for continuity across sessions

4. **Implement Data Persistence and State Management**
   - Create a **custom `usePersistentState` hook** to automatically sync component state with `localStorage`
   - Ensure all user preferences (module visibility, theme, accent color, time format, font) persist across browser sessions
   - Implement robust error handling for storage operations

5. **Optimize Performance and User Experience**
   - Design a **single shared `requestAnimationFrame` loop** (`useClock.js`) that powers all clocks on the page
   - Implement **precision-based subscription system**: components subscribe at either `'frame'` precision (smooth analog sweep) or `'second'` precision (digital displays, timezone cards, alarms)
   - Eliminate unnecessary re-renders by ensuring components only update when their precision interval is reached
   - Remove all `setInterval` calls in favor of RAF-driven updates for consistent frame timing

### Secondary Objectives

6. **Provide Visual Customization Options**
   - Support multiple theme options: **Dark, Light, and Cyberpunk/Neon** themes
   - Allow users to customize accent colors from a predefined palette or custom color picker
   - Implement smooth theme transitions with minimal performance impact
   - Ensure accessibility and readability across all theme options

7. **Create Intuitive Control Interface**
   - Build a **collapsible Control Panel** that allows users to show/hide individual modules
   - Provide checkboxes for toggling visibility of: Analog Clock, Digital Clock, Timezones, Alarms, and Visual Customization
   - Implement smooth animations for module appearance/disappearance using Framer Motion
   - Display header with application branding and module toggle status

8. **Ensure Responsive and Adaptive Design**
   - Build a mobile-responsive interface using Tailwind CSS utility classes
   - Optimize layout for various screen sizes (mobile, tablet, desktop)
   - Implement flexible grid and spacing systems for proper content alignment
   - Ensure all interactive elements are touch-friendly and properly spaced

---

## SOFTWARE REQUIREMENTS

### Development Environment

- **Node.js**: v16.x or higher
- **npm**: v8.x or higher
- **Code Editor**: VS Code or equivalent (with JSX/React syntax support recommended)

### Frontend Framework & Libraries

- **React**: v18.3.1 or higher
  - Core library for building UI components
  - Supports React Hooks (`useState`, `useEffect`, `useContext`, custom hooks)
  - JSX syntax for component definition

- **Vite**: v5.3.5 or higher
  - Modern build tool and development server
  - Fast ES module-based development
  - Optimized production builds with code splitting

- **Framer Motion**: v11.3.19 or higher
  - Animation and motion effects library
  - Smooth component transitions and entrance/exit animations
  - AnimatePresence component for mounting/unmounting animations

- **Lucide React**: v0.424.0 or higher
  - Icon library with React components
  - Provides SVG-based icons for UI elements

### Styling & CSS

- **Tailwind CSS**: v3.4.7 or higher
  - Utility-first CSS framework
  - Pre-configured with color schemes, spacing, and responsive breakpoints
  - Custom theme configuration support

- **PostCSS**: v8.4.40 or higher
  - CSS transformation tool
  - Enables Tailwind CSS compilation

- **Autoprefixer**: v10.4.19 or higher
  - Automatically adds vendor prefixes to CSS rules
  - Ensures cross-browser compatibility

### Built-in Browser APIs (No External Dependencies)

- **Web Audio API**
  - Generate alarm chime sounds programmatically
  - No external audio files required
  - Support for oscillators and audio context nodes

- **Intl API (Internationalization)**
  - `Intl.DateTimeFormat` for timezone and locale-aware date/time formatting
  - Timezone list generation from browser's supported locales

- **LocalStorage**
  - Persist user preferences and alarm data
  - Key-value pair storage for application state
  - 5-10MB storage quota per domain

- **requestAnimationFrame (RAF)**
  - Synchronized animation loop for smooth frame-based updates
  - Better performance than `setInterval` for time-critical updates
  - Automatic pausing when tab loses focus

### Project Structure

```
src/
├── App.jsx                          # Main application component
├── index.css                        # Global styles
├── main.jsx                         # React entry point
├── components/
│   ├── AlarmManager.jsx            # Alarm creation and management
│   ├── AlarmModal.jsx              # Alarm firing notification
│   ├── AnalogClock.jsx             # SVG-based analog clock
│   ├── ControlPanel.jsx            # Module visibility toggles
│   ├── DigitalClock.jsx            # Digital time display
│   └── TimezoneManager.jsx         # World clock management
├── hooks/
│   ├── useClock.js                 # Shared RAF-based time update hook
│   └── usePersistentState.js       # localStorage-backed state hook
└── utils/
    ├── audio.js                    # Web Audio API chime generator
    └── timezones.js                # Timezone utility functions
```

### Build Configuration Files

- **vite.config.js**: Vite configuration with React plugin
- **tailwind.config.js**: Tailwind CSS customization
- **postcss.config.js**: PostCSS and Tailwind processing
- **package.json**: Dependencies and build scripts
- **index.html**: Application entry point

### Scripts & Commands

- **`npm install`**: Install all project dependencies
- **`npm run dev`**: Start development server with hot module reloading (typically runs on `http://localhost:5173`)
- **`npm run build`**: Build optimized production bundle
- **`npm run preview`**: Preview production build locally

### Performance Requirements

- Smooth 60 FPS animation on modern devices
- No janky transitions or dropped frames
- Efficient memory usage with no memory leaks from RAF loops
- Minimal bundle size (gzip) through Vite tree-shaking

### Browser Compatibility

- **Chrome/Chromium**: Latest 2 versions
- **Firefox**: Latest 2 versions
- **Safari**: Latest 2 versions
- **Edge**: Latest 2 versions
- Requires support for:
  - ES6+ JavaScript
  - CSS Grid and Flexbox
  - Web Audio API
  - Intl API
  - LocalStorage

### Optional Enhancements (Future Scope)

- Push notifications for alarms
- Export alarm schedules as .ics files
- Integration with world news/weather for timezone cities
- Theme scheduling (auto-switch dark/light based on time)
- Keyboard shortcuts for common operations
- Mobile app versions (React Native)

---

## Summary

This Clock Simulation project is a modern, full-featured time management application that showcases advanced React patterns, Web APIs, and performance optimization techniques. It combines practical functionality (alarms, timezones) with visual polish (themes, animations) to create a professional, production-quality web application suitable for educational purposes and as a portfolio project demonstrating proficiency in contemporary web development practices.

---

**Created**: 2026-08-17  
**Project Version**: 1.0.0  
**Status**: Active Development
