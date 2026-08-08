import { Stack } from "expo-router";

import { GestureHandlerRootView } from "react-native-gesture-handler";

import { SafeAreaProvider } from "react-native-safe-area-context";

import { StatusBar } from "expo-status-bar";

import AppProvider from "../src/core/providers/AppProvider";
import { useEffect } from "react";


export default function RootLayout(){

    useEffect(()=>{
        console.log("testing")
    },[])

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