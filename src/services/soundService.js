// Web Audio API Synthesizer for offline sound effects
import { broadcastBus } from '../utils/broadcastChannel';

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.volume = 0.8;
    this.activeNodes = new Set();

    // Default to stored mute preference, default true if not set
    if (typeof window !== 'undefined') {
      try {
        const isMuted = localStorage.getItem('spl_audio_muted') === 'true';
        this.enabled = !isMuted;
      } catch {
        this.enabled = true;
      }
      this.setupAutoUnlock();
      this.setupSync();
    } else {
      this.enabled = true;
    }
  }

  setupAutoUnlock() {
    if (typeof window === 'undefined') return;
    const unlock = () => {
      this.init();
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    };
    window.addEventListener('click', unlock, { once: true, passive: true });
    window.addEventListener('keydown', unlock, { once: true, passive: true });
    window.addEventListener('touchstart', unlock, { once: true, passive: true });
  }

  setupSync() {
    if (typeof window === 'undefined') return;

    // 1. Cross-tab storage event
    window.addEventListener('storage', (e) => {
      if (e.key === 'spl_audio_muted') {
        const isMuted = e.newValue === 'true';
        this.setEnabled(!isMuted, false);
      }
    });

    // 2. Same-window custom event
    window.addEventListener('audio-settings-updated', (e) => {
      if (e.detail && typeof e.detail.muted === 'boolean') {
        this.setEnabled(!e.detail.muted, false);
      }
    });

    // 3. BroadcastChannel cross-window sync
    try {
      broadcastBus.subscribe((msg) => {
        if (msg.type === 'AUDIO_SETTINGS_CHANGED') {
          const isMuted = Boolean(msg.payload?.muted);
          this.setEnabled(!isMuted, false);
        }
      });
    } catch (e) {
      // Ignore broadcast errors
    }
  }

  init() {
    if (typeof window === 'undefined') return null;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;

      if (!this.ctx || this.ctx.state === 'closed') {
        this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    } catch (e) {
      console.warn('AudioContext initialization error:', e);
      return null;
    }
  }

  async resumeContext() {
    const ctx = this.init();
    if (ctx && ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch (err) {
        console.warn('AudioContext resume error:', err);
      }
    }
    return ctx;
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  setEnabled(flag, sync = true) {
    this.enabled = Boolean(flag);

    if (!this.enabled) {
      // Immediately silence and stop any ongoing active sound nodes
      this.activeNodes.forEach(node => {
        try {
          if (node.stop) node.stop();
          if (node.disconnect) node.disconnect();
        } catch (_) {}
      });
      this.activeNodes.clear();
    }

    if (sync && typeof window !== 'undefined') {
      try {
        const isMuted = !this.enabled;
        localStorage.setItem('spl_audio_muted', String(isMuted));
        window.dispatchEvent(new CustomEvent('audio-settings-updated', { detail: { muted: isMuted } }));
        broadcastBus.publish('AUDIO_SETTINGS_CHANGED', { muted: isMuted });
      } catch (_) {}
    }
  }

  isEnabled() {
    return Boolean(this.enabled);
  }

  trackNode(node) {
    if (!node) return;
    this.activeNodes.add(node);
    const origEnded = node.onended;
    node.onended = (e) => {
      this.activeNodes.delete(node);
      if (typeof origEnded === 'function') origEnded(e);
    };
  }

  // Quick pleasant confirmation chime when audio is toggled ON
  playFeedbackTone() {
    if (!this.enabled) return;
    try {
      const ctx = this.init();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Note 1: C5 (523.25Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now);
      gain1.gain.setValueAtTime(this.volume * 0.22, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      this.trackNode(osc1);
      osc1.start(now);
      osc1.stop(now + 0.12);

      // Note 2: G5 (783.99Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(783.99, now + 0.08);
      gain2.gain.setValueAtTime(this.volume * 0.25, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      this.trackNode(osc2);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.28);
    } catch (e) {
      console.warn('Audio play feedback error:', e);
    }
  }

  playBidSound() {
    if (!this.enabled) return;
    try {
      const ctx = this.init();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now); // A4
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

      gain.gain.setValueAtTime(this.volume * 0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      this.trackNode(osc);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch (e) {
      console.warn('playBidSound error:', e);
    }
  }

  playWhistleSound() {
    if (!this.enabled) return;
    try {
      const ctx = this.init();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(2500, now);
      osc.frequency.linearRampToValueAtTime(2700, now + 0.1);
      osc.frequency.linearRampToValueAtTime(2400, now + 0.4);

      gain.gain.setValueAtTime(this.volume * 0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      this.trackNode(osc);
      osc.start(now);
      osc.stop(now + 0.45);
    } catch (e) {
      console.warn('playWhistleSound error:', e);
    }
  }

  playCountdownBeep() {
    if (!this.enabled) return;
    try {
      const ctx = this.init();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);

      gain.gain.setValueAtTime(this.volume * 0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      this.trackNode(osc);
      osc.start(now);
      osc.stop(now + 0.1);
    } catch (e) {
      console.warn('playCountdownBeep error:', e);
    }
  }

  playRevealSound() {
    if (!this.enabled) return;
    try {
      const ctx = this.init();
      if (!ctx) return;
      const now = ctx.currentTime;

      // 1. Low suspense drum/riser swell
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(110, now);
      osc1.frequency.exponentialRampToValueAtTime(320, now + 1.1);

      gain1.gain.setValueAtTime(0.01, now);
      gain1.gain.linearRampToValueAtTime(this.volume * 0.25, now + 0.9);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 1.25);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      this.trackNode(osc1);
      osc1.start(now);
      osc1.stop(now + 1.25);

      // 2. High energetic reveal chime chords at 1.15s
      const chimeNotes = [523.25, 659.25, 783.99, 1046.50]; // C Major Chord
      chimeNotes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + 1.15 + i * 0.03);

        gain.gain.setValueAtTime(0, now + 1.15 + i * 0.03);
        gain.gain.linearRampToValueAtTime(this.volume * 0.28, now + 1.15 + i * 0.03 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.15 + i * 0.03 + 0.7);

        osc.connect(gain);
        gain.connect(ctx.destination);
        this.trackNode(osc);
        osc.start(now + 1.15 + i * 0.03);
        osc.stop(now + 1.15 + i * 0.03 + 0.75);
      });
    } catch (e) {
      console.warn('playRevealSound error:', e);
    }
  }

  playSoldFanfare() {
    if (!this.enabled) return;
    try {
      const ctx = this.init();
      if (!ctx) return;
      const now = ctx.currentTime;

      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + i * 0.12);

        gain.gain.setValueAtTime(0, now + i * 0.12);
        gain.gain.linearRampToValueAtTime(this.volume * 0.3, now + i * 0.12 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        this.trackNode(osc);
        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 0.65);
      });
    } catch (e) {
      console.warn('playSoldFanfare error:', e);
    }
  }

  playUnsoldSound() {
    if (!this.enabled) return;
    try {
      const ctx = this.init();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.5);

      gain.gain.setValueAtTime(this.volume * 0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      this.trackNode(osc);
      osc.start(now);
      osc.stop(now + 0.5);
    } catch (e) {
      console.warn('playUnsoldSound error:', e);
    }
  }
}

export const soundEngine = new SoundEngine();
