import { useEffect, useState } from "react";

import {
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import {
  Button,
  Dialog,
  Icon,
  Portal,
  Text,
  TextInput,
} from "react-native-paper";

import {
  useCategoryStore,
} from "../../../store/categoryStore";

interface Props {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: "expense" | "income" | "both";
}

const DEFAULT_ICONS = [
  "food",
  "cart",
  "bus",
  "home",
  "medical-bag",
  "movie",
  "school",
  "coffee",
  "cash",
  "wallet",
];

const DEFAULT_COLORS = [
  "#2563EB",
  "#16A34A",
  "#D32F2F",
  "#F59E0B",
  "#7C3AED",
  "#0891B2",
  "#DB2777",
  "#64748B",
];

export default function CategoryPicker({
  value,
  onChange,
  error,
  type = "expense",
}: Props) {
  const {
    categories,
    loadCategories,
    addCategory,
  } = useCategoryStore();

  const [open, setOpen] =
    useState(false);

  const [addOpen, setAddOpen] =
    useState(false);

  const [name, setName] =
    useState("");

  const [selectedIcon, setSelectedIcon] =
    useState(DEFAULT_ICONS[0]);

  const [selectedColor, setSelectedColor] =
    useState(DEFAULT_COLORS[0]);

  const [saving, setSaving] =
    useState(false);

  const [localError, setLocalError] =
    useState("");

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const filteredCategories =
    categories.filter((category) => {
      if (
        category.type === "both"
      ) {
        return true;
      }

      return (
        category.type === type
      );
    });

  const selectedCategory =
    categories.find(
      (category) =>
        category.id === value
    );

  const handleAddCategory =
    async () => {
      const trimmedName =
        name.trim();

      if (!trimmedName) {
        setLocalError(
          "Category name is required"
        );
        return;
      }

      if (trimmedName.length < 2) {
        setLocalError(
          "Category name must be at least 2 characters"
        );
        return;
      }

      setLocalError("");
      setSaving(true);

      const now =
        new Date().toISOString();

      const id =
        `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`;

      const result =
        await addCategory({
          id,
          name: trimmedName,
          icon: selectedIcon,
          color: selectedColor,
          type,
          createdAt: now,
          updatedAt: now,
        });

      setSaving(false);

      if (!result.success) {
        setLocalError(
          result.error ??
            "Unable to add category"
        );
        return;
      }

      /*
       * Select newly created category
       */
      onChange(id);

      /*
       * Close dialogs
       */
      setAddOpen(false);
      setOpen(false);

      /*
       * Reset form
       */
      setName("");
      setSelectedIcon(
        DEFAULT_ICONS[0]
      );
      setSelectedColor(
        DEFAULT_COLORS[0]
      );
    };

  return (
    <>
      {/* ================================= */}
      {/* SELECT FIELD */}
      {/* ================================= */}

      <View>
        <Button
          mode="outlined"
          onPress={() => {
            setOpen(true);
          }}
          contentStyle={
            styles.buttonContent
          }
          style={styles.button}
        >
          <View
            style={
              styles.selectedContent
            }
          >
            {selectedCategory ? (
              <>
                <View
                  style={[
                    styles.iconCircle,
                    {
                      backgroundColor:
                        selectedCategory.color ??
                        "#2563EB",
                    },
                  ]}
                >
                  <Icon
                    source={
                      selectedCategory.icon ??
                      "tag"
                    }
                    size={18}
                    color="#FFFFFF"
                  />
                </View>

                <Text
                  variant="bodyLarge"
                >
                  {
                    selectedCategory.name
                  }
                </Text>
              </>
            ) : (
              <>
                <Icon
                  source="tag-outline"
                  size={20}
                  color="#777"
                />

                <Text
                  style={
                    styles.placeholder
                  }
                >
                  Select category
                </Text>
              </>
            )}
          </View>
        </Button>

        {error && (
          <Text
            style={
              styles.errorText
            }
          >
            {error}
          </Text>
        )}
      </View>

      {/* ================================= */}
      {/* CATEGORY LIST */}
      {/* ================================= */}

      <Portal>
        <Dialog
          visible={open}
          onDismiss={() =>
            setOpen(false)
          }
          style={
            styles.dialog
          }
        >
          <Dialog.Title>
            Select Category
          </Dialog.Title>

          <Dialog.ScrollArea>
            <ScrollView
              contentContainerStyle={
                styles.list
              }
            >
              {filteredCategories.map(
                (category) => {
                  const selected =
                    category.id ===
                    value;

                  return (
                    <Button
                      key={
                        category.id
                      }
                      mode={
                        selected
                          ? "contained"
                          : "outlined"
                      }
                      onPress={() => {
                        onChange(
                          category.id
                        );

                        setOpen(
                          false
                        );
                      }}
                      style={
                        styles.categoryButton
                      }
                      contentStyle={
                        styles.categoryButtonContent
                      }
                    >
                      <View
                        style={
                          styles.categoryRow
                        }
                      >
                        <View
                          style={[
                            styles.iconCircle,
                            {
                              backgroundColor:
                                category.color ??
                                "#2563EB",
                            },
                          ]}
                        >
                          <Icon
                            source={
                              category.icon ??
                              "tag"
                            }
                            size={18}
                            color="#FFFFFF"
                          />
                        </View>

                        <Text>
                          {
                            category.name
                          }
                        </Text>
                      </View>
                    </Button>
                  );
                }
              )}

              {/* ================================= */}
              {/* ADD NEW */}
              {/* ================================= */}

              <Button
                mode="outlined"
                icon="plus"
                onPress={() => {
                  setLocalError("");
                  setName("");
                  setAddOpen(
                    true
                  );
                }}
                style={[
                  styles.categoryButton,
                  styles.addButton,
                ]}
              >
                Add New Category
              </Button>
            </ScrollView>
          </Dialog.ScrollArea>

          <Dialog.Actions>
            <Button
              onPress={() =>
                setOpen(false)
              }
            >
              Cancel
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* ================================= */}
      {/* ADD CATEGORY */}
      {/* ================================= */}

      <Portal>
        <Dialog
          visible={addOpen}
          onDismiss={() => {
            if (!saving) {
              setAddOpen(false);
            }
          }}
          style={
            styles.dialog
          }
        >
          <Dialog.Title>
            Add New Category
          </Dialog.Title>

          <Dialog.Content>
            <TextInput
              mode="outlined"
              label="Category name"
              placeholder="Food"
              value={name}
              onChangeText={(text) => {
                setName(text);
                setLocalError("");
              }}
              autoFocus
            />

            {/* ================================= */}
            {/* ICON */}
            {/* ================================= */}

            <Text
              variant="labelLarge"
              style={
                styles.optionTitle
              }
            >
              Icon
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={
                false
            }
              contentContainerStyle={
                styles.optionsRow
              }
            >
              {DEFAULT_ICONS.map(
                (icon) => {
                  const selected =
                    icon ===
                    selectedIcon;

                  return (
                    <Button
                      key={icon}
                      mode={
                        selected
                          ? "contained"
                          : "outlined"
                      }
                      onPress={() =>
                        setSelectedIcon(
                          icon
                        )
                      }
                      compact
                      style={
                        styles.iconButton
                      }
                    >
                      <Icon
                        source={icon}
                        size={20}
                      />
                    </Button>
                  );
                }
              )}
            </ScrollView>

            {/* ================================= */}
            {/* COLOR */}
            {/* ================================= */}

            <Text
              variant="labelLarge"
              style={
                styles.optionTitle
              }
            >
              Color
            </Text>

            <View
              style={
                styles.colorsRow
              }
            >
              {DEFAULT_COLORS.map(
                (color) => {
                  const selected =
                    color ===
                    selectedColor;

                  return (
                    <Button
                      key={color}
                      onPress={() =>
                        setSelectedColor(
                          color
                        )
                      }
                      compact
                      style={
                        styles.colorButton
                      }
                    >
                      <View
                        style={[
                          styles.colorCircle,
                          {
                            backgroundColor:
                              color,
                            borderWidth:
                              selected
                                ? 3
                                : 0,
                            borderColor:
                              "#000000",
                          },
                        ]}
                      />
                    </Button>
                  );
                }
              )}
            </View>

            {localError && (
              <Text
                style={
                  styles.errorText
                }
              >
                {localError}
              </Text>
            )}
          </Dialog.Content>

          <Dialog.Actions>
            <Button
              disabled={saving}
              onPress={() =>
                setAddOpen(false)
              }
            >
              Cancel
            </Button>

            <Button
              mode="contained"
              loading={saving}
              disabled={saving}
              onPress={
                handleAddCategory
              }
            >
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}

// ========================================
// STYLES
// ========================================

const styles =
  StyleSheet.create({
    button: {
      borderRadius: 8,
    },

    buttonContent: {
      height: 52,
      justifyContent:
        "flex-start",
    },

    selectedContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },

    placeholder: {
      color: "#777",
    },

    iconCircle: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: "center",
      justifyContent:
        "center",
    },

    errorText: {
      color: "#D32F2F",
      marginTop: 5,
      marginLeft: 4,
    },

    dialog: {
      borderRadius: 18,
    },

    list: {
      gap: 10,
      paddingVertical: 8,
    },

    categoryButton: {
      borderRadius: 10,
    },

    categoryButtonContent: {
      minHeight: 48,
      justifyContent:
        "flex-start",
    },

    categoryRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },

    addButton: {
      marginTop: 6,
    },

    optionTitle: {
      marginTop: 18,
      marginBottom: 8,
    },

    optionsRow: {
      gap: 8,
      paddingBottom: 4,
    },

    iconButton: {
      minWidth: 44,
    },

    colorsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
    },

    colorButton: {
      minWidth: 44,
    },

    colorCircle: {
      width: 30,
      height: 30,
      borderRadius: 15,
    },
  });