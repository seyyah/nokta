import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import ViewShot from 'react-native-view-shot';

export async function captureScreen(): Promise<string> {
    try {
        // Mock implementation - in production, use ViewShot or similar
        const filename = `screenshot-${Date.now()}.png`;
        const filepath = `${FileSystem.documentDirectory}${filename}`;
        // Placeholder: actual implementation would capture the current view
        console.log('[capture] Screenshot saved:', filepath);
        return filepath;
    } catch (error) {
        console.error('[capture] Failed to capture screen:', error);
        throw error;
    }
}

export async function captureRef(ref: React.RefObject<any>): Promise<string> {
    try {
        if (ref && ref.current) {
            const result = await ref.current.capture?.();
            return result || '';
        }
        return '';
    } catch (error) {
        console.error('[capture] Failed to capture ref:', error);
        throw error;
    }
}

export async function writeFile(filename: string, content: string): Promise<string> {
    try {
        const filepath = `${FileSystem.documentDirectory}${filename}`;
        await FileSystem.writeAsStringAsync(filepath, content, {
            encoding: FileSystem.EncodingType.UTF8,
        });
        console.log('[capture] File written:', filepath);
        return filepath;
    } catch (error) {
        console.error('[capture] Failed to write file:', error);
        throw error;
    }
}

export async function writeFileBinary(filename: string, base64: string): Promise<string> {
    try {
        const filepath = `${FileSystem.documentDirectory}${filename}`;
        await FileSystem.writeAsStringAsync(filepath, base64, {
            encoding: FileSystem.EncodingType.Base64,
        });
        console.log('[capture] Binary file written:', filepath);
        return filepath;
    } catch (error) {
        console.error('[capture] Failed to write binary file:', error);
        throw error;
    }
}

export async function shareFile(uri: string): Promise<void> {
    try {
        if (!(await Sharing.isAvailableAsync())) {
            console.warn('[capture] Sharing not available');
            return;
        }
        await Sharing.shareAsync(uri);
    } catch (error) {
        console.error('[capture] Failed to share file:', error);
        throw error;
    }
}
