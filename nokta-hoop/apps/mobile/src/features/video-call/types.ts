import type { CallTranscript } from '@nokta-hoop/hoop-call';

export type DemoUser = {
  id: string;
  name: string;
};

export type JoinStatus = 'idle' | 'joining' | 'leaving';

export type TranscriptFetchStatus =
  | 'idle'
  | 'processing'
  | 'ready'
  | 'not_ready'
  | 'failed';

export type LeaveResult = {
  transcript: CallTranscript | null;
  status: TranscriptFetchStatus;
  message: string | null;
};

export type LeaveOptions = {
  endCall?: boolean;
  transcriptPollAttempts?: number;
};

export type JoinMediaMode = 'requester' | 'mentor' | 'default';
