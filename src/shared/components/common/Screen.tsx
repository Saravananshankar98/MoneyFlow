import { PropsWithChildren } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";

export default function Screen({
  children,
}: PropsWithChildren) {
  const theme = useTheme();

  return (
    <SafeAreaView
      edges={["top"]}
      style={[
        styles.container,
        {
          backgroundColor:
            theme.colors.background,
        },
      ]}
    >
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
