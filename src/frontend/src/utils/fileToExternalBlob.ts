import { ExternalBlob } from '../backend';

/**
 * Converts a browser File object to an ExternalBlob for blob-storage
 * @param file - The File object from an input element
 * @param onProgress - Optional callback for upload progress (0-100)
 * @returns Promise resolving to an ExternalBlob
 */
export async function fileToExternalBlob(
  file: File,
  onProgress?: (percentage: number) => void
): Promise<ExternalBlob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const arrayBuffer = reader.result as ArrayBuffer;
        const uint8Array = new Uint8Array(arrayBuffer);
        
        let blob = ExternalBlob.fromBytes(uint8Array);
        
        // Attach progress callback if provided
        if (onProgress) {
          blob = blob.withUploadProgress(onProgress);
        }
        
        resolve(blob);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Formats file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
