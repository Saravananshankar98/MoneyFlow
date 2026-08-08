import { PropsWithChildren } from "react";

import { PaperProvider } from "react-native-paper";

import { LightTheme } from "../theme";

export default function AppProvider({

    children

}:PropsWithChildren){

    return(

        <PaperProvider theme={LightTheme}>

            {children}

        </PaperProvider>

    )

}