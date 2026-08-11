import {
  useCallback,
  useState,
} from "react";
import {
  FlatList,
  StyleSheet,
  View,
} from "react-native";
import {
  Button,
  Card,
  Dialog,
  Icon,
  IconButton,
  Portal,
  Text,
  useTheme,
} from "react-native-paper";
import { useFocusEffect } from "expo-router";

import { useCategoryStore } from "../src/store/categoryStore";
import { useNotificationStore } from "../src/store/notificationStore";

import CategoryModal from "../src/features/categories/components/CategoryModal";

import {
  Category,
} from "../src/features/categories/types/category";

export default function CategoriesScreen() {
  const theme = useTheme();

  const {
    categories,
    loadCategories,
    deleteCategory,
  } = useCategoryStore();

  const {
    showNotification,
  } = useNotificationStore();

  const [
    modalVisible,
    setModalVisible,
  ] = useState(false);

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState<Category | null>(
    null
  );

  const [
    deleteDialogVisible,
    setDeleteDialogVisible,
  ] = useState(false);

  const [
    categoryToDelete,
    setCategoryToDelete,
  ] = useState<Category | null>(
    null
  );

  useFocusEffect(
    useCallback(() => {
      loadCategories();
    }, [loadCategories])
  );

  const handleAdd = () => {
    setSelectedCategory(null);
    setModalVisible(true);
  };

  const handleEdit = (
    category: Category
  ) => {
    setSelectedCategory(category);
    setModalVisible(true);
  };

  const handleDeleteRequest = (
    category: Category
  ) => {
    setCategoryToDelete(category);
    setDeleteDialogVisible(true);
  };

  const handleDeleteConfirm =
    async () => {
      if (!categoryToDelete) {
        return;
      }

      const result =
        await deleteCategory(
        categoryToDelete.id
      );

      if (!result.success) {
        showNotification(
          result.error ?? "Unable to delete category.",
          "error"
        );
        return;
      }

      setDeleteDialogVisible(false);
      setCategoryToDelete(null);

      showNotification(
        "Category deleted successfully.",
        "success"
      );
    };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            theme.colors.background,
        },
      ]}
    >
      <View style={styles.header}>
        <View>
          <Text
            variant="headlineMedium"
            style={styles.title}
          >
            Categories
          </Text>

          <Text
            variant="bodyMedium"
            style={styles.subtitle}
          >
            Manage your income and
            expense categories
          </Text>
        </View>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) =>
          item.id
        }
        contentContainerStyle={
          styles.list
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <View
                style={styles.row}
              >
                <View
                  style={
                    styles.left
                  }
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
                      size={22}
                      color="white"
                    />
                  </View>

                  <View>
                    <Text variant="titleMedium">
                      {item.name}
                    </Text>

                    <Text
                      variant="bodySmall"
                      style={
                        styles.type
                      }
                    >
                      {item.type}
                    </Text>
                  </View>
                </View>

                <View
                  style={
                    styles.actions
                  }
                >
                  <IconButton
                    icon="pencil"
                    onPress={() =>
                      handleEdit(
                        item
                      )
                    }
                  />

                  <IconButton
                    icon="delete"
                    iconColor="#D32F2F"
                    onPress={() =>
                      handleDeleteRequest(
                        item
                      )
                    }
                  />
                </View>
              </View>
            </Card.Content>
          </Card>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No categories
          </Text>
        }
      />

      {/* ADD / EDIT */}

      <Button
        mode="contained"
        icon="plus"
        onPress={handleAdd}
        style={styles.addButton}
      >
        Add Category
      </Button>

      {/* CATEGORY MODAL */}

      <CategoryModal
        visible={modalVisible}
        category={selectedCategory}
        onDismiss={() => {
          setModalVisible(false);
          setSelectedCategory(null);
          loadCategories();
        }}
      />

      {/* DELETE CONFIRMATION */}

      <Portal>
        <Dialog
          visible={
            deleteDialogVisible
          }
          onDismiss={() => {
            setDeleteDialogVisible(
              false
            );
            setCategoryToDelete(
              null
            );
          }}
        >
          <Dialog.Title>
            Delete Category?
          </Dialog.Title>

          <Dialog.Content>
            <Text>
              Are you sure you want
              to delete{" "}
              <Text
                style={
                  styles.bold
                }
              >
                {
                  categoryToDelete?.name
                }
              </Text>
              ?
            </Text>

            <Text
              style={
                styles.warning
              }
            >
              Existing transactions
              will not be deleted.
            </Text>
          </Dialog.Content>

          <Dialog.Actions>
            <Button
              onPress={() => {
                setDeleteDialogVisible(
                  false
                );
                setCategoryToDelete(
                  null
                );
              }}
            >
              Cancel
            </Button>

            <Button
              textColor="#D32F2F"
              onPress={
                handleDeleteConfirm
              }
            >
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },

  header: {
    marginBottom: 16,
  },

  title: {
    fontWeight: "700",
  },

  subtitle: {
    color: "#777",
    marginTop: 4,
  },

  list: {
    gap: 10,
    paddingBottom: 90,
  },

  card: {
    borderRadius: 14,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },

  icon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },

  type: {
    color: "#777",
    marginTop: 2,
    textTransform: "capitalize",
  },

  actions: {
    flexDirection: "row",
  },

  addButton: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
  },

  empty: {
    textAlign: "center",
    color: "#777",
    marginTop: 40,
  },

  bold: {
    fontWeight: "700",
  },

  warning: {
    color: "#777",
    marginTop: 12,
  },
});
