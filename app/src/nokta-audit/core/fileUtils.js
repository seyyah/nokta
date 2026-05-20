// @ts-check
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

/**
 * @param {string} filename
 * @param {string} content
 * @returns {Promise<string>}
 */
export async function writeFile(filename, content) {
  const uri = (FileSystem.documentDirectory || '') + filename;
  await FileSystem.writeAsStringAsync(uri, content);
  return uri;
}

/**
 * @param {string} filename
 * @param {string} base64
 * @returns {Promise<string>}
 */
export async function writeFileBinary(filename, base64) {
  const uri = (FileSystem.documentDirectory || '') + filename;
  await FileSystem.writeAsStringAsync(uri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return uri;
}

/**
 * @param {string} uri
 * @returns {Promise<void>}
 */
export async function shareFile(uri) {
  await Sharing.shareAsync(uri);
}
