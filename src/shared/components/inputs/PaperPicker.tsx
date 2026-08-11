import React, {
  Children,
  isValidElement,
  useMemo,
  useState,
} from "react";
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

type PickerValue = string | number;

interface PickerProps {
  selectedValue?: PickerValue;
  onValueChange?: (value: PickerValue) => void;
  children: React.ReactNode;
}

interface PickerItemProps {
  label: string;
  value: PickerValue;
}

function PickerItem(
  _props: PickerItemProps
) {
  return null;
}

function PaperPicker({
  selectedValue,
  onValueChange,
  children,
}: PickerProps) {
  const theme = useTheme();
  const [visible, setVisible] =
    useState(false);

  const options =
    useMemo(() => {
      return Children.toArray(children)
        .filter(isValidElement)
        .map((child) => {
          const props =
            child.props as PickerItemProps;

          return {
            label: props.label,
            value: props.value,
          };
        });
    }, [children]);

  const selectedOption =
    options.find(
      (option) =>
        option.value === selectedValue
    ) ?? options[0];

  return (
    <Menu
      visible={visible}
      onDismiss={() =>
        setVisible(false)
      }
      anchor={
        <TouchableRipple
          borderless
          onPress={() =>
            setVisible(true)
          }
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
          <View style={styles.row}>
            <Text
              style={[
                styles.value,
                {
                  color: selectedValue
                    ? theme.colors.onSurface
                    : theme.colors.onSurfaceVariant,
                },
              ]}
              numberOfLines={1}
            >
              {selectedOption?.label ??
                "Select"}
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
          key={String(option.value)}
          title={option.label}
          onPress={() => {
            onValueChange?.(
              option.value
            );
            setVisible(false);
          }}
        />
      ))}
    </Menu>
  );
}

export const Picker = Object.assign(
  PaperPicker,
  {
    Item: PickerItem,
  }
);

const styles = StyleSheet.create({
  input: {
    minHeight: 48,
    justifyContent: "center",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10,
  },

  value: {
    flex: 1,
    fontSize: 16,
  },
});
