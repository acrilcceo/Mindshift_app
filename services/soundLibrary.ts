import { EmotionalState, SoundAsset, SoundMix, SoundLayer } from '../types';

export const soundAssets: SoundAsset[] = [
  {
    id: 'frequency-432',
    category: 'frequency',
    title: '432 Hz Warm Grounding',
    description: 'A warm, soothing frequency many people use to support relaxation and grounded presence.',
    supportTag: 'For grounding',
    emotionalTags: ['overthinking', 'stress'] as EmotionalState[],
    sourceType: 'generated',
    loop: true,
    metadata: {
      frequencyHz: 432,
      recommendedUsage: ['calm', 'focus'],
      recommendedCopy: 'Often used for softer thinking and gentle focus.'
    }
  },
  {
    id: 'ambient-rain',
    category: 'ambient',
    title: 'Soft Rain',
    description: 'A soft, steady rain bed many people use to support calm focus and rest.',
    supportTag: 'For soft focus',
    emotionalTags: ['anxiety', 'overthinking'] as EmotionalState[],
    sourceType: 'file',
    url: '/audio/rain-loop.mp3',
    loop: true,
    metadata: {
      recommendedUsage: ['sleep', 'calm'],
      recommendedCopy: 'Commonly associated with unwinding at the end of the day.'
    }
  }
];

export const createDefault432RainMix = (): SoundMix => {
  const layers: SoundLayer[] = [
    {
      id: 'layer-frequency-432',
      layerType: 'baseFrequency',
      assetId: 'frequency-432',
      volume: 0.6,
      muted: false,
      fadeInMs: 800,
      fadeOutMs: 800
    },
    {
      id: 'layer-ambient-rain',
      layerType: 'ambient',
      assetId: 'ambient-rain',
      volume: 0.7,
      muted: false,
      fadeInMs: 800,
      fadeOutMs: 800
    }
  ];

  return {
    id: 'mix-432-rain',
    name: '432 Hz + Rain',
    layers,
    usageMode: 'calm',
    emotionalState: 'overthinking',
    loop: true,
    createdFromSuggestion: true,
    createdAt: Date.now()
  };
};

