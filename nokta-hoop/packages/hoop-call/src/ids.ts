export const DEFAULT_CALL_ID = 'nokta-hoop-demo';
export const DEFAULT_USER_NAME = 'Nokta Kullanıcı';

export const createGuestId = () =>
  `guest-${Math.floor(1000 + Math.random() * 9000)}`;

export const normalizeUserId = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);

export const normalizeCallId = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96);

export const normalizeCallType = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
