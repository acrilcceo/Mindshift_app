import { SoundListeningSession, SoundMix, SoundLayerType } from '../types';
import { soundAssets } from './soundLibrary';

let currentSession: SoundListeningSession | null = null;
let audioContext: AudioContext | null = null;
let masterGain: GainNode | null = null;
let activeFrequencyNode: OscillatorNode | null = null;
let activeFrequencyGain: GainNode | null = null;
let activeAmbientSource: AudioBufferSourceNode | null = null;
let activeAmbientGain: GainNode | null = null;
let activeAmbientKey: string | null = null;

const FREQUENCY_MAP: Record<string, number> = {
  "528": 528,
  "432": 432,
  "174": 174
};

const AMBIENT_MAP: Record<string, string> = {
  rain: "/sounds/rain.mp3",
  ocean: "/sounds/ocean.mp3",
  forest: "/sounds/forest.mp3"
};

const ambientBuffers: Record<string, AudioBuffer> = {};
let ambientsLoaded = false;
let loadingPromise: Promise<void> | null = null;

const getAudioContext = async () => {
  if (typeof window === 'undefined') return null;
  if (audioContext) return audioContext;
  const AnyAudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
  if (!AnyAudioContext) return null;
  const ctx = new AnyAudioContext();
  const gain = ctx.createGain();
  gain.gain.value = 1;
  gain.connect(ctx.destination);
  audioContext = ctx;
  masterGain = gain;
  return ctx;
};

const ensureContextRunning = async () => {
  const ctx = await getAudioContext();
  if (!ctx) return null;
  if (ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch {
    }
  }
  return ctx;
};

export const stop = (duration = 1.5) => {
  if (!audioContext || !activeFrequencyNode || !activeFrequencyGain) return;

  const ctx = audioContext;
  const osc = activeFrequencyNode;
  const gain = activeFrequencyGain;
  const now = ctx.currentTime;

  gain.gain.cancelScheduledValues(now);
  gain.gain.setValueAtTime(gain.gain.value, now);
  gain.gain.linearRampToValueAtTime(0, now + duration);

  try {
    osc.stop(now + duration);
  } catch {
    try {
      osc.stop();
    } catch {
    }
  }

  setTimeout(() => {
    try {
      osc.disconnect();
    } catch {
    }
    try {
      gain.disconnect();
    } catch {
    }
    if (activeFrequencyNode === osc) {
      activeFrequencyNode = null;
    }
    if (activeFrequencyGain === gain) {
      activeFrequencyGain = null;
    }
  }, duration * 1000);
};

export const stopAmbient = (duration = 1.5) => {
  if (!audioContext || !activeAmbientSource || !activeAmbientGain) return;

  const ctx = audioContext;
  const source = activeAmbientSource;
  const gain = activeAmbientGain;
  const now = ctx.currentTime;

  gain.gain.cancelScheduledValues(now);
  gain.gain.setValueAtTime(gain.gain.value, now);
  gain.gain.linearRampToValueAtTime(0, now + duration);

  try {
    source.stop(now + duration);
  } catch {
    try {
      source.stop();
    } catch {
    }
  }

  const timeoutMs = duration * 1000;
  setTimeout(() => {
    try {
      source.disconnect();
    } catch {
    }
    try {
      gain.disconnect();
    } catch {
    }
    if (activeAmbientSource === source) {
      activeAmbientSource = null;
    }
    if (activeAmbientGain === gain) {
      activeAmbientGain = null;
    }
    activeAmbientKey = null;
  }, timeoutMs);
};

const stopActiveNodes = () => {
  if (activeFrequencyNode || activeFrequencyGain) {
    stop(0.2);
  }
  if (activeAmbientSource || activeAmbientGain) {
    stopAmbient(0.2);
  }
};

export const playFrequency = async (id: string, fadeDuration = 1.5) => {
  const hz = FREQUENCY_MAP[id];
  const ctx = await ensureContextRunning();
  if (!ctx || !masterGain || !hz) return;

  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = hz;
  osc.connect(gain);
  gain.connect(masterGain);

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(1, now + fadeDuration);

  osc.start(now);

  if (activeFrequencyNode && activeFrequencyGain) {
    activeFrequencyGain.gain.cancelScheduledValues(now);
    activeFrequencyGain.gain.setValueAtTime(activeFrequencyGain.gain.value, now);
    activeFrequencyGain.gain.linearRampToValueAtTime(0, now + fadeDuration);
    try {
      activeFrequencyNode.stop(now + fadeDuration);
    } catch {
      try {
        activeFrequencyNode.stop();
      } catch {
      }
    }
  }

  activeFrequencyNode = osc;
  activeFrequencyGain = gain;
};

const loadAudioBuffer = async (ctx: AudioContext, url: string) => {
  const res = await fetch(url);
  const arrayBuffer = await res.arrayBuffer();
  return ctx.decodeAudioData(arrayBuffer);
};

export const preloadAmbients = async (): Promise<void> => {
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    const ctx = await ensureContextRunning();
    if (!ctx) return;
    const keys = Object.keys(AMBIENT_MAP);
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      if (ambientBuffers[key]) continue;
      const url = AMBIENT_MAP[key];
      try {
        const res = await fetch(url);
        const arrayBuffer = await res.arrayBuffer();
        const buffer = await ctx.decodeAudioData(arrayBuffer);
        ambientBuffers[key] = buffer;
      } catch {
      }
    }
    ambientsLoaded = true;
  })();

  return loadingPromise;
};

export const playAmbient = async (key: string, fadeDuration = 1.5) => {
  const ctx = await ensureContextRunning();
  if (!ctx || !masterGain) return;

  const buffer = ambientBuffers[key];
  const now = ctx.currentTime;

  const source = ctx.createBufferSource();
  const gain = ctx.createGain();
  source.buffer = buffer;
  source.loop = true;
  gain.gain.setValueAtTime(0, now);
  source.connect(gain);
  gain.connect(masterGain);
  source.start(now);

  gain.gain.linearRampToValueAtTime(0.6, now + fadeDuration);

  if (activeAmbientSource && activeAmbientGain) {
    const prevSource = activeAmbientSource;
    const prevGain = activeAmbientGain;
    prevGain.gain.cancelScheduledValues(now);
    prevGain.gain.setValueAtTime(prevGain.gain.value, now);
    prevGain.gain.linearRampToValueAtTime(0, now + fadeDuration);
    try {
      prevSource.stop(now + fadeDuration);
    } catch {
      try {
        prevSource.stop();
      } catch {
      }
    }
    const timeoutMs = fadeDuration * 1000;
    setTimeout(() => {
      try {
        prevSource.disconnect();
      } catch {
      }
      try {
        prevGain.disconnect();
      } catch {
      }
      if (activeAmbientSource === prevSource) {
        activeAmbientSource = null;
      }
      if (activeAmbientGain === prevGain) {
        activeAmbientGain = null;
      }
    }, timeoutMs);
  }

  activeAmbientSource = source;
  activeAmbientGain = gain;
  activeAmbientKey = key;
};

export const toggleAmbient = async (key: string, fadeDuration = 1.5) => {
  const ctx = await ensureContextRunning();
  if (!ctx) return;
  if (!ambientsLoaded) {
    await preloadAmbients();
  }
  if (activeAmbientKey === key) {
    stopAmbient(fadeDuration);
    activeAmbientKey = null;
    return;
  }
  await playAmbient(key, fadeDuration);
};

const playMixLayers = async (mix: SoundMix) => {
  const ctx = await ensureContextRunning();
  if (!ctx || !masterGain) return;

  stopActiveNodes();

  const findLayer = (type: SoundLayerType) => mix.layers.find(l => l.layerType === type);

  const frequencyLayer = findLayer('baseFrequency');
  if (frequencyLayer) {
    const asset = soundAssets.find(a => a.id === frequencyLayer.assetId);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = asset?.metadata?.frequencyHz || 432;
    gain.gain.value = frequencyLayer.volume;
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start();
    activeFrequencyNode = osc;
    activeFrequencyGain = gain;
  }

  const ambientLayer = findLayer('ambient');
  if (ambientLayer) {
    const asset = soundAssets.find(a => a.id === ambientLayer.assetId && a.url);
    if (asset && asset.url) {
      const buffer = await loadAudioBuffer(ctx, asset.url);
      const source = ctx.createBufferSource();
      const gain = ctx.createGain();
      source.buffer = buffer;
      source.loop = true;
      gain.gain.value = ambientLayer.volume;
      source.connect(gain);
      gain.connect(masterGain);
      source.start();
      activeAmbientSource = source;
      activeAmbientGain = gain;
      activeAmbientKey = null;
    }
  }
};

export const getCurrentSession = () => currentSession;

export const startMixSession = async (mix: SoundMix): Promise<SoundListeningSession> => {
  await playMixLayers(mix);
  const session: SoundListeningSession = {
    id: crypto.randomUUID(),
    mixId: mix.id,
    startedAt: Date.now(),
    usageMode: mix.usageMode,
    emotionalState: mix.emotionalState,
    isCalming: mix.usageMode === 'sleep' || mix.usageMode === 'calm' || mix.usageMode === 'meditation',
    layersUsed: mix.layers.map(l => ({ layerType: l.layerType, assetId: l.assetId }))
  };
  currentSession = session;
  return session;
};

export const endCurrentSession = async () => {
  if (!currentSession) return null;
  stopActiveNodes();
  if (audioContext && audioContext.state === 'running') {
    try {
      await audioContext.suspend();
    } catch {
    }
  }
  const endedAt = Date.now();
  const durationMs = endedAt - currentSession.startedAt;
  const finished: SoundListeningSession = {
    ...currentSession,
    endedAt,
    durationMs
  };
  currentSession = null;
  return finished;
};

export const soundEngine = {
  preloadAmbients,
  toggleAmbient,
  playAmbient,
  stopAmbient
};
