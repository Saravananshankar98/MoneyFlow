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

export default function AppProvider({

    children

}:PropsWithChildren){
    const colorScheme =
        useColorScheme();

    const {
        themeMode,
        loadSettings,
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

    const shouldUseDark =
        themeMode === "dark" ||
        (
            themeMode === "system" &&
            colorScheme === "dark"
        );

    return(

        <PaperProvider theme={shouldUseDark ? DarkTheme : LightTheme}>

            {children}

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
