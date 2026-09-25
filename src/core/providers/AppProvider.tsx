import { PropsWithChildren } from "react";

import { useEffect } from "react";

import { useColorScheme } from "react-native";

import {
    PaperProvider,
    Snackbar,
} from "react-native-paper";

import {
    DarkTheme,
    LightTheme,
} from "../theme";

import {
    useSettingsStore,
} from "../../store/settingsStore";

import {
    useNotificationStore,
} from "../../store/notificationStore";
import { useRecurringStore } from "../../store/recurringStore";
import AppLockGate from "../security/AppLockGate";
import { checkFinancialReminders } from "../../services/reminderService";

export default function AppProvider({

    children

}:PropsWithChildren){
    const colorScheme =
        useColorScheme();

    const {
        themeMode,
        loadSettings,
        isLoaded,
        notificationsEnabled,
    } = useSettingsStore();

    const {
        visible,
        message,
        type,
        hideNotification,
    } = useNotificationStore();

    useEffect(() => {
        loadSettings();
    }, [loadSettings]);

    useEffect(() => {
        useRecurringStore.getState().processDueItems();
    }, []);

    useEffect(() => {
        if (isLoaded && notificationsEnabled) {
            checkFinancialReminders().catch((error) =>
                console.error("Reminder check failed:", error)
            );
        }
    }, [isLoaded, notificationsEnabled]);

    const shouldUseDark =
        themeMode === "dark" ||
        (
            themeMode === "system" &&
            colorScheme === "dark"
        );

    return(

        <PaperProvider theme={shouldUseDark ? DarkTheme : LightTheme}>

            <AppLockGate>{children}</AppLockGate>

            <Snackbar
                visible={visible}
                onDismiss={hideNotification}
                duration={3000}
                style={{
                    backgroundColor:
                        type === "success"
                            ? "#16A34A"
                            : type === "error"
                              ? "#D32F2F"
                              : shouldUseDark
                                ? "#334155"
                                : "#1F2937",
                }}
                action={{
                    label: "OK",
                    onPress: hideNotification,
                    textColor: "#FFFFFF",
                }}
            >
                {message}
            </Snackbar>

        </PaperProvider>

    )

}
