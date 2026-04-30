/* ===== DLQ Music Store - Audio Player ===== */

const AudioPlayer = {
  audioCtx: null,
  gainNode: null,
  currentSource: null,
  isPlaying: false,

  init() {
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.gainNode = this.audioCtx.createGain();
    this.gainNode.gain.value = 0.6;
    this.gainNode.connect(this.audioCtx.destination);
  },

  getCtx() {
    if (!this.audioCtx) this.init();
    if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
    return this.audioCtx;
  },

  // Play a synthesized note using Web Audio API
  playNote(frequency, type = 'sine', duration = 1.0, envelope = null) {
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.connect(gain);
    gain.connect(this.gainNode);

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, now);

    const env = envelope || { attack: 0.01, decay: 0.1, sustain: 0.7, release: 0.3 };
    const peakVol = 0.8;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(peakVol, now + env.attack);
    gain.gain.linearRampToValueAtTime(peakVol * env.sustain, now + env.attack + env.decay);
    gain.gain.setValueAtTime(peakVol * env.sustain, now + duration - env.release);
    gain.gain.linearRampToValueAtTime(0, now + duration);

    osc.start(now);
    osc.stop(now + duration);
    return osc;
  },

  // Piano note frequencies (A4 = 440Hz)
  noteFrequencies: {
    'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13,
    'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00,
    'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
    'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25,
    'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99,
    'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77,
    'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61,
    'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
    'C6': 1046.50, 'D6': 1174.66, 'E6': 1318.51
  },

  // Play piano key
  playPianoKey(note) {
    const freq = this.noteFrequencies[note];
    if (!freq) return;
    this.playNote(freq, 'sine', 1.5, { attack: 0.005, decay: 0.3, sustain: 0.4, release: 0.8 });
    // Add harmonics for richer sound
    this.playNote(freq * 2, 'sine', 1.2, { attack: 0.005, decay: 0.2, sustain: 0.2, release: 0.5 });
  },

  // Guitar string frequencies (standard tuning: E2, A2, D3, G3, B3, E4)
  guitarStringFreqs: [82.41, 110.00, 146.83, 196.00, 246.94, 329.63],

  playGuitarString(stringIndex, fret = 0) {
    const baseFreq = this.guitarStringFreqs[stringIndex];
    const freq = baseFreq * Math.pow(2, fret / 12);
    this.playNote(freq, 'sawtooth', 1.5, { attack: 0.002, decay: 0.15, sustain: 0.3, release: 1.0 });
    // Add body resonance
    setTimeout(() => {
      this.playNote(freq * 1.5, 'triangle', 0.8, { attack: 0.01, decay: 0.1, sustain: 0.1, release: 0.5 });
    }, 10);
  },

  playChord(notes) {
    notes.forEach((note, i) => {
      setTimeout(() => this.playPianoKey(note), i * 30);
    });
  },

  // Guitar chord shapes [string -> fret, -1 = muted]
  guitarChords: {
    'Am': [0, 0, 2, 2, 1, 0],
    'C':  [-1, 3, 2, 0, 1, 0],
    'D':  [-1, -1, 0, 2, 3, 2],
    'E':  [0, 2, 2, 1, 0, 0],
    'Em': [0, 2, 2, 0, 0, 0],
    'F':  [1, 1, 2, 3, 3, 1],
    'G':  [3, 2, 0, 0, 0, 3],
    'G7': [3, 2, 0, 0, 0, 1],
    'Dm': [-1, -1, 0, 2, 3, 1],
    'Bm': [-1, 2, 4, 4, 3, 2]
  },

  playGuitarChord(chordName) {
    const frets = this.guitarChords[chordName];
    if (!frets) return;
    frets.forEach((fret, string) => {
      if (fret >= 0) {
        setTimeout(() => this.playGuitarString(5 - string, fret), string * 60);
      }
    });
  },

  // Drum sounds using synthesis
  playDrumSound(type) {
    const ctx = this.getCtx();
    switch (type) {
      case 'kick':   this._playKick(ctx); break;
      case 'snare':  this._playSnare(ctx); break;
      case 'hihat':  this._playHihat(ctx, false); break;
      case 'hihat-open': this._playHihat(ctx, true); break;
      case 'crash':  this._playCymbal(ctx, 0.8); break;
      case 'ride':   this._playCymbal(ctx, 0.4); break;
      case 'tom1':   this._playTom(ctx, 200); break;
      case 'tom2':   this._playTom(ctx, 160); break;
      case 'floor':  this._playTom(ctx, 100); break;
    }
  },

  _playKick(ctx) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(this.gainNode);
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.5);
    gain.gain.setValueAtTime(1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc.start(now); osc.stop(now + 0.5);
  },

  _playSnare(ctx) {
    const noise = this._createNoise(ctx);
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    filter.type = 'highpass'; filter.frequency.value = 2000;
    noise.connect(filter); filter.connect(gain); gain.connect(this.gainNode);
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    noise.start(now); noise.stop(now + 0.15);

    // Tone component
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.connect(oscGain); oscGain.connect(this.gainNode);
    osc.frequency.value = 200;
    oscGain.gain.setValueAtTime(0.4, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.start(now); osc.stop(now + 0.1);
  },

  _playHihat(ctx, open = false) {
    const noise = this._createNoise(ctx);
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    filter.type = 'highpass'; filter.frequency.value = 7000;
    noise.connect(filter); filter.connect(gain); gain.connect(this.gainNode);
    const now = ctx.currentTime;
    const dur = open ? 0.4 : 0.06;
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    noise.start(now); noise.stop(now + dur);
  },

  _playCymbal(ctx, decay = 0.6) {
    const noise = this._createNoise(ctx);
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    filter.type = 'bandpass'; filter.frequency.value = 5000; filter.Q.value = 0.5;
    noise.connect(filter); filter.connect(gain); gain.connect(this.gainNode);
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + decay);
    noise.start(now); noise.stop(now + decay);
  },

  _playTom(ctx, freq = 150) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(this.gainNode);
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + 0.3);
    gain.gain.setValueAtTime(0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.start(now); osc.stop(now + 0.3);
  },

  _createNoise(ctx) {
    const bufferSize = ctx.sampleRate * 0.5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    return source;
  },

  setVolume(vol) {
    if (this.gainNode) this.gainNode.gain.value = Math.max(0, Math.min(1, vol));
  },

  // Simple recording
  _recordedNotes: [],
  _isRecording: false,
  _recordStart: 0,

  startRecording() {
    this._recordedNotes = [];
    this._isRecording = true;
    this._recordStart = performance.now();
  },

  recordNote(type, value) {
    if (!this._isRecording) return;
    this._recordedNotes.push({
      type, value, time: performance.now() - this._recordStart
    });
  },

  stopRecording() {
    this._isRecording = false;
    return [...this._recordedNotes];
  },

  isRecording() { return this._isRecording; },

  playbackRecording(notes, onDone) {
    if (!notes?.length) return;
    notes.forEach(note => {
      setTimeout(() => {
        if (note.type === 'piano') this.playPianoKey(note.value);
        else if (note.type === 'guitar-string') this.playGuitarString(note.value.string, note.value.fret);
        else if (note.type === 'drum') this.playDrumSound(note.value);
        else if (note.type === 'guitar-chord') this.playGuitarChord(note.value);
      }, note.time);
    });
    const totalTime = notes[notes.length - 1]?.time || 0;
    if (onDone) setTimeout(onDone, totalTime + 500);
  }
};

window.AudioPlayer = AudioPlayer;
// Pre-initialize audio context on first user interaction
document.addEventListener('click', () => {
  if (!AudioPlayer.audioCtx) AudioPlayer.init();
}, { once: true });
