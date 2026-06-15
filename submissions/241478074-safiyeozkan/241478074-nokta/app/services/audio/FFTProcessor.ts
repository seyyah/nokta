import FFT from 'fft.js';

export function computeSpectrum(samples: number[], bins = 16): number[] {
  if (samples.length < 2) {
    return Array(bins).fill(0);
  }

  const size = 1 << Math.ceil(Math.log2(samples.length));
  const input = new Array(size).fill(0);
  for (let i = 0; i < samples.length; i += 1) {
    input[i] = samples[i];
  }

  const fft = new FFT(size);
  const out = fft.createComplexArray();
  const data = fft.toComplexArray(input, fft.createComplexArray());
  fft.transform(out, data);

  const spectrum = new Array(bins).fill(0);
  const binWidth = Math.max(1, Math.floor((size / 2) / bins));

  for (let i = 0; i < bins; i += 1) {
    const start = i * binWidth;
    const end = Math.min((i + 1) * binWidth, size / 2);
    let total = 0;
    for (let j = start; j < end; j += 1) {
      const real = out[2 * j] ?? 0;
      const imag = out[2 * j + 1] ?? 0;
      total += Math.sqrt(real * real + imag * imag);
    }
    spectrum[i] = end > start ? total / (end - start) : 0;
  }

  const max = Math.max(...spectrum, 1e-6);
  return spectrum.map((value) => Math.min(1, value / max));
}
