
export class AudioService {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  constructor() {
    // Lazy initialization handled in init()
  }

  // Initialize AudioContext on first user interaction to bypass autoplay policy
  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.4; // Slightly lower master volume to prevent clipping
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private createNoiseBuffer(): AudioBuffer | null {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * 2; // 2 seconds
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  // --- SOUND EFFECTS ---

  /**
   * "Mrrrp?" - The Trill sound cats make when walking or greeting.
   * Uses FM synthesis (LFO modulates pitch).
   */
  playTrill() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    // The "Rrr" part comes from vibrating the pitch
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(500, t);
    osc.frequency.linearRampToValueAtTime(800, t + 0.2); // Pitch goes up

    lfo.type = 'sine';
    lfo.frequency.value = 30; // 30Hz flutter
    lfoGain.gain.value = 50; // Depth of flutter

    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    osc.connect(gain);
    gain.connect(this.masterGain);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.2, t + 0.05);
    gain.gain.linearRampToValueAtTime(0, t + 0.25);

    osc.start(t);
    lfo.start(t);
    osc.stop(t + 0.3);
    lfo.stop(t + 0.3);
  }

  playMeow(type: 'greeting' | 'demanding' | 'grumpy' | 'happy' = 'greeting') {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    // Add a filter to simulate the mouth opening "Me-ow"
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.Q.value = 1;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    if (type === 'greeting' || type === 'happy') {
        // High pitched cute "Mew!"
        osc.type = 'triangle'; // Triangle is softer than sawtooth
        
        // Pitch Envelope: Start mid, go high, drop slightly
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.exponentialRampToValueAtTime(1400, t + 0.15);
        osc.frequency.linearRampToValueAtTime(1200, t + 0.3);

        // Filter Envelope: Open up
        filter.frequency.setValueAtTime(800, t);
        filter.frequency.linearRampToValueAtTime(2000, t + 0.2);

        // Volume Envelope
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.2, t + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
        
        osc.start(t);
        osc.stop(t + 0.35);

    } else if (type === 'demanding') {
        // Longer "Meee-ooow?" for food
        osc.type = 'sawtooth'; // Slightly buzzier
        
        osc.frequency.setValueAtTime(600, t);
        osc.frequency.linearRampToValueAtTime(1100, t + 0.4); // Rising pitch usually sounds like a question/demand
        osc.frequency.linearRampToValueAtTime(900, t + 0.6);

        filter.frequency.setValueAtTime(1000, t);
        filter.frequency.linearRampToValueAtTime(2500, t + 0.3);

        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.2, t + 0.1);
        gain.gain.linearRampToValueAtTime(0.1, t + 0.5);
        gain.gain.linearRampToValueAtTime(0, t + 0.8);

        osc.start(t);
        osc.stop(t + 0.8);

    } else {
        // Grumpy / Poked "Hiss/Yowl"
        osc.type = 'sawtooth';
        
        // Sharp drop
        osc.frequency.setValueAtTime(400, t);
        osc.frequency.exponentialRampToValueAtTime(200, t + 0.3);

        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.2, t + 0.05); // Fast attack
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

        osc.start(t);
        osc.stop(t + 0.35);
    }
  }

  playPurr() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    
    // Purr is essentially amplitude modulated noise + low sine
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    // LFO for the "rattle" rhythm
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();

    osc.type = 'triangle'; // Softer rumble
    osc.frequency.value = 28; // Deep rumble freq

    lfo.type = 'sine';
    lfo.frequency.value = 24; // Rattle speed
    
    // Connect LFO to modulate volume of the main osc
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);
    
    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    lfo.start(t);
    
    // Envelope for the whole purr session
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.15, t + 1.0);
    gain.gain.linearRampToValueAtTime(0, t + 3.0);

    // Fade out LFO depth too so it doesn't click
    lfoGain.gain.setValueAtTime(0.1, t);
    lfoGain.gain.linearRampToValueAtTime(0, t + 3.0);

    osc.stop(t + 3.0);
    lfo.stop(t + 3.0);
  }

  playEating() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    
    const buffer = this.createNoiseBuffer();
    if (!buffer) return;

    // Crunch, crunch, crunch
    for(let i=0; i<4; i++) {
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1200;

        const gain = this.ctx.createGain();
        
        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        // Randomize timing slightly for realism
        const start = t + (i * 0.2) + (Math.random() * 0.05);
        
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.15, start + 0.05);
        gain.gain.linearRampToValueAtTime(0, start + 0.15);
        
        source.start(start);
        source.stop(start + 0.16);
    }
  }

  playDrinking() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;

    const buffer = this.createNoiseBuffer();
    if (!buffer) return;

    for(let i=0; i<5; i++) {
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        
        // Bandpass sweeps to sound like liquid
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.Q.value = 8;
        filter.frequency.setValueAtTime(400, t);
        filter.frequency.linearRampToValueAtTime(900, t + 0.2); // Upward sweep = slurp

        const gain = this.ctx.createGain();
        
        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        const start = t + (i * 0.25);
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.2, start + 0.05);
        gain.gain.linearRampToValueAtTime(0, start + 0.2);
        
        source.start(start);
        source.stop(start + 0.25);
    }
  }

  playDigging() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const buffer = this.createNoiseBuffer();
    if(!buffer) return;

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 600;

    const gain = this.ctx.createGain();
    
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.08, t + 0.2);
    gain.gain.linearRampToValueAtTime(0, t + 1.2);

    source.start(t);
    source.stop(t + 1.5);
  }

  playSnore() {
      this.init();
      if (!this.ctx || !this.masterGain) return;
      const t = this.ctx.currentTime;
      
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(45, t); // Low pitch
      osc.frequency.linearRampToValueAtTime(35, t + 1.5); // Pitch drops on exhale

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 150; // Muffled

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.08, t + 0.5);
      gain.gain.linearRampToValueAtTime(0, t + 1.5);

      osc.start(t);
      osc.stop(t + 1.5);
  }

  playScratching() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    
    const buffer = this.createNoiseBuffer();
    if (!buffer) return;

    for(let i=0; i<8; i++) {
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 3000;
        filter.Q.value = 5;

        const gain = this.ctx.createGain();
        
        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        const start = t + (i * 0.1);
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.1, start + 0.02);
        gain.gain.linearRampToValueAtTime(0, start + 0.1);
        
        source.start(start);
        source.stop(start + 0.11);
    }
  }

  playSinging() {
      this.init();
      if (!this.ctx) return;
      this.playMeow('happy');
      setTimeout(() => this.playMeow('greeting'), 400);
      setTimeout(() => this.playTrill(), 700);
      setTimeout(() => this.playMeow('happy'), 1000);
  }

  playSplash() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    
    const buffer = this.createNoiseBuffer();
    if (!buffer) return;

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    
    // High pass + bandpass for water splash
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;

    const gain = this.ctx.createGain();
    
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.2, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
    
    source.start(t);
    source.stop(t + 0.5);
  }
}

export const audioService = new AudioService();
