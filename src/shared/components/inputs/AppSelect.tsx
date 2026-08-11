import { useState } from "react";
import {
  StyleSheet,
  View,
} from "react-native";
import {
  Icon,
  Menu,
  Text,
  TouchableRipple,
  useTheme,
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
  const theme = useTheme();
  const [visible, setVisible] =
    useState(false);

  const selectedOption = options.find(
    (option) => option.value === value
  );

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.label,
          {
            color:
              theme.colors.onSurfaceVariant,
          },
        ]}
      >
        {label}
      </Text>

      <Menu
        visible={visible}
        onDismiss={() => setVisible(false)}
        anchor={
          <TouchableRipple
            onPress={() => setVisible(true)}
            borderless
            style={[
              styles.input,
              {
                borderColor:
                  theme.colors.outline,
                backgroundColor:
                  theme.colors.surface,
              },
            ]}
          >
            <View style={styles.inputContent}>
              <Text
                style={[
                  styles.value,
                  {
                    color: selectedOption
                      ? theme.colors.onSurface
                      : theme.colors.onSurfaceVariant,
                  },
                ]}
                numberOfLines={1}
              >
                {selectedOption?.label ??
                  placeholder}
              </Text>

              <Icon
                source={
                  visible
                    ? "chevron-up"
                    : "chevron-down"
                }
                size={22}
                color={
                  theme.colors.onSurfaceVariant
                }
              />
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
  },

  input: {
    height: 56,
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: "center",
  },

  inputContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    gap: 10,
  },

  value: {
    flex: 1,
    fontSize: 16,
  },
});
