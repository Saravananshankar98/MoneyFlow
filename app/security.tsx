import { useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as LocalAuthentication from "expo-local-authentication";
import { Button, Card, IconButton, Switch, Text, TextInput, useTheme } from "react-native-paper";
import { useSettingsStore } from "../src/store/settingsStore";
import { useNotificationStore } from "../src/store/notificationStore";

export default function SecurityScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { pinEnabled, biometricsEnabled, setPin, clearPin, setBiometricsEnabled } = useSettingsStore();
  const { showNotification } = useNotificationStore();
  const [pin, setPinValue] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([LocalAuthentication.hasHardwareAsync(), LocalAuthentication.isEnrolledAsync()])
      .then(([hasHardware, enrolled]) => setBiometricsAvailable(hasHardware && enrolled));
  }, []);

  const savePin = async () => {
    if (pin !== confirmPin) {
      showNotification("PINs do not match.", "error");
      return;
    }
    try {
      setSaving(true);
      await setPin(pin);
      setPinValue("");
      setConfirmPin("");
      showNotification("App lock enabled.", "success");
    } catch (error) {
      showNotification(error instanceof Error ? error.message : "Unable to set PIN.", "error");
    } finally {
      setSaving(false);
    }
  };

  const disableLock = () => Alert.alert("Disable app lock?", "Biometric unlock will also be disabled.", [
    { text: "Cancel", style: "cancel" },
    { text: "Disable", style: "destructive", onPress: async () => { await clearPin(); showNotification("App lock disabled.", "success"); } },
  ]);

  return (
    <SafeAreaView edges={["top"]} style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}><IconButton icon="arrow-left" onPress={() => router.back()} /><Text variant="headlineMedium" style={styles.title}>App Lock</Text></View>
      <Text variant="bodyMedium" style={styles.subtitle}>Your PIN is stored securely on this device. The app locks again after it goes to the background.</Text>

      {pinEnabled ? (
        <Card style={styles.card}><Card.Content>
          <Text variant="titleMedium">PIN protection is on</Text>
          <View style={styles.settingRow}><View style={styles.grow}><Text variant="bodyLarge">Biometric unlock</Text><Text variant="bodySmall">Use fingerprint or face recognition when available.</Text></View><Switch value={biometricsEnabled} disabled={!biometricsAvailable} onValueChange={setBiometricsEnabled} /></View>
          {!biometricsAvailable ? <Text variant="bodySmall" style={styles.note}>Biometrics are not set up on this device.</Text> : null}
          <Button mode="outlined" textColor={theme.colors.error} onPress={disableLock} style={styles.disableButton}>Disable app lock</Button>
        </Card.Content></Card>
      ) : (
        <Card style={styles.card}><Card.Content>
          <Text variant="titleMedium">Create a PIN</Text>
          <TextInput mode="outlined" label="4–8 digit PIN" value={pin} onChangeText={(value) => setPinValue(value.replace(/\D/g, ""))} keyboardType="number-pad" secureTextEntry maxLength={8} style={styles.field} />
          <TextInput mode="outlined" label="Confirm PIN" value={confirmPin} onChangeText={(value) => setConfirmPin(value.replace(/\D/g, ""))} keyboardType="number-pad" secureTextEntry maxLength={8} style={styles.field} />
          <Button mode="contained" onPress={savePin} loading={saving} disabled={pin.length < 4 || confirmPin.length < 4 || saving} style={styles.saveButton}>Enable app lock</Button>
        </Card.Content></Card>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 }, header: { flexDirection: "row", alignItems: "center", marginLeft: -12 }, title: { fontWeight: "700" }, subtitle: { color: "#64748B", marginTop: 8, marginBottom: 20 }, card: { borderRadius: 18 }, field: { marginTop: 16 }, saveButton: { marginTop: 20 }, settingRow: { flexDirection: "row", alignItems: "center", marginTop: 20 }, grow: { flex: 1 }, note: { color: "#64748B", marginTop: 8 }, disableButton: { marginTop: 20 },
});
