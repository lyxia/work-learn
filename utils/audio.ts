// A simple synthesizer to create game-like sound effects without external files

class SoundEngine {
  private ctx: AudioContext | null = null;
  private bgmOscillators: OscillatorNode[] = [];
  private bgmGain: GainNode | null = null;
  private isMuted: boolean = false;

  constructor() {
    try {
      // Initialize on first user interaction usually, but we prepare the constructor
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
    } catch (e) {
      console.error("Web Audio API not supported", e);
    }
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play a simple beep/boop
  playTone(freq: number, type: OscillatorType, duration: number, volume: number = 0.1) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playClick() {
    // High pitched "pop"
    this.playTone(800, 'sine', 0.1, 0.1);
  }

  playSelect() {
    // A more bubbly sound
    this.playTone(400, 'triangle', 0.15, 0.1);
    setTimeout(() => this.playTone(600, 'triangle', 0.1, 0.1), 50);
  }

  playStart() {
    // Ascending arpeggio
    const now = this.ctx?.currentTime || 0;
    [440, 554, 659, 880].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'sine', 0.3, 0.15), i * 100);
    });
  }

  playSuccess() {
    // Victory fanfare
    [523.25, 659.25, 783.99, 1046.50, 783.99, 1046.50].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'square', 0.2, 0.1), i * 120);
    });
  }

  playChestOpen() {
    // Magical sparkle / glissando
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    // Sweep up
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.5);
    
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 1.0);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 1.0);
    
    // Add some random twinkles
    for(let i=0; i<5; i++) {
        setTimeout(() => this.playTone(1000 + Math.random()*1000, 'sine', 0.1, 0.05), i * 100);
    }
  }

  playRestComplete() {
    // Relaxing descending major 7th chord
    // Cmaj7: C(523) B(493) G(392) E(329)
    [523.25, 493.88, 392.00, 329.63].forEach((freq, i) => {
       setTimeout(() => this.playTone(freq, 'sine', 0.5, 0.05), i * 200);
    });
  }

  playCash() {
    // "Ka-ching!" - Two quick metallic/bell sounds
    this.playTone(1200, 'square', 0.1, 0.05);
    setTimeout(() => this.playTone(1600, 'square', 0.3, 0.05), 100);
  }

  playTick() {
    // Clock tick sound - short, sharp click
    this.playTone(1000, 'sine', 0.05, 0.08);
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }
}

export const soundEngine = new SoundEngine();