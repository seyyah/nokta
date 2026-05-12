import { useEffect, useRef } from 'react';
import { CallingState, type Call } from '@stream-io/video-client';

export function useCallEndedEffect(input: {
  call: Call;
  disabled?: boolean;
  onCallEnded: () => Promise<void>;
}) {
  const handledRef = useRef(false);

  useEffect(() => {
    handledRef.current = false;
  }, [input.call]);

  useEffect(() => {
    const handleCallEnded = () => {
      if (input.disabled || handledRef.current) {
        return;
      }

      handledRef.current = true;
      void input.onCallEnded();
    };

    const offCallEnded = input.call.on('call.ended', handleCallEnded);
    const offSfuCallEnded = input.call.on('callEnded', handleCallEnded);
    const callingStateSubscription = input.call.state.callingState$.subscribe(
      (callingState) => {
        if (callingState === CallingState.LEFT) {
          handleCallEnded();
        }
      },
    );
    const endedAtSubscription = input.call.state.endedAt$.subscribe((endedAt) => {
      if (endedAt) {
        handleCallEnded();
      }
    });
    const fallbackTimer = setInterval(() => {
      if (
        input.call.state.callingState === CallingState.LEFT ||
        input.call.state.endedAt
      ) {
        handleCallEnded();
      }
    }, 1000);

    return () => {
      offCallEnded();
      offSfuCallEnded();
      callingStateSubscription.unsubscribe();
      endedAtSubscription.unsubscribe();
      clearInterval(fallbackTimer);
    };
  }, [input.call, input.disabled, input.onCallEnded]);

  return {
    markHandled: () => {
      handledRef.current = true;
    },
  };
}
