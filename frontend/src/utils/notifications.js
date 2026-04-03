let sharedAudioContext = null;
let audioPrimed = false;
let currentNotificationTone = 'custom';
let loopAudio = null;
let isLooping = false;

const getAudioContext = () => {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;

  if (!sharedAudioContext) {
    sharedAudioContext = new AudioCtx();
  }

  return sharedAudioContext;
};

const toneStepsMap = {
  custom: [],
  message: [
    { frequency: 1760, start: 0, duration: 0.22, volume: 0.22, type: 'triangle' },
    { frequency: 2217.46, start: 0.07, duration: 0.25, volume: 0.16, type: 'sine' },
    { frequency: 1760, start: 0.24, duration: 0.18, volume: 0.15, type: 'triangle' }
  ],
  luxury: [
    { frequency: 1318.51, start: 0, duration: 0.34, volume: 0.24, type: 'triangle' },
    { frequency: 1661.22, start: 0.08, duration: 0.38, volume: 0.18, type: 'sine' },
    { frequency: 1975.53, start: 0.16, duration: 0.44, volume: 0.15, type: 'triangle' },
    { frequency: 1567.98, start: 0.41, duration: 0.28, volume: 0.14, type: 'triangle' }
  ],
  classic: [
    { frequency: 1046.5, start: 0, duration: 0.2, volume: 0.18, type: 'square' },
    { frequency: 1318.51, start: 0.08, duration: 0.26, volume: 0.17, type: 'triangle' },
    { frequency: 1567.98, start: 0.19, duration: 0.3, volume: 0.15, type: 'triangle' }
  ],
  soft: [
    { frequency: 1174.66, start: 0, duration: 0.22, volume: 0.12, type: 'sine' },
    { frequency: 1396.91, start: 0.08, duration: 0.26, volume: 0.11, type: 'sine' },
    { frequency: 1567.98, start: 0.18, duration: 0.22, volume: 0.1, type: 'triangle' }
  ]
};

const playToneStep = (audioContext, step) => {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  const startTime = audioContext.currentTime + step.start;
  const endTime = startTime + step.duration;

  oscillator.type = step.type || 'sine';
  oscillator.frequency.setValueAtTime(step.frequency, startTime);
  oscillator.frequency.exponentialRampToValueAtTime(
    Math.max(160, step.frequency * 0.9),
    endTime
  );

  gainNode.gain.setValueAtTime(0.0001, startTime);
  gainNode.gain.exponentialRampToValueAtTime(step.volume, startTime + 0.015);
  gainNode.gain.exponentialRampToValueAtTime(step.volume * 0.7, startTime + step.duration * 0.4);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, endTime);

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.start(startTime);
  oscillator.stop(endTime);
};

const primeAudio = async () => {
  try {
    const audioContext = getAudioContext();
    if (!audioContext) return;

    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    audioPrimed = true;
  } catch (error) {
    console.error('Failed to prime notification audio', error);
  }
};

export const setNotificationTone = (tone) => {
  currentNotificationTone = toneStepsMap[tone] ? tone : 'custom';

  if (typeof window !== 'undefined') {
    window.localStorage.setItem('melora-notification-tone', currentNotificationTone);
  }
};

export const getNotificationTone = () => {
  if (typeof window === 'undefined') return currentNotificationTone;
  return window.localStorage.getItem('melora-notification-tone') || currentNotificationTone;
};

const getLoopAudio = () => {
  if (typeof window === 'undefined') return null;
  if (!loopAudio) {
    loopAudio = new Audio('/RqGiTPIDVO8.mp3');
    loopAudio.preload = 'auto';
    loopAudio.volume = 1;
  }
  return loopAudio;
};

export const stopNotificationTone = () => {
  const audio = getLoopAudio();
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
  isLooping = false;
};

export const isNotificationLooping = () => isLooping;

export const enableNotificationAudio = () => {
  if (typeof window === 'undefined' || audioPrimed) return () => {};

  const storedTone = window.localStorage.getItem('melora-notification-tone');
  if (storedTone && toneStepsMap[storedTone] !== undefined) {
    currentNotificationTone = storedTone;
  }

  const unlock = () => {
    primeAudio().finally(() => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    });
  };

  window.addEventListener('pointerdown', unlock, { once: true });
  window.addEventListener('keydown', unlock, { once: true });

  return () => {
    window.removeEventListener('pointerdown', unlock);
    window.removeEventListener('keydown', unlock);
  };
};

export const playNotificationTone = async () => {
  try {
    const tone = getNotificationTone();

    if (tone === 'custom') {
      const audio = getLoopAudio();
      if (!audio) return;
      audio.loop = true;
      audio.currentTime = 0;
      await audio.play();
      isLooping = true;
      return;
    }

    const audioContext = getAudioContext();
    if (!audioContext) return;

    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    const steps = toneStepsMap[tone] || toneStepsMap.message;
    steps.forEach((step) => playToneStep(audioContext, step));
    isLooping = false;
  } catch (error) {
    console.error('Failed to play notification tone', error);
  }
};
