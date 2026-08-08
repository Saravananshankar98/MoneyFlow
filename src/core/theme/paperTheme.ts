import {
    MD3DarkTheme,
    MD3LightTheme,
} from "react-native-paper";

import {
    LightColors,
    DarkColors
} from "./colors";

export const LightTheme={

    ...MD3LightTheme,

    colors:{

        ...MD3LightTheme.colors,

        ...LightColors

    }

}

export const DarkTheme={

    ...MD3DarkTheme,

    colors:{

        ...MD3DarkTheme.colors,

        ...DarkColors

    }

}