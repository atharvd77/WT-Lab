/**
 * AlarmSound — synthesizes an alarm chime entirely with the Web Audio API.
 * No external audio assets required. Produces a two-tone bell pattern that
 * loops until `stop()` is called.
 */
class AlarmSound {
  constructor() {
    this.ctx = null;
    this.timeouts = [];
    this.playing = false;
  }

  _ensureContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /** Plays a single soft bell tone (used for UI feedback, e.g. "test sound"). */
  playTone(frequency = 880, duration = 0.35, when = 0, volume = 0.18) {
    const ctx = this._ensureContext();
    const start = ctx.currentTime + when;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.value = 3200;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, start);

    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(volume, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(start);
    osc.stop(start + duration + 0.05);
  }

  _playChimePattern() {
    // A bright two-note bell, repeated with a short pause — classic alarm cadence.
    this.playTone(1046.5, 0.28, 0, 0.22); // C6
    this.playTone(1318.5, 0.32, 0.16, 0.22); // E6
    this.playTone(1046.5, 0.28, 0.75, 0.18);
    this.playTone(1318.5, 0.32, 0.91, 0.18);
  }

  /** Starts looping the chime pattern every `intervalMs` until stop() is called. */
  start(intervalMs = 1400) {
    if (this.playing) return;
    this.playing = true;
    this._ensureContext();

    const loop = () => {
      if (!this.playing) return;
      this._playChimePattern();
      const id = setTimeout(loop, intervalMs);
      this.timeouts.push(id);
    };
    loop();
  }

  stop() {
    this.playing = false;
    this.timeouts.forEach(clearTimeout);
    this.timeouts = [];
  }
}

export const alarmSound = new AlarmSound();
