import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

import * as FileSystem from "expo-file-system/legacy";
import * as DocumentPicker from "expo-document-picker";
import * as Sharing from "expo-sharing";

const BACKUP_VERSION = 1;

/**
 * IMPORTANT:
 *
 * These keys MUST match the keys used
 * by your repositories.
 */
const STORAGE_KEYS = {
  accounts: "moneyflow_accounts",
  transactions: "moneyflow_transactions",
  categories: "moneyflow_categories",
};

interface MoneyFlowBackup {
  app: "MoneyFlow";
  version: number;
  createdAt: string;

  data: {
    accounts: unknown[];
    transactions: unknown[];
    categories: unknown[];
  };
}

// ========================================
// READ STORAGE
// ========================================

function parseStorage(
  value: string | null
): unknown[] {
  if (!value) {
    return [];
  }

  try {
    const parsed =
      JSON.parse(value);

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch (error) {
    console.error(
      "Storage parse error:",
      error
    );

    return [];
  }
}

// ========================================
// CREATE BACKUP
// ========================================

export async function createBackup(): Promise<MoneyFlowBackup> {
  const [
    accounts,
    transactions,
    categories,
  ] = await Promise.all([
    AsyncStorage.getItem(
      STORAGE_KEYS.accounts
    ),

    AsyncStorage.getItem(
      STORAGE_KEYS.transactions
    ),

    AsyncStorage.getItem(
      STORAGE_KEYS.categories
    ),
  ]);

  return {
    app: "MoneyFlow",

    version:
      BACKUP_VERSION,

    createdAt:
      new Date().toISOString(),

    data: {
      accounts:
        parseStorage(accounts),

      transactions:
        parseStorage(
          transactions
        ),

      categories:
        parseStorage(categories),
    },
  };
}

// ========================================
// WEB EXPORT
// ========================================

function downloadOnWeb(
  json: string
) {
  if (
    typeof document ===
    "undefined"
  ) {
    throw new Error(
      "Browser environment is not available."
    );
  }

  const blob =
    new Blob(
      [json],
      {
        type:
          "application/json",
      }
    );

  const url =
    URL.createObjectURL(
      blob
    );

  const link =
    document.createElement(
      "a"
    );

  link.href = url;

  link.download =
    `moneyflow-backup-${Date.now()}.json`;

  document.body.appendChild(
    link
  );

  link.click();

  document.body.removeChild(
    link
  );

  URL.revokeObjectURL(
    url
  );
}

// ========================================
// ANDROID / IOS EXPORT
// ========================================

async function shareNative(
  json: string
) {
  const cacheDirectory =
    FileSystem.cacheDirectory;

  if (!cacheDirectory) {
    throw new Error(
      "File system cache directory is unavailable."
    );
  }

  const fileUri =
    `${cacheDirectory}moneyflow-backup-${Date.now()}.json`;

  await FileSystem.writeAsStringAsync(
    fileUri,
    json
  );

  const sharingAvailable =
    await Sharing.isAvailableAsync();

  if (!sharingAvailable) {
    throw new Error(
      "Sharing is not available on this device."
    );
  }

  await Sharing.shareAsync(
    fileUri,
    {
      mimeType:
        "application/json",

      dialogTitle:
        "Export MoneyFlow Backup",
    }
  );
}

// ========================================
// EXPORT
// ========================================

export async function exportBackup() {
  const backup =
    await createBackup();

  const json =
    JSON.stringify(
      backup,
      null,
      2
    );

  /*
   * WEB
   */
  if (
    Platform.OS === "web"
  ) {
    downloadOnWeb(json);

    return;
  }

  /*
   * ANDROID / IOS
   */
  await shareNative(json);
}

// ========================================
// VALIDATE BACKUP
// ========================================

function validateBackup(
  backup: unknown
): backup is MoneyFlowBackup {
  if (
    !backup ||
    typeof backup !==
      "object"
  ) {
    return false;
  }

  const value =
    backup as Record<
      string,
      unknown
    >;

  if (
    value.app !==
    "MoneyFlow"
  ) {
    return false;
  }

  if (
    typeof value.version !==
    "number"
  ) {
    return false;
  }

  if (
    !value.data ||
    typeof value.data !==
      "object"
  ) {
    return false;
  }

  const data =
    value.data as Record<
      string,
      unknown
    >;

  return (
    Array.isArray(
      data.accounts
    ) &&
    Array.isArray(
      data.transactions
    ) &&
    Array.isArray(
      data.categories
    )
  );
}

// ========================================
// IMPORT
// ========================================

export async function importBackup() {
  const result =
    await DocumentPicker.getDocumentAsync(
      {
        type:
          "application/json",

        copyToCacheDirectory:
          true,

        multiple: false,
      }
    );

  if (
    result.canceled
  ) {
    return {
      success: false,
      canceled: true,
    };
  }

  const asset =
    result.assets?.[0];

  if (!asset) {
    throw new Error(
      "No backup file selected."
    );
  }

  let content: string;

  /*
   * WEB
   */
  if (
    Platform.OS === "web"
  ) {
    content =
      await readWebFile(
        asset
      );
  }

  /*
   * ANDROID / IOS
   */
  else {
    content =
      await FileSystem.readAsStringAsync(
        asset.uri
      );
  }

  let parsed: unknown;

  try {
    parsed =
      JSON.parse(content);
  } catch {
    throw new Error(
      "Invalid JSON backup file."
    );
  }

  if (
    !validateBackup(parsed)
  ) {
    throw new Error(
      "This is not a valid MoneyFlow backup file."
    );
  }

  await Promise.all([
    AsyncStorage.setItem(
      STORAGE_KEYS.accounts,
      JSON.stringify(
        parsed.data.accounts
      )
    ),

    AsyncStorage.setItem(
      STORAGE_KEYS.transactions,
      JSON.stringify(
        parsed.data.transactions
      )
    ),

    AsyncStorage.setItem(
      STORAGE_KEYS.categories,
      JSON.stringify(
        parsed.data.categories
      )
    ),
  ]);

  return {
    success: true,
    canceled: false,
  };
}

// ========================================
// WEB FILE READER
// ========================================

async function readWebFile(
  asset: {
    file?: File;
  }
): Promise<string> {
  if (!asset.file) {
    throw new Error(
      "Unable to access selected file."
    );
  }

  return await asset.file.text();
}
