export type SoundPreset = {
  id: string;
  name: string;
  frequency?: number;
  brownNoiseLevel: number;
  ambientFile?: string;
  ambientLevel: number;
};

export const SOUND_PRESETS: Record<string, SoundPreset> = {
  ground: {
    id: "ground",
    name: "Ground Mode",
    frequency: 174,
    brownNoiseLevel: 0.12,
    ambientFile: "rain.wav",
    ambientLevel: 0.5
  },
  focus: {
    id: "focus",
    name: "Focus Mode",
    frequency: 432,
    brownNoiseLevel: 0.06,
    ambientFile: "forest.wav",
    ambientLevel: 0.4
  },
  deep_rest: {
    id: "deep_rest",
    name: "Deep Rest Mode",
    frequency: 174,
    brownNoiseLevel: 0.15,
    ambientFile: "ocean.wav",
    ambientLevel: 0.5
  }
};

const MASTER_GAIN_DEFAULT = 0.7;

function createBrownNoiseBuffer(ctx: AudioContext): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const length = sampleRate * 3;
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  let lastOut = 0;
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;
    lastOut = (lastOut + 0.02 * white) / 1.02;
    data[i] = lastOut * 3.5;
  }
  return buffer;
}

class SoundMixEngine {
  audioContext: AudioContext | null = null;
  masterGain: GainNode | null = null;
  filterNode: BiquadFilterNode | null = null;

  frequencyOsc: OscillatorNode | null = null;
  frequencyGain: GainNode | null = null;

  noiseNode: AudioBufferSourceNode | null = null;
  noiseGain: GainNode | null = null;
  brownNoiseBuffer: AudioBuffer | null = null;

  ambientNode: AudioBufferSourceNode | null = null;
  ambientGain: GainNode | null = null;

  ambientBuffers: Map<string, AudioBuffer> = new Map();
  activePresetId: string | null = null;

  private async ensureContext(): Promise<AudioContext | null> {
    if (this.audioContext) return this.audioContext;
    if (typeof window === "undefined") return null;
    const AnyAudioContext =
      (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AnyAudioContext) return null;
    const ctx = new AnyAudioContext();
    const masterGain = ctx.createGain();
    masterGain.gain.value = MASTER_GAIN_DEFAULT;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 6000;
    filter.connect(masterGain);
    masterGain.connect(ctx.destination);
    this.audioContext = ctx;
    this.masterGain = masterGain;
    this.filterNode = filter;
    await this.ensureBrownNoise();
    return ctx;
  }

  private async ensureBrownNoise(): Promise<void> {
    const ctx = await this.ensureContext();
    if (!ctx || !this.filterNode) return;
    if (this.noiseNode && this.noiseGain) return;

    if (!this.brownNoiseBuffer) {
      this.brownNoiseBuffer = createBrownNoiseBuffer(ctx);
    }

    const source = ctx.createBufferSource();
    source.buffer = this.brownNoiseBuffer;
    source.loop = true;

    const gain = ctx.createGain();
    gain.gain.value = 0;
    source.connect(gain);
    gain.connect(this.filterNode);
    source.start();

    this.noiseNode = source;
    this.noiseGain = gain;
  }

  private async getAmbientBuffer(fileName: string): Promise<AudioBuffer | null> {
    if (!fileName) return null;
    const cached = this.ambientBuffers.get(fileName);
    if (cached) return cached;
    const ctx = await this.ensureContext();
    if (!ctx) return null;
    const url = `/sounds/${fileName}`;
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const arrayBuffer = await res.arrayBuffer();
      const buffer = await ctx.decodeAudioData(arrayBuffer);
      this.ambientBuffers.set(fileName, buffer);
      return buffer;
    } catch {
      return null;
    }
  }

  private crossfadeFrequency(
    ctx: AudioContext,
    frequency: number | undefined,
    fadeInSeconds: number,
    fadeOutSeconds: number
  ) {
    if (!this.filterNode) return;
    const now = ctx.currentTime;
    const prevOsc = this.frequencyOsc;
    const prevGain = this.frequencyGain;

    if (frequency === undefined) {
      if (prevOsc && prevGain) {
        prevGain.gain.cancelScheduledValues(now);
        prevGain.gain.setValueAtTime(prevGain.gain.value, now);
        prevGain.gain.linearRampToValueAtTime(0, now + fadeOutSeconds);
        try {
          prevOsc.stop(now + fadeOutSeconds);
        } catch {
          try {
            prevOsc.stop();
          } catch {
          }
        }
        setTimeout(() => {
          try {
            prevOsc.disconnect();
          } catch {
          }
          try {
            prevGain.disconnect();
          } catch {
          }
          if (this.frequencyOsc === prevOsc) this.frequencyOsc = null;
          if (this.frequencyGain === prevGain) this.frequencyGain = null;
        }, fadeOutSeconds * 1000);
      }
      return;
    }

    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = frequency;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    const targetGain = frequency === 174 ? 0.15 : 0.2;
    gain.gain.linearRampToValueAtTime(targetGain, now + fadeInSeconds);
    osc.connect(gain);
    gain.connect(this.filterNode);
    osc.start(now);

    if (prevOsc && prevGain) {
      prevGain.gain.cancelScheduledValues(now);
      prevGain.gain.setValueAtTime(prevGain.gain.value, now);
      prevGain.gain.linearRampToValueAtTime(0, now + fadeOutSeconds);
      try {
        prevOsc.stop(now + fadeOutSeconds);
      } catch {
        try {
          prevOsc.stop();
        } catch {
        }
      }
      setTimeout(() => {
        try {
          prevOsc.disconnect();
        } catch {
        }
        try {
          prevGain.disconnect();
        } catch {
        }
        if (this.frequencyOsc === prevOsc) this.frequencyOsc = null;
        if (this.frequencyGain === prevGain) this.frequencyGain = null;
      }, fadeOutSeconds * 1000);
    }

    this.frequencyOsc = osc;
    this.frequencyGain = gain;
  }

  private async crossfadeAmbient(
    fileName: string | undefined,
    level: number,
    fadeInSeconds: number,
    fadeOutSeconds: number
  ): Promise<void> {
    const ctx = await this.ensureContext();
    if (!ctx || !this.filterNode) return;
    const now = ctx.currentTime;
    const prevNode = this.ambientNode;
    const prevGain = this.ambientGain;

    if (!fileName) {
      if (prevNode && prevGain) {
        prevGain.gain.cancelScheduledValues(now);
        prevGain.gain.setValueAtTime(prevGain.gain.value, now);
        prevGain.gain.linearRampToValueAtTime(0, now + fadeOutSeconds);
        try {
          prevNode.stop(now + fadeOutSeconds);
        } catch {
          try {
            prevNode.stop();
          } catch {
          }
        }
        setTimeout(() => {
          try {
            prevNode.disconnect();
          } catch {
          }
          try {
            prevGain.disconnect();
          } catch {
          }
          if (this.ambientNode === prevNode) this.ambientNode = null;
          if (this.ambientGain === prevGain) this.ambientGain = null;
        }, fadeOutSeconds * 1000);
      }
      return;
    }

    const buffer = await this.getAmbientBuffer(fileName);
    if (!buffer) return;

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    const clamped = Math.max(0, Math.min(level, 0.6));
    const target = clamped === 0 ? 0 : Math.max(0.3, clamped);
    gain.gain.linearRampToValueAtTime(target, now + fadeInSeconds);
    source.connect(gain);
    gain.connect(this.filterNode);
    source.start(now);

    if (prevNode && prevGain) {
      prevGain.gain.cancelScheduledValues(now);
      prevGain.gain.setValueAtTime(prevGain.gain.value, now);
      prevGain.gain.linearRampToValueAtTime(0, now + fadeOutSeconds);
      try {
        prevNode.stop(now + fadeOutSeconds);
      } catch {
        try {
          prevNode.stop();
        } catch {
        }
      }
      setTimeout(() => {
        try {
          prevNode.disconnect();
        } catch {
        }
        try {
          prevGain.disconnect();
        } catch {
        }
        if (this.ambientNode === prevNode) this.ambientNode = null;
        if (this.ambientGain === prevGain) this.ambientGain = null;
      }, fadeOutSeconds * 1000);
    }

    this.ambientNode = source;
    this.ambientGain = gain;
  }

  private async setBrownNoiseLevel(level: number, fadeSeconds: number): Promise<void> {
    await this.ensureBrownNoise();
    if (!this.noiseGain || !this.audioContext) return;
    const ctx = this.audioContext;
    const now = ctx.currentTime;
    const gain = this.noiseGain.gain;
    const max = 0.15;
    const min = 0.05;
    const clamped = Math.max(0, Math.min(level, max));
    const target = clamped === 0 ? 0 : Math.max(min, clamped);
    gain.cancelScheduledValues(now);
    gain.setValueAtTime(gain.value, now);
    gain.linearRampToValueAtTime(target, now + fadeSeconds);
  }

  async applyPreset(presetId: string): Promise<void> {
    const preset = SOUND_PRESETS[presetId];
    const ctx = await this.ensureContext();
    if (!preset || !ctx) return;

    this.crossfadeFrequency(ctx, preset.frequency, 2, 1.5);
    await this.setBrownNoiseLevel(preset.brownNoiseLevel, 2);
    await this.crossfadeAmbient(preset.ambientFile, preset.ambientLevel, 2, 1.5);

    this.activePresetId = presetId;
  }

  async stopAll(fadeSeconds = 1.5): Promise<void> {
    const ctx = await this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    if (this.frequencyOsc && this.frequencyGain) {
      const osc = this.frequencyOsc;
      const gain = this.frequencyGain;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.linearRampToValueAtTime(0, now + fadeSeconds);
      try {
        osc.stop(now + fadeSeconds);
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
        if (this.frequencyOsc === osc) this.frequencyOsc = null;
        if (this.frequencyGain === gain) this.frequencyGain = null;
      }, fadeSeconds * 1000);
    }

    if (this.ambientNode && this.ambientGain) {
      const node = this.ambientNode;
      const gain = this.ambientGain;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.linearRampToValueAtTime(0, now + fadeSeconds);
      try {
        node.stop(now + fadeSeconds);
      } catch {
        try {
          node.stop();
        } catch {
        }
      }
      setTimeout(() => {
        try {
          node.disconnect();
        } catch {
        }
        try {
          gain.disconnect();
        } catch {
        }
        if (this.ambientNode === node) this.ambientNode = null;
        if (this.ambientGain === gain) this.ambientGain = null;
      }, fadeSeconds * 1000);
    }

    if (this.noiseGain && this.audioContext) {
      const gain = this.noiseGain.gain;
      gain.cancelScheduledValues(now);
      gain.setValueAtTime(gain.value, now);
      gain.linearRampToValueAtTime(0, now + fadeSeconds);
    }

    this.activePresetId = null;
  }
}

export const soundMixEngine = new SoundMixEngine();

export const applyPresetById = (id: string) => soundMixEngine.applyPreset(id);

