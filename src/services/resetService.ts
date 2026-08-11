import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEYS = [
  "moneyflow_accounts",
  "moneyflow_categories",
  "moneyflow_transactions",
];

export async function resetAllData() {
  await AsyncStorage.multiRemove(
    STORAGE_KEYS
  );
}