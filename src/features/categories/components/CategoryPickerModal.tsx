import { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  View,
} from "react-native";
import {
  Button,
  Dialog,
  Divider,
  Icon,
  Modal,
  Portal,
  Text,
  TextInput,
  TouchableRipple,
} from "react-native-paper";
import { useCategoryStore } from "../../../store/categoryStore";
import { Category } from "../types/category";

interface Props {
  visible: boolean;
  value: string;
  type?: "expense" | "income";
  onSelect: (category: Category | null) => void;
  onDismiss: () => void;
}

export default function CategoryPickerModal({
  visible,
  value,
  type = "expense",
  onSelect,
  onDismiss,
}: Props) {
  const {
    categories,
    loadCategories,
    addCategory,
  } = useCategoryStore();

  const [addVisible, setAddVisible] =
    useState(false);

  const [categoryName, setCategoryName] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {
    if (visible) {
      loadCategories();
    }
  }, [visible, loadCategories]);

  const filteredCategories =
    categories.filter(
      (category) =>
        category.type === type ||
        category.type === "both"
    );

  const handleAddCategory = async () => {
    const name =
      categoryName.trim();

    if (!name) {
      return;
    }

    const alreadyExists =
      categories.some(
        (category) =>
          category.name.toLowerCase() ===
          name.toLowerCase()
      );

    if (alreadyExists) {
      return;
    }

    setSaving(true);

    const now =
      new Date().toISOString();

    const newCategory: Category = {
      id: Date.now().toString(),
      name,
      icon:
        type === "expense"
          ? "tag"
          : "cash",
      color:
        type === "expense"
          ? "#2563EB"
          : "#16A34A",
      type,
      createdAt: now,
      updatedAt: now,
    };

    await addCategory(
      newCategory
    );

    setSaving(false);
    setCategoryName("");
    setAddVisible(false);

    // Automatically select newly created category
    onSelect(newCategory);

    onDismiss();
  };

  const handleSelect = (
    category: Category | null
  ) => {
    onSelect(category);
    onDismiss();
  };

  return (
    <Portal>
      {/* CATEGORY PICKER */}

      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={
          styles.modal
        }
      >
        <View style={styles.header}>
          <Text
            variant="headlineSmall"
            style={styles.title}
          >
            Choose Category
          </Text>

          <Text
            variant="bodyMedium"
            style={styles.subtitle}
          >
            Select a category
          </Text>
        </View>

        <FlatList
          data={filteredCategories}
          keyExtractor={(item) =>
            item.id
          }
          ItemSeparatorComponent={
            Divider
          }
          ListHeaderComponent={
            <TouchableRipple
              onPress={() =>
                handleSelect(null)
              }
              style={[
                styles.item,
                !value &&
                  styles.selectedItem,
              ]}
            >
              <View
                style={styles.row}
              >
                <View
                  style={
                    styles.radio
                  }
                >
                  {!value && (
                    <View
                      style={
                        styles.radioInner
                      }
                    />
                  )}
                </View>

                <Text
                  variant="titleMedium"
                >
                  No Category
                </Text>
              </View>
            </TouchableRipple>
          }
          renderItem={({
            item,
          }) => {
            const selected =
              value === item.id;

            return (
              <TouchableRipple
                onPress={() =>
                  handleSelect(
                    item
                  )
                }
                style={[
                  styles.item,
                  selected &&
                    styles.selectedItem,
                ]}
              >
                <View
                  style={styles.row}
                >
                  <View
                    style={[
                      styles.icon,
                      {
                        backgroundColor:
                          item.color,
                      },
                    ]}
                  >
                    <Icon
                      source={
                        item.icon
                      }
                      size={20}
                      color="white"
                    />
                  </View>

                  <Text
                    variant="titleMedium"
                  >
                    {item.name}
                  </Text>
                </View>
              </TouchableRipple>
            );
          }}
        />

        {/* ADD NEW */}

        <Button
          mode="contained"
          icon="plus"
          onPress={() =>
            setAddVisible(true)
          }
          style={styles.addButton}
        >
          Add New
        </Button>
      </Modal>

      {/* ADD NEW CATEGORY */}

      <Dialog
        visible={addVisible}
        onDismiss={() =>
          setAddVisible(false)
        }
      >
        <Dialog.Title>
          Add New Category
        </Dialog.Title>

        <Dialog.Content>
          <TextInput
            mode="outlined"
            label="Category Name"
            placeholder="Example: Grocery"
            value={categoryName}
            onChangeText={
              setCategoryName
            }
            autoFocus
          />
        </Dialog.Content>

        <Dialog.Actions>
          <Button
            onPress={() => {
              setCategoryName("");
              setAddVisible(false);
            }}
          >
            Cancel
          </Button>

          <Button
            mode="contained"
            disabled={
              !categoryName.trim() ||
              saving
            }
            loading={saving}
            onPress={
              handleAddCategory
            }
          >
            Save
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: {
    backgroundColor: "white",
    margin: 20,
    borderRadius: 20,
    maxHeight: "85%",
    overflow: "hidden",
  },

  header: {
    padding: 20,
    paddingBottom: 12,
  },

  title: {
    fontWeight: "700",
  },

  subtitle: {
    color: "#777",
    marginTop: 4,
  },

  item: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  selectedItem: {
    backgroundColor: "#EEF2FF",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  radio: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#777",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#2563EB",
  },

  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  addButton: {
    margin: 16,
  },
});