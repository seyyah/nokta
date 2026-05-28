
import { useEffect, useMemo, useRef, useState } from 'react';
import { AudioEngine, type MicUpdate } from '../services/audio/AudioEngine';

const engine = new AudioEngine();

export function useMicrophone() {
  const [permission, setPermission] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [amplitude, setAmplitude] = useState(0);
  const [rms, setRms] = useState(0);
  const [metering, setMetering] = useState(-160);
  const [samples, setSamples] = useState<number[]>([]);
  const [uri, setUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const latestUpdate = useRef<MicUpdate | null>(null);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        await engine.initialize();
        if (mounted) setPermission(true);
      } catch (err) {
        if (mounted) {
          setError((err as Error).message);
          setPermission(false);
        }
      }
    }

    init();
    return () => {
      mounted = false;
      engine.stop();
    };
  }, []);

  const handlers = useMemo(() => ({
    async start() {
      try {
        await engine.start((update) => {
          latestUpdate.current = update;
          setIsRecording(update.isRecording);
          setAmplitude(update.amplitude);
          setRms(update.rms);
          setMetering(update.metering);
          setSamples(update.samples);
          setUri(update.uri);
        });
        setError(null);
      } catch (err) {
        setError((err as Error).message);
      }
    },
    async stop() {
      await engine.stop();
      setIsRecording(false);
    },
  }), []);

  return {
    permission,
    isRecording,
    amplitude,
    rms,
    metering,
    samples,
    uri,
    error,
    start: handlers.start,
    stop: handlers.stop,
  };
}
