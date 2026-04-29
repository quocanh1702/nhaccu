/* ===== DLQ Music Store - Interactive Instruments ===== */

const InteractiveInstruments = {
  currentInstrument: 'piano',
  octave: 4,
  recordedNotes: [],
  isRecording: false,
  isPlaying: false,
  timerInterval: null,
  recSeconds: 0,
  beatInterval: null,
  bpm: 120,
  isMetronome: false,
  beatStep: 0,
  beatGrid: {},

  init() {
    this.renderPiano();
    this.renderGuitarFretboard();
    this.renderDrumKit();
    this.bindInstrumentTabs();
    this.bindRecordingControls();
    this.bindVolumeControl();
    this.bindDrumPads();
    this.bindKeyboard();
    this.bindGuitarStrings();
    this.bindGuitarChords();
    this.initBeatGrid();
    this.bindMetronome();
  },

  // ===== Piano =====
  pianoKeys: [
    { note:'C', type:'white' }, { note:'C#', type:'black' },
    { note:'D', type:'white' }, { note:'D#', type:'black' },
    { note:'E', type:'white' }, { note:'F', type:'white' },
    { note:'F#', type:'black' }, { note:'G', type:'white' },
    { note:'G#', type:'black' }, { note:'A', type:'white' },
    { note:'A#', type:'black' }, { note:'B', type:'white' }
  ],

  keyboardMap: {
    'a':'C', 'w':'C#', 's':'D', 'e':'D#', 'd':'E', 'f':'F',
    't':'F#', 'g':'G', 'y':'G#', 'h':'A', 'u':'A#', 'j':'B',
    'k':'C+1', 'o':'C#+1', 'l':'D+1'
  },

  renderPiano() {
    const kb = document.getElementById('piano-keyboard');
    if (!kb) return;
    kb.innerHTML = '';

    // Render 3 octaves (3-5)
    const octaves = [3, 4, 5];
    octaves.forEach(oct => {
      const octDiv = document.createElement('div');
      octDiv.className = 'piano-octave';
      octDiv.style.cssText = 'position:relative; display:inline-flex;';
      let whiteLeft = 0;

      this.pianoKeys.forEach((key, i) => {
        const keyEl = document.createElement('div');
        keyEl.className = `piano-key ${key.type}`;
        keyEl.dataset.note = `${key.note}${oct}`;
        keyEl.dataset.type = key.type;

        if (key.type === 'white') {
          keyEl.style.position = 'relative';
          // Add keyboard label for octave 4
          if (oct === 4) {
            const kbKey = Object.entries(this.keyboardMap).find(([k, v]) => v === key.note || v === key.note);
            if (kbKey) {
              const label = document.createElement('span');
              label.className = 'key-label';
              label.textContent = kbKey[0].toUpperCase();
              keyEl.appendChild(label);
            }
          }
          whiteLeft += 44;
        } else {
          // Position black keys relative to their white neighbors
          const whiteIndex = this.pianoKeys.slice(0, i).filter(k => k.type === 'white').length;
          keyEl.style.position = 'absolute';
          keyEl.style.left = `${whiteIndex * 44 - 14}px`;
          keyEl.style.zIndex = '2';
        }

        keyEl.addEventListener('mousedown', (e) => {
          e.preventDefault();
          this.triggerPianoKey(keyEl, key.note + oct);
        });
        keyEl.addEventListener('touchstart', (e) => {
          e.preventDefault();
          this.triggerPianoKey(keyEl, key.note + oct);
        }, { passive: false });

        octDiv.appendChild(keyEl);
      });
      kb.appendChild(octDiv);
    });
  },

  triggerPianoKey(keyEl, note) {
    AudioPlayer.playPianoKey(note);
    keyEl.classList.add('active');
    setTimeout(() => keyEl.classList.remove('active'), 200);
    if (AudioPlayer.isRecording()) {
      AudioPlayer.recordNote('piano', note);
    }
    this.showNoteIndicator(note);
  },

  showNoteIndicator(note) {
    const indicator = document.getElementById('note-indicator');
    if (indicator) {
      indicator.textContent = note;
      indicator.style.opacity = '1';
      clearTimeout(this._noteTimeout);
      this._noteTimeout = setTimeout(() => { indicator.style.opacity = '0'; }, 800);
    }
  },

  bindKeyboard() {
    document.addEventListener('keydown', (e) => {
      if (e.repeat) return;
      const activeInstrument = document.querySelector('.piano-wrapper.active');
      if (!activeInstrument) return;
      const key = e.key.toLowerCase();
      const noteKey = this.keyboardMap[key];
      if (!noteKey) return;
      let note, oct;
      if (noteKey.endsWith('+1')) {
        note = noteKey.slice(0, -2);
        oct = this.octave + 1;
      } else {
        note = noteKey;
        oct = this.octave;
      }
      const fullNote = note + oct;
      const keyEl = document.querySelector(`[data-note="${fullNote}"]`);
      if (keyEl) this.triggerPianoKey(keyEl, fullNote);
    });
  },

  // ===== Guitar =====
  renderGuitarFretboard() {
    const fb = document.getElementById('guitar-fretboard');
    if (!fb) return;

    // Add string labels
    const stringNames = ['E', 'B', 'G', 'D', 'A', 'E'];
    const strings = fb.querySelectorAll('.guitar-string');
    strings.forEach((str, i) => {
      const label = document.createElement('span');
      label.className = 'string-label';
      label.textContent = stringNames[i];
      label.style.top = str.style.top;
      fb.appendChild(label);
    });

    // Add fret lines
    const fretPositions = [12, 22, 31, 40, 48, 56, 63, 70, 76, 82, 87, 92, 97];
    fretPositions.forEach(pct => {
      const line = document.createElement('div');
      line.className = 'fret-line';
      line.style.left = `${pct}%`;
      fb.appendChild(line);
    });

    // Add fret dots (positions 3, 5, 7, 9, 12)
    const dotPositions = [
      { fret: 3, row: 0.5 }, { fret: 5, row: 0.5 }, { fret: 7, row: 0.5 },
      { fret: 9, row: 0.5 }, { fret: 12, row: 0.33 }, { fret: 12, row: 0.67 }
    ];
    const fretPcts = [0, 12, 22, 31, 40, 48, 56, 63, 70, 76, 82, 87, 92, 97];

    dotPositions.forEach(d => {
      const dot = document.createElement('div');
      dot.className = 'fret-dot';
      const left = fretPcts[d.fret - 1] + (fretPcts[d.fret] - fretPcts[d.fret - 1]) / 2;
      dot.style.left = `${left}%`;
      dot.style.top = `${d.row * 100}%`;
      dot.style.transform = 'translate(-50%, -50%)';
      fb.appendChild(dot);
    });
  },

  bindGuitarStrings() {
    const strings = document.querySelectorAll('.guitar-string');
    strings.forEach((str, i) => {
      const triggerString = (e) => {
        e.preventDefault();
        const rect = str.parentElement.getBoundingClientRect();
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const fret = Math.floor(((clientX - rect.left) / rect.width) * 12);
        const stringIndex = parseInt(str.dataset.string || i);
        AudioPlayer.playGuitarString(stringIndex, Math.max(0, fret));
        str.classList.add('vibrating');
        setTimeout(() => str.classList.remove('vibrating'), 400);
        if (AudioPlayer.isRecording()) {
          AudioPlayer.recordNote('guitar-string', { string: stringIndex, fret: Math.max(0, fret) });
        }
      };
      str.addEventListener('mousedown', triggerString);
      str.addEventListener('touchstart', triggerString, { passive: false });
    });
  },

  bindGuitarChords() {
    document.querySelectorAll('.chord-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const chord = btn.dataset.chord;
        AudioPlayer.playGuitarChord(chord);
        if (AudioPlayer.isRecording()) {
          AudioPlayer.recordNote('guitar-chord', chord);
        }
        btn.classList.add('active');
        setTimeout(() => btn.classList.remove('active'), 500);
      });
    });
  },

  // ===== Drum =====
  renderDrumKit() {
    // Drum kit is rendered in HTML, just need to bind events
    this.bindDrumPads();
  },

  bindDrumPads() {
    const pads = document.querySelectorAll('.drum-pad');
    const drumKeyMap = {
      'kick': ' ', 'snare': 'v', 'hihat': 'q', 'hihat-open': 'w',
      'crash': 'e', 'ride': 'r', 'tom1': 'f', 'tom2': 'g', 'floor': 'b'
    };

    pads.forEach(pad => {
      const type = pad.dataset.drum;
      const trigger = (e) => {
        e.preventDefault();
        AudioPlayer.playDrumSound(type);
        pad.classList.add('hit');
        this.addRipple(pad, e);
        setTimeout(() => pad.classList.remove('hit'), 150);
        if (AudioPlayer.isRecording()) {
          AudioPlayer.recordNote('drum', type);
        }
      };
      pad.addEventListener('mousedown', trigger);
      pad.addEventListener('touchstart', trigger, { passive: false });
    });

    // Keyboard shortcuts for drums
    document.addEventListener('keydown', (e) => {
      if (!document.querySelector('.drum-wrapper.active')) return;
      if (e.target.tagName === 'INPUT') return;
      const entries = Object.entries(drumKeyMap);
      const entry = entries.find(([type, key]) => key === e.key);
      if (entry) {
        const pad = document.querySelector(`[data-drum="${entry[0]}"]`);
        if (pad) {
          AudioPlayer.playDrumSound(entry[0]);
          pad.classList.add('hit');
          setTimeout(() => pad.classList.remove('hit'), 150);
        }
      }
    });
  },

  addRipple(element, event) {
    const ripple = document.createElement('div');
    ripple.className = 'drum-ripple';
    const rect = element.getBoundingClientRect();
    const x = (event.clientX || rect.left + rect.width/2) - rect.left;
    const y = (event.clientY || rect.top + rect.height/2) - rect.top;
    const size = Math.max(rect.width, rect.height);
    ripple.style.cssText = `width:${size}px;height:${size}px;left:${x - size/2}px;top:${y - size/2}px`;
    element.appendChild(ripple);
    setTimeout(() => ripple.remove(), 400);
  },

  // ===== Beat Grid =====
  initBeatGrid() {
    const grid = document.getElementById('beat-grid');
    if (!grid) return;

    const drumTypes = ['kick','snare','hihat','hihat-open','crash','ride','tom1','tom2','floor'];
    const labels = ['Kick','Snare','Hi-hat','Hi-hat Op.','Crash','Ride','Tom 1','Tom 2','Floor Tom'];

    grid.innerHTML = '';
    drumTypes.forEach((type, row) => {
      this.beatGrid[type] = new Array(16).fill(false);

      const label = document.createElement('div');
      label.className = 'beat-label';
      label.textContent = labels[row];
      grid.appendChild(label);

      for (let col = 0; col < 16; col++) {
        const cell = document.createElement('div');
        cell.className = 'beat-cell';
        cell.dataset.row = type;
        cell.dataset.col = col;
        cell.addEventListener('click', () => {
          this.beatGrid[type][col] = !this.beatGrid[type][col];
          cell.classList.toggle('active', this.beatGrid[type][col]);
        });
        grid.appendChild(cell);
      }
    });
  },

  // ===== Metronome / Playback =====
  bindMetronome() {
    const startBtn = document.getElementById('beat-play');
    const stopBtn = document.getElementById('beat-stop');
    const bpmInput = document.getElementById('bpm-input');

    if (startBtn) {
      startBtn.addEventListener('click', () => this.startBeatPlayback());
    }
    if (stopBtn) {
      stopBtn.addEventListener('click', () => this.stopBeatPlayback());
    }
    if (bpmInput) {
      bpmInput.addEventListener('change', () => {
        this.bpm = parseInt(bpmInput.value) || 120;
        if (this.beatInterval) {
          this.stopBeatPlayback();
          this.startBeatPlayback();
        }
      });
    }
  },

  startBeatPlayback() {
    if (this.beatInterval) this.stopBeatPlayback();
    this.beatStep = 0;
    const interval = (60 / this.bpm / 4) * 1000;
    this.beatInterval = setInterval(() => this.tickBeat(), interval);
  },

  stopBeatPlayback() {
    clearInterval(this.beatInterval);
    this.beatInterval = null;
    // Clear current step highlight
    document.querySelectorAll('.beat-cell.current').forEach(c => c.classList.remove('current'));
  },

  tickBeat() {
    const step = this.beatStep;
    // Highlight current column
    document.querySelectorAll('.beat-cell').forEach(cell => {
      cell.classList.toggle('current', parseInt(cell.dataset.col) === step);
    });
    // Play active pads
    Object.entries(this.beatGrid).forEach(([type, pattern]) => {
      if (pattern[step]) AudioPlayer.playDrumSound(type);
    });
    this.beatStep = (step + 1) % 16;
  },

  // ===== Instrument Tabs =====
  bindInstrumentTabs() {
    document.querySelectorAll('.instrument-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const instrument = tab.dataset.instrument;
        this.switchInstrument(instrument);
      });
    });
  },

  switchInstrument(instrument) {
    this.currentInstrument = instrument;
    document.querySelectorAll('.instrument-tab').forEach(t => t.classList.toggle('active', t.dataset.instrument === instrument));
    document.querySelectorAll('.piano-wrapper, .guitar-wrapper, .drum-wrapper').forEach(w => w.classList.remove('active'));
    const wrapper = document.querySelector(`.${instrument}-wrapper`);
    if (wrapper) wrapper.classList.add('active');
  },

  // ===== Recording Controls =====
  bindRecordingControls() {
    const recBtn = document.getElementById('rec-start');
    const stopBtn = document.getElementById('rec-stop');
    const playBtn = document.getElementById('rec-play');
    const timer = document.getElementById('rec-timer');

    if (recBtn) {
      recBtn.addEventListener('click', () => {
        if (!AudioPlayer.isRecording()) {
          AudioPlayer.startRecording();
          recBtn.classList.add('recording');
          recBtn.innerHTML = '⏺ Đang ghi...';
          this.recSeconds = 0;
          this.timerInterval = setInterval(() => {
            this.recSeconds++;
            if (timer) {
              const m = Math.floor(this.recSeconds / 60);
              const s = this.recSeconds % 60;
              timer.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
            }
          }, 1000);
        }
      });
    }

    if (stopBtn) {
      stopBtn.addEventListener('click', () => {
        if (AudioPlayer.isRecording()) {
          this.recordedNotes = AudioPlayer.stopRecording();
          clearInterval(this.timerInterval);
          if (recBtn) {
            recBtn.classList.remove('recording');
            recBtn.innerHTML = '⏺ Ghi âm';
          }
          if (playBtn && this.recordedNotes.length) {
            playBtn.style.display = 'flex';
          }
          if (window.showToast) showToast(`✅ Đã lưu ${this.recordedNotes.length} nốt nhạc!`);
        }
      });
    }

    if (playBtn) {
      playBtn.addEventListener('click', () => {
        if (!this.isPlaying && this.recordedNotes.length) {
          this.isPlaying = true;
          playBtn.innerHTML = '⏸ Đang phát...';
          AudioPlayer.playbackRecording(this.recordedNotes, () => {
            this.isPlaying = false;
            playBtn.innerHTML = '▶ Phát lại';
          });
        }
      });
    }
  },

  bindVolumeControl() {
    const slider = document.getElementById('volume-slider');
    if (slider) {
      slider.addEventListener('input', () => {
        AudioPlayer.setVolume(slider.value / 100);
      });
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.interactive-page')) {
    InteractiveInstruments.init();
  }
});

window.InteractiveInstruments = InteractiveInstruments;
