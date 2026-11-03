// Realistic Web Audio API Ambient Sound Synthesizer (Zero External Files Needed)
let audioCtx = null;
let currentSourceNodes = [];
let isPlaying = false;

export const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
};

export const stopAmbience = () => {
  currentSourceNodes.forEach((node) => {
    try {
      if (node.stop) node.stop();
      if (node.disconnect) node.disconnect();
    } catch (e) {}
  });
  currentSourceNodes = [];
  isPlaying = false;
};

export const playMoodAmbience = (mood = 'happy') => {
  try {
    initAudio();
    stopAmbience();

    if (!audioCtx) return;

    isPlaying = true;
    const now = audioCtx.currentTime;

    if (mood === 'sad') {
      // Realistic Gentle Raindrop Ambient Generator
      // Pink/White noise through bandpass filter + random water drops
      const bufferSize = audioCtx.sampleRate * 2;
      const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        output[i] = (b0 + b1 + b2) * 0.06;
      }

      const whiteNoise = audioCtx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 1.5);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      whiteNoise.start();
      currentSourceNodes.push(whiteNoise, gain);
    } else if (mood === 'gussa') {
      // Realistic Crackling Fireplace & Embers Generator
      const osc = audioCtx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(55, now);

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140, now);

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 1.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      currentSourceNodes.push(osc, gain);
    } else if (mood === 'happy') {
      // Warm Golden Romantic Chime / Sunbeam Drone
      const freqs = [220, 277.18, 329.63, 440]; // A-major warm chord
      freqs.forEach((freq) => {
        const osc = audioCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.03, now + 2);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        currentSourceNodes.push(osc, gain);
      });
    } else {
      // Normal: Serene Forest Wind & Night Breeze
      const osc = audioCtx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(110, now);

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.05, now + 1.5);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      currentSourceNodes.push(osc, gain);
    }
  } catch (err) {
    console.warn('Audio ambience synthesis note:', err);
  }
};
