import Constants from 'expo-constants';
import { NativeModules } from 'react-native';

/** Telefonda 127.0.0.1 çalışmaz — Expo debugger IP'sine çevir */
export function getExpoMetroOrigin(): string | null {
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    return hostUri.startsWith('http') ? hostUri : `http://${hostUri}`;
  }

  const debuggerHost = Constants.expoGoConfig?.debuggerHost;
  if (debuggerHost) {
    return `http://${debuggerHost}`;
  }

  const scriptURL: string | undefined = NativeModules.SourceCode?.scriptURL;
  if (scriptURL) {
    const match = scriptURL.match(/^(https?:\/\/[^/?#]+)/);
    if (match) return match[1];
  }

  return null;
}

export function rewriteLocalhostUri(uri: string): string {
  const origin = getExpoMetroOrigin();
  if (!origin) return uri;

  try {
    const target = new URL(origin);
    const src = new URL(uri);
    if (src.hostname === '127.0.0.1' || src.hostname === 'localhost') {
      src.hostname = target.hostname;
      src.port = target.port;
      src.protocol = target.protocol;
      return src.toString();
    }
  } catch {
    return uri;
  }

  return uri;
}

export function normalizeFileUri(uri: string): string {
  if (uri.startsWith('file://') || uri.startsWith('http://') || uri.startsWith('https://')) {
    return rewriteLocalhostUri(uri);
  }
  return rewriteLocalhostUri(`file://${uri}`);
}
