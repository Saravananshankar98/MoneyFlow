import { useState } from "react";
import {
  StyleSheet,
  View,
} from "react-native";
import {
  Menu,
  Text,
  TouchableRipple,
} from "react-native-paper";

interface Option {
  label: string;
  value: string;
}

interface Props {
  label: string;
  value: string;
  options: Option[];
  placeholder?: string;
  onChange: (value: string) => void;
}

export default function AppSelect({
  label,
  value,
  options,
  placeholder = "Select",
  onChange,
}: Props) {
  const [visible, setVisible] =
    useState(false);

  const selectedOption = options.find(
    (option) => option.value === value
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
      </Text>

      <Menu
        visible={visible}
        onDismiss={() => setVisible(false)}
        anchor={
          <TouchableRipple
            onPress={() => setVisible(true)}
            borderless
            style={styles.input}
          >
            <View style={styles.inputContent}>
              <Text
                style={
                  selectedOption
                    ? styles.value
                    : styles.placeholder
                }
              >
                {selectedOption?.label ??
                  placeholder}
              </Text>

              <Text style={styles.arrow}>
                ▼
              </Text>
            </View>
          </TouchableRipple>
        }
      >
        {options.map((option) => (
          <Menu.Item
            key={option.value}
            title={option.label}
            onPress={() => {
              onChange(option.value);
              setVisible(false);
            }}
          />
        ))}
      </Menu>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },

  label: {
    marginBottom: 6,
    fontSize: 13,
    color: "#49454F",
  },

  input: {
    height: 56,
    borderWidth: 1,
    borderColor: "#79747E",
    borderRadius: 4,
    justifyContent: "center",
  },

  inputContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
  },

  value: {
    fontSize: 16,
    color: "#1D1B20",
  },

  placeholder: {
    fontSize: 16,
    color: "#79747E",
  },

  arrow: {
    fontSize: 12,
    color: "#49454F",
  },
});