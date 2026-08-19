import { Stack } from "expo-router";

import { GestureHandlerRootView } from "react-native-gesture-handler";

import { SafeAreaProvider } from "react-native-safe-area-context";

import { StatusBar } from "expo-status-bar";

import AppProvider from "../src/core/providers/AppProvider";


export default function RootLayout(){


    return(

        <GestureHandlerRootView
            style={{flex:1}}
        >

            <SafeAreaProvider>

                <AppProvider>

                    <StatusBar style="auto"/>

                    <Stack

                        screenOptions={{

                            headerShown:false

                        }}

                    />

                </AppProvider>

            </SafeAreaProvider>

        </GestureHandlerRootView>

    )

}