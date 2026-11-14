import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

const VAULT_DIR = (FileSystem.documentDirectory || '') + 'vault/';

/**
 * Ensures the on-device sandbox vault directory exists
 */
export const ensureVaultDirectoryAsync = async () => {
  if (Platform.OS === 'web' || !FileSystem.documentDirectory) return;
  try {
    const dirInfo = await FileSystem.getInfoAsync(VAULT_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(VAULT_DIR, { intermediates: true });
    }
  } catch (err) {
    console.warn('[VAULT] Could not ensure local sandbox directory:', err);
  }
};

/**
 * Copies a selected or captured file into the private sandbox directory:
 * FileSystem.documentDirectory + 'vault/'
 */
export const saveFileToLocalVault = async (sourceUri, fileName = 'evidence') => {
  if (Platform.OS === 'web' || !FileSystem.documentDirectory) {
    return sourceUri;
  }
  try {
    await ensureVaultDirectoryAsync();
    const cleanName = `${Date.now()}_${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const targetUri = VAULT_DIR + cleanName;
    await FileSystem.copyAsync({ from: sourceUri, to: targetUri });
    return targetUri;
  } catch (err) {
    console.warn('[VAULT] Fallback to sourceUri, copy failed:', err.message);
    return sourceUri;
  }
};

/**
 * Deletes a file from the local on-device sandbox
 */
export const deleteLocalVaultFile = async (fileUri) => {
  if (Platform.OS === 'web' || !fileUri || !fileUri.includes('vault/')) return;
  try {
    const info = await FileSystem.getInfoAsync(fileUri);
    if (info.exists) {
      await FileSystem.deleteAsync(fileUri, { idempotent: true });
    }
  } catch (err) {
    console.warn('[VAULT] Could not delete local file:', err.message);
  }
};
