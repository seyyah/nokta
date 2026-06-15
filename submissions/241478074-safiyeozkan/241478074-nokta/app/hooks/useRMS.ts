import { useMemo } from 'react';
import { computeRMS } from '../services/audio/RMSProcessor';

export function useRMS(samples: number[]) {
  return useMemo(() => computeRMS(samples), [samples]);
}
