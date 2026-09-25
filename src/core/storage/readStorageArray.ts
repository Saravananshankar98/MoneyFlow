import AsyncStorage from "@react-native-async-storage/async-storage";

/** Returns an empty array when persisted data is missing or malformed. */
export async function readStorageArray<T>(key: string): Promise<T[]> {
  const raw = await AsyncStorage.getItem(key);

  if (!raw) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch (error) {
    console.error(`Unable to parse stored data for ${key}:`, error);
    return [];
  }
}
