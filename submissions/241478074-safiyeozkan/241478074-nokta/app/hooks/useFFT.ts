import { useMemo } from 'react';
import { computeSpectrum } from '../services/audio/FFTProcessor';

export function useFFT(samples: number[], bins = 18) {
  return useMemo(() => computeSpectrum(samples, bins), [samples, bins]);
}
