

export class AudioService {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  
  // BGM State
  private isPlayingBgm: boolean = false;
  private bgmInterval: number | null = null;
  private bgmNoteIndex: number = 0;
  private bgmGain: GainNode | null = null;

  constructor() {
    // Lazy initialization handled in init()
  }

  // Initialize AudioContext on first user interaction to bypass autoplay policy
  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 1.2; // Boosted volume
      this.masterGain.connect(this.ctx.destination);

      // Dedicated BGM Gain for mixing
      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.value = 0.4; // Background music is softer
      this.bgmGain.connect(this.masterGain);
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

  playBoing() {
      if (!this.ctx || !this.masterGain) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, t);
      osc.frequency.exponentialRampToValueAtTime(600, t + 0.4);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.5, t + 0.05);
      gain.gain.linearRampToValueAtTime(0, t + 0.4);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.5);
  }

  playZap() {
       if (!this.ctx || !this.masterGain) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.exponentialRampToValueAtTime(100, t + 0.3);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.35);
  }

  playDrop() {
       if (!this.ctx || !this.masterGain) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1000, t);
      osc.frequency.linearRampToValueAtTime(300, t + 0.6);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.2, t + 0.1);
      gain.gain.linearRampToValueAtTime(0, t + 0.6);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.7);
  }

  playCrash() {
       if (!this.ctx || !this.masterGain) return;
      const t = this.ctx.currentTime;
      const buffer = this.createNoiseBuffer();
      if (!buffer) return;

      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      const gain = this.ctx.createGain();

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 1000;

      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.8);

      source.start(t);
      source.stop(t + 1.0);
  }

  playAlarm() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    
    // Sci-Fi "Red Alert" Klaxon
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    
    osc.type = 'sawtooth';
    filter.type = 'lowpass';
    filter.Q.value = 5;

    // Siren sweep
    osc.frequency.setValueAtTime(400, t);
    filter.frequency.setValueAtTime(400, t);
    
    // 3 Pulses
    for (let i = 0; i < 6; i++) { 
        const start = t + i * 1.0;
        osc.frequency.linearRampToValueAtTime(800, start + 0.5);
        osc.frequency.linearRampToValueAtTime(400, start + 1.0);
        
        filter.frequency.linearRampToValueAtTime(1200, start + 0.5);
        filter.frequency.linearRampToValueAtTime(400, start + 1.0);
    }
    
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.linearRampToValueAtTime(0.4, t + 5.5);
    gain.gain.linearRampToValueAtTime(0, t + 6.0);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(t);
    osc.stop(t + 6.0);
  }

  playExplosion() {
      this.init();
      if (!this.ctx || !this.masterGain) return;
      const t = this.ctx.currentTime;
      
      const buffer = this.createNoiseBuffer();
      if (!buffer) return;

      // 1. Rumble (Low end)
      const source1 = this.ctx.createBufferSource();
      source1.buffer = buffer;
      const filter1 = this.ctx.createBiquadFilter();
      filter1.type = 'lowpass';
      filter1.frequency.setValueAtTime(100, t);
      filter1.frequency.linearRampToValueAtTime(10, t + 4.0);

      const gain1 = this.ctx.createGain();
      gain1.gain.setValueAtTime(1.0, t);
      gain1.gain.exponentialRampToValueAtTime(0.01, t + 4.0);

      source1.connect(filter1);
      filter1.connect(gain1);
      gain1.connect(this.masterGain);

      // 2. Crackle (High end)
      const source2 = this.ctx.createBufferSource();
      source2.buffer = buffer;
      const filter2 = this.ctx.createBiquadFilter();
      filter2.type = 'highpass';
      filter2.frequency.setValueAtTime(500, t);
      
      const gain2 = this.ctx.createGain();
      gain2.gain.setValueAtTime(0.8, t);
      gain2.gain.exponentialRampToValueAtTime(0.01, t + 1.5);

      source2.connect(filter2);
      filter2.connect(gain2);
      gain2.connect(this.masterGain);
      
      source1.start(t);
      source2.start(t);
      
      source1.stop(t + 4.0);
      source2.stop(t + 2.0);
  }

  playChirp() {
      this.init();
      if (!this.ctx || !this.masterGain) return;
      const t = this.ctx.currentTime;

      // "Ek ek ek" chatter sound
      for(let i=0; i<3; i++) {
          const start = t + i * 0.15;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          
          osc.type = 'square'; // Nasal sound
          osc.frequency.setValueAtTime(2000, start);
          osc.frequency.linearRampToValueAtTime(1500, start + 0.05);
          
          gain.gain.setValueAtTime(0, start);
          gain.gain.linearRampToValueAtTime(0.1, start + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.08);

          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(start);
          osc.stop(start + 0.1);
      }
  }

  playRustle() {
      this.init();
      if (!this.ctx || !this.masterGain) return;
      const t = this.ctx.currentTime;
      const buffer = this.createNoiseBuffer();
      if (!buffer) return;

      const source = this.ctx.createBufferSource();
      source.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 800;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.3, t + 0.1);
      gain.gain.linearRampToValueAtTime(0, t + 0.3);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      
      source.start(t);
      source.stop(t + 0.3);
  }

  playMagicEffect() {
      this.init();
      if (!this.ctx || !this.masterGain) return;
      const t = this.ctx.currentTime;

      // Sparkly Glissando
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, t);
      osc.frequency.exponentialRampToValueAtTime(1200, t + 0.3); // Up
      osc.frequency.linearRampToValueAtTime(2000, t + 0.6); // High sparkle

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.3, t + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.8);

      // Tremolo for sparkle
      const lfo = this.ctx.createOscillator();
      lfo.frequency.value = 15;
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 0.5;
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);

      osc.connect(gain);
      gain.connect(this.masterGain);
      
      osc.start(t);
      lfo.start(t);
      osc.stop(t + 0.8);
      lfo.stop(t + 0.8);
  }

  // --- BACKGROUND MUSIC (BGM) ---

  toggleBGM() {
    this.init();
    if (this.isPlayingBgm) {
        this.stopBGM();
    } else {
        this.startBGM();
    }
    return this.isPlayingBgm;
  }

  startBGM() {
      if (this.isPlayingBgm || !this.ctx) return;
      this.isPlayingBgm = true;
      this.bgmNoteIndex = 0;
      
      const bpm = 90;
      const stepTime = (60 / bpm) * 1000 / 2; // Eighth notes
      
      this.playNextBGMNote();
      this.bgmInterval = window.setInterval(() => this.playNextBGMNote(), stepTime);
  }

  stopBGM() {
      this.isPlayingBgm = false;
      if (this.bgmInterval) {
          clearInterval(this.bgmInterval);
          this.bgmInterval = null;
      }
  }

  private playNextBGMNote() {
      if (!this.ctx || !this.bgmGain) return;
      const t = this.ctx.currentTime;
      
      // Pattern: 16 step loop
      const step = this.bgmNoteIndex % 32;
      
      // --- DRUMS ---
      // Kick: 0, 6, 10 (syncopated)
      if (step % 8 === 0 || step % 16 === 10) this.playKick(t, 0.6);
      
      // Snare/Clap: 4, 12
      if (step % 8 === 4) this.playSnare(t, 0.3);
      
      // Hi-hat: Every 2 steps (eighths) + shuffle
      if (step % 2 === 0) {
           // Closed hat
           this.playHiHat(t, step % 4 === 0 ? 0.2 : 0.1); 
      }

      // --- CHORDS (Electric Piano Pad) ---
      // Progression: Cmaj7 - Em7 - Fmaj7 - G7 (4 bars each = 8 steps each)
      // Chords defined as array of freq
      const chords = [
          [261.63, 329.63, 392.00, 493.88], // Cmaj7 (C E G B)
          [164.81, 196.00, 246.94, 293.66], // Em7 (E G B D)
          [174.61, 220.00, 261.63, 329.63], // Fmaj7 (F A C E)
          [196.00, 246.94, 293.66, 349.23], // G7 (G B D F)
      ];

      // Change chord every 8 steps (1 bar)
      if (step % 8 === 0) {
          const chordIndex = Math.floor(step / 8) % 4;
          const notes = chords[chordIndex];
          
          notes.forEach((freq, i) => {
              const osc = this.ctx!.createOscillator();
              const gain = this.ctx!.createGain();
              osc.type = 'triangle'; // Soft tone
              osc.frequency.value = freq;
              
              osc.connect(gain);
              gain.connect(this.bgmGain!);
              
              // Pad Envelope (Slow attack, long sustain)
              const duration = 2.0; // 2 seconds (half bar approx)
              gain.gain.setValueAtTime(0, t);
              gain.gain.linearRampToValueAtTime(0.08, t + 0.1 + (i*0.05)); // Strum slightly
              gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
              
              osc.start(t);
              osc.stop(t + duration + 0.1);
          });
      }

      // --- MELODY (Plucks) ---
      // Play sparse random pentatonic notes
      if (Math.random() > 0.6 && step % 2 === 0) {
          const pentatonicC = [523.25, 587.33, 659.25, 783.99, 880.00]; // C D E G A (High octave)
          const freq = pentatonicC[Math.floor(Math.random() * pentatonicC.length)];
          
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq;
          
          osc.connect(gain);
          gain.connect(this.bgmGain);
          
          gain.gain.setValueAtTime(0, t);
          gain.gain.linearRampToValueAtTime(0.05, t + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
          
          osc.start(t);
          osc.stop(t + 0.4);
      }

      this.bgmNoteIndex++;
  }

  // --- DRUM HELPERS ---
  
  private playKick(t: number, vol: number) {
      if(!this.bgmGain) return;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.frequency.setValueAtTime(150, t);
      osc.frequency.exponentialRampToValueAtTime(50, t + 0.1);
      
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
      
      osc.connect(gain);
      gain.connect(this.bgmGain);
      osc.start(t);
      osc.stop(t + 0.1);
  }

  private playSnare(t: number, vol: number) {
      if(!this.bgmGain) return;
      const buffer = this.createNoiseBuffer();
      if(!buffer) return;
      
      const source = this.ctx!.createBufferSource();
      source.buffer = buffer;
      
      const filter = this.ctx!.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 1000;
      
      const gain = this.ctx!.createGain();
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
      
      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.bgmGain);
      source.start(t);
      source.stop(t + 0.1);
  }

  private playHiHat(t: number, vol: number) {
      if(!this.bgmGain) return;
      const buffer = this.createNoiseBuffer();
      if(!buffer) return;
      
      const source = this.ctx!.createBufferSource();
      source.buffer = buffer;
      
      const filter = this.ctx!.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 5000;
      
      const gain = this.ctx!.createGain();
      gain.gain.setValueAtTime(vol * 0.5, t); // quieter
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
      
      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.bgmGain);
      source.start(t);
      source.stop(t + 0.05);
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
    gain.gain.linearRampToValueAtTime(0.3, t + 0.05);
    gain.gain.linearRampToValueAtTime(0, t + 0.25);

    osc.start(t);
    lfo.start(t);
    osc.stop(t + 0.3);
    lfo.stop(t + 0.3);
  }

  playMeow(type: 'greeting' | 'demanding' | 'grumpy' | 'happy' | 'poked' = 'greeting') {
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
        gain.gain.linearRampToValueAtTime(0.3, t + 0.05);
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
        gain.gain.linearRampToValueAtTime(0.3, t + 0.1);
        gain.gain.linearRampToValueAtTime(0.2, t + 0.5);
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
        gain.gain.linearRampToValueAtTime(0.3, t + 0.05); // Fast attack
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
    gain.gain.linearRampToValueAtTime(0.2, t + 1.0);
    gain.gain.linearRampToValueAtTime(0, t + 3.0);

    // Fade out LFO depth too so it doesn't click
    lfoGain.gain.setValueAtTime(0.1, t);
    lfoGain.gain.linearRampToValueAtTime(0, t + 3.0);

    osc.stop(t + 3.0);
    lfo.stop(t + 3.0);
  }

  playStep() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;

    const buffer = this.createNoiseBuffer();
    if (!buffer) return;

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;

    // Add random pitch variation for natural walking sound
    source.playbackRate.value = 0.9 + Math.random() * 0.2;

    // Filter to make it a dull thud/tap
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, t); 

    const gain = this.ctx.createGain();
    
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    // Envelope - Increased volume for visibility
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.4, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    source.start(t);
    source.stop(t + 0.1);
  }

  playEating() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    
    const buffer = this.createNoiseBuffer();
    if (!buffer) return;

    // Crunchier sounds with randomized pitch and timing
    const crunchCount = 10;
    for(let i=0; i<crunchCount; i++) {
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        // Pitch shift for texture
        source.playbackRate.value = 0.8 + Math.random() * 0.4;
        
        // Varying filters for texture
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(Math.random() * 1000 + 800, t);

        const gain = this.ctx.createGain();
        
        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        // Randomize timing slightly for realism
        const start = t + (i * 0.12) + (Math.random() * 0.02);
        
        // Sharp crunchy envelope
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.8, start + 0.01); // Louder snap
        gain.gain.exponentialRampToValueAtTime(0.01, start + 0.08);
        
        source.start(start);
        source.stop(start + 0.1);
    }
  }

  playDrinking() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;

    const buffer = this.createNoiseBuffer();
    if (!buffer) return;

    for(let i=0; i<8; i++) {
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        
        // Sharper bandpass for clearer liquid sound
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.Q.value = 8;
        filter.frequency.setValueAtTime(600, t);
        filter.frequency.linearRampToValueAtTime(1200, t + 0.1); // Sweep up "slurp"

        const gain = this.ctx.createGain();
        
        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        const start = t + (i * 0.25);
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.6, start + 0.05);
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

    // Longer scratch sequence
    for(let i=0; i<3; i++) {
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1200; // Higher freq for sandy texture
        filter.Q.value = 1;

        const gain = this.ctx.createGain();
        
        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        const start = t + i * 0.25;

        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.5, start + 0.05);
        gain.gain.linearRampToValueAtTime(0, start + 0.2);

        source.start(start);
        source.stop(start + 0.25);
    }
  }

  playPlop() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    // Pitch drop
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(150, t + 0.15);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.8, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.25);
  }

  playSnore() {
      this.init();
      if (!this.ctx || !this.masterGain) return;
      const t = this.ctx.currentTime;
      
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(50, t); // Low pitch
      osc.frequency.linearRampToValueAtTime(40, t + 1.5); // Pitch drops on exhale

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 150; // Muffled

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.15, t + 0.5);
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
        gain.gain.linearRampToValueAtTime(0.2, start + 0.02);
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
    filter.frequency.setValueAtTime(800, t);

    const gain = this.ctx.createGain();
    
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.4, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
    
    source.start(t);
    source.stop(t + 0.5);
  }

  playClick() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.exponentialRampToValueAtTime(600, t + 0.1);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(t);
    osc.stop(t + 0.1);
  }
}

export const audioService = new AudioService();