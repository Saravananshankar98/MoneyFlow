import { PropsWithChildren, useEffect, useRef, useState } from "react";
import { AppState, StyleSheet, View } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import { Button, Text, TextInput, useTheme } from "react-native-paper";
import { useSettingsStore } from "../../store/settingsStore";

export default function AppLockGate({ children }: PropsWithChildren) {
  const theme = useTheme();
  const { isLoaded, pinEnabled, biometricsEnabled, verifyPin } = useSettingsStore();
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const shouldLockOnResume = useRef(false);

  useEffect(() => {
    if (isLoaded && !pinEnabled) setUnlocked(true);
  }, [isLoaded, pinEnabled]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "inactive" || nextState === "background") shouldLockOnResume.current = true;
      if (nextState === "active" && shouldLockOnResume.current && pinEnabled) {
        shouldLockOnResume.current = false;
        setPin("");
        setError("");
        setUnlocked(false);
      }
    });
    return () => subscription.remove();
  }, [pinEnabled]);

  const unlockWithPin = async () => {
    setChecking(true);
    try {
      if (await verifyPin(pin)) {
        setUnlocked(true);
        setPin("");
        setError("");
      } else {
        setError("Incorrect PIN. Try again.");
      }
    } finally {
      setChecking(false);
    }
  };

  const unlockWithBiometrics = async () => {
    setChecking(true);
    try {
      const result = await LocalAuthentication.authenticateAsync({ promptMessage: "Unlock MoneyFlow", cancelLabel: "Use PIN" });
      if (result.success) setUnlocked(true);
    } finally {
      setChecking(false);
    }
  };

  if (!isLoaded || unlocked) return <>{children}</>;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="headlineMedium" style={styles.title}>Unlock MoneyFlow</Text>
      <Text variant="bodyMedium" style={styles.subtitle}>Enter your PIN to continue.</Text>
      <TextInput mode="outlined" label="PIN" value={pin} onChangeText={(value) => { setPin(value.replace(/\D/g, "")); setError(""); }} keyboardType="number-pad" secureTextEntry maxLength={8} error={Boolean(error)} onSubmitEditing={unlockWithPin} />
      {error ? <Text style={[styles.error, { color: theme.colors.error }]}>{error}</Text> : null}
      <Button mode="contained" onPress={unlockWithPin} loading={checking} disabled={pin.length < 4 || checking} style={styles.button}>Unlock</Button>
      {biometricsEnabled ? <Button mode="text" icon="fingerprint" onPress={unlockWithBiometrics} disabled={checking}>Use biometrics</Button> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24 },
  title: { fontWeight: "700" }, subtitle: { marginTop: 8, marginBottom: 24 },
  error: { marginTop: 6 }, button: { marginTop: 20 },
});
