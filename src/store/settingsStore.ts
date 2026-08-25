import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { create } from "zustand";

export type AppThemeMode = "system" | "light" | "dark";

export type AppCurrency = {
  code: string;
  symbol: string;
  locale: string;
};

interface SettingsState {
  themeMode: AppThemeMode;
  currency: AppCurrency;
  isLoaded: boolean;
  pinEnabled: boolean;
  pin: string;
  biometricsEnabled: boolean;
  notificationsEnabled: boolean;
  offlineSyncEnabled: boolean;
  lastSyncAt?: string;
  loadSettings: () => Promise<void>;
  setThemeMode: (themeMode: AppThemeMode) => Promise<void>;
  setCurrency: (currency: AppCurrency) => Promise<void>;
  setPin: (pin: string) => Promise<void>;
  verifyPin: (pin: string) => Promise<boolean>;
  clearPin: () => Promise<void>;
  setBiometricsEnabled: (enabled: boolean) => Promise<void>;
  setNotificationsEnabled: (enabled: boolean) => Promise<void>;
  setOfflineSyncEnabled: (enabled: boolean) => Promise<void>;
  markSynced: () => Promise<void>;
}

const STORAGE_KEY = "moneyflow_settings";
const PIN_STORAGE_KEY = "moneyflow_app_pin";

export const CURRENCIES: AppCurrency[] = [
  {
    code: "INR",
    symbol: "Rs.",
    locale: "en-IN",
  },
  {
    code: "USD",
    symbol: "$",
    locale: "en-US",
  },
  {
    code: "EUR",
    symbol: "EUR",
    locale: "de-DE",
  },
  {
    code: "GBP",
    symbol: "GBP",
    locale: "en-GB",
  },
];

const DEFAULT_SETTINGS = {
  themeMode: "system" as AppThemeMode,
  currency: CURRENCIES[0],
  isLoaded: false,
  pinEnabled: false,
  pin: "",
  biometricsEnabled: false,
  notificationsEnabled: false,
  offlineSyncEnabled: true,
  lastSyncAt: undefined,
};

async function persist(
  state: Pick<
    SettingsState,
    | "themeMode"
    | "currency"
    | "pinEnabled"
    | "pin"
    | "biometricsEnabled"
    | "notificationsEnabled"
    | "offlineSyncEnabled"
    | "lastSyncAt"
  >
) {
  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(state)
  );
}

export function formatMoney(
  amount: number,
  currency = DEFAULT_SETTINGS.currency
) {
  return `${currency.symbol} ${amount.toLocaleString(
    currency.locale
  )}`;
}

export function useCurrencyFormatter() {
  const currency = useSettingsStore((state) => state.currency);

  return {
    currency,
    formatMoney: (amount: number) => formatMoney(amount, currency),
  };
}

export const useSettingsStore = create<SettingsState>(
  (set, get) => ({
    ...DEFAULT_SETTINGS,

    loadSettings: async () => {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);

      if (!raw) {
        set({ isLoaded: true });
        return;
      }

      try {
        const parsed = JSON.parse(raw);
        let securePin = await SecureStore.getItemAsync(PIN_STORAGE_KEY);

        // Migrate PINs saved by earlier app versions out of AsyncStorage.
        if (!securePin && typeof parsed.pin === "string" && parsed.pin) {
          await SecureStore.setItemAsync(PIN_STORAGE_KEY, parsed.pin);
          securePin = parsed.pin;
        }

        const pinEnabled = Boolean(parsed.pinEnabled && securePin);
        if (parsed.pin) {
          await AsyncStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ ...parsed, pin: "", pinEnabled })
          );
        }

        set({
          ...DEFAULT_SETTINGS,
          ...parsed,
          currency: parsed.currency ?? DEFAULT_SETTINGS.currency,
          pin: "",
          pinEnabled,
          isLoaded: true,
        });
      } catch (error) {
        console.error("Failed to load settings:", error);
        set({ isLoaded: true });
      }
    },

    setThemeMode: async (themeMode) => {
      const next = {
        ...get(),
        themeMode,
      };

      set({ themeMode });
      await persist(next);
    },

    setCurrency: async (currency) => {
      const next = {
        ...get(),
        currency,
      };

      set({ currency });
      await persist(next);
    },

    setPin: async (pin) => {
      if (!/^\d{4,8}$/.test(pin)) {
        throw new Error("PIN must contain 4 to 8 digits.");
      }

      await SecureStore.setItemAsync(PIN_STORAGE_KEY, pin);

      const next = {
        ...get(),
        pin: "",
        pinEnabled: true,
      };

      set({
        pin: "",
        pinEnabled: true,
      });

      await persist(next);
    },

    verifyPin: async (pin) => {
      const savedPin = await SecureStore.getItemAsync(PIN_STORAGE_KEY);
      return savedPin === pin;
    },

    clearPin: async () => {
      await SecureStore.deleteItemAsync(PIN_STORAGE_KEY);
      const next = {
        ...get(),
        pin: "",
        pinEnabled: false,
        biometricsEnabled: false,
      };

      set({
        pin: "",
        pinEnabled: false,
        biometricsEnabled: false,
      });

      await persist(next);
    },

    setBiometricsEnabled: async (biometricsEnabled) => {
      const next = {
        ...get(),
        biometricsEnabled,
      };

      set({ biometricsEnabled });
      await persist(next);
    },

    setNotificationsEnabled: async (notificationsEnabled) => {
      const next = {
        ...get(),
        notificationsEnabled,
      };

      set({ notificationsEnabled });
      await persist(next);
    },

    setOfflineSyncEnabled: async (offlineSyncEnabled) => {
      const next = {
        ...get(),
        offlineSyncEnabled,
      };

      set({ offlineSyncEnabled });
      await persist(next);
    },

    markSynced: async () => {
      const lastSyncAt = new Date().toISOString();
      const next = {
        ...get(),
        lastSyncAt,
      };

      set({ lastSyncAt });
      await persist(next);
    },
  })
);
