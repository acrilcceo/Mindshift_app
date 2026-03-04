/**
 * AudioEngine Service - Singleton
 * optimized for performance and memory management
 */

class AudioEngine {
  private static instance: AudioEngine;
  private audioContext: AudioContext | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private currentVolume: number = 0.5;
  private isPlaying: boolean = false;
  private bufferCache: Map<string, AudioBuffer> = new Map();

  private constructor() {
    // Lazy initialization in play method
  }

  public static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  private initContext() {
    if (!this.audioContext) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContextClass();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  private async loadBuffer(url: string): Promise<AudioBuffer> {
    if (this.bufferCache.has(url)) {
      return this.bufferCache.get(url)!;
    }

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      
      // Ensure context exists before decoding
      if (!this.audioContext) this.initContext();
      
      const audioBuffer = await this.audioContext!.decodeAudioData(arrayBuffer);
      this.bufferCache.set(url, audioBuffer);
      return audioBuffer;
    } catch (error) {
      console.error('Error loading audio buffer:', error);
      throw error;
    }
  }

  public async play(trackUrl: string, loop: boolean = true, fadeDuration: number = 2) {
    try {
      this.initContext();
      
      const buffer = await this.loadBuffer(trackUrl);
      
      // Crossfade if already playing
      if (this.isPlaying && this.currentSource) {
        this.crossfade(trackUrl, fadeDuration);
        return;
      }

      this.currentSource = this.audioContext!.createBufferSource();
      this.currentSource.buffer = buffer;
      this.currentSource.loop = loop;
      this.currentSource.connect(this.gainNode!);
      
      // Fade in
      this.gainNode!.gain.setValueAtTime(0, this.audioContext!.currentTime);
      this.gainNode!.gain.linearRampToValueAtTime(this.currentVolume, this.audioContext!.currentTime + fadeDuration);
      
      this.currentSource.start();
      this.isPlaying = true;

    } catch (error) {
      console.error('AudioEngine play error:', error);
    }
  }

  public stop(fadeDuration: number = 2) {
    if (!this.isPlaying || !this.currentSource || !this.audioContext) return;

    const stopTime = this.audioContext.currentTime + fadeDuration;
    
    // Fade out
    this.gainNode!.gain.setValueAtTime(this.gainNode!.gain.value, this.audioContext.currentTime);
    this.gainNode!.gain.linearRampToValueAtTime(0, stopTime);
    
    this.currentSource.stop(stopTime);
    
    // Cleanup after stop
    setTimeout(() => {
      this.isPlaying = false;
      this.currentSource = null;
    }, fadeDuration * 1000);
  }

  public async crossfade(newTrackUrl: string, duration: number = 2) {
    if (!this.audioContext) return;

    // 1. Load new buffer first
    const newBuffer = await this.loadBuffer(newTrackUrl);

    // 2. Create new source
    const newSource = this.audioContext.createBufferSource();
    newSource.buffer = newBuffer;
    newSource.loop = true;

    // 3. Create new gain for crossfading
    const newGain = this.audioContext.createGain();
    newGain.gain.value = 0;
    newSource.connect(newGain);
    newGain.connect(this.audioContext.destination);

    // 4. Start new source
    newSource.start();

    // 5. Crossfade parameters
    const currTime = this.audioContext.currentTime;
    
    // Fade out current
    if (this.currentSource && this.gainNode) {
      this.gainNode.gain.cancelScheduledValues(currTime);
      this.gainNode.gain.setValueAtTime(this.currentVolume, currTime);
      this.gainNode.gain.linearRampToValueAtTime(0, currTime + duration);
      this.currentSource.stop(currTime + duration);
    }

    // Fade in new
    newGain.gain.cancelScheduledValues(currTime);
    newGain.gain.setValueAtTime(0, currTime);
    newGain.gain.linearRampToValueAtTime(this.currentVolume, currTime + duration);

    // 6. Update references after transition
    setTimeout(() => {
      this.currentSource = newSource;
      this.gainNode = newGain;
      this.isPlaying = true;
    }, duration * 1000);
  }

  public setVolume(value: number) {
    this.currentVolume = Math.max(0, Math.min(1, value));
    if (this.gainNode && this.audioContext) {
      this.gainNode.gain.setTargetAtTime(this.currentVolume, this.audioContext.currentTime, 0.1);
    }
  }

  public getContextState() {
    return this.audioContext?.state;
  }
}

export default AudioEngine.getInstance();
