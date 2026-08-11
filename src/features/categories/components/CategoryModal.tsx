import { useEffect } from "react";
import {
  Controller,
  useForm,
} from "react-hook-form";
import {
  ScrollView,
  View,
} from "react-native";
import {
  Button,
  Modal,
  Portal,
  SegmentedButtons,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  Category,
  CategoryType,
} from "../types/category";

import { useCategoryStore } from "../../../store/categoryStore";
import { useNotificationStore } from "../../../store/notificationStore";

const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Category name is required"),

  icon: z
    .string()
    .trim()
    .min(1, "Icon is required"),

  color: z
    .string()
    .trim()
    .min(1, "Color is required"),

  type: z.enum([
    "expense",
    "income",
    "both",
  ]),
});

type CategoryForm = z.infer<
  typeof categorySchema
>;

interface Props {
  visible: boolean;
  category?: Category | null;
  onDismiss: () => void;
}

export default function CategoryModal({
  visible,
  category,
  onDismiss,
}: Props) {
  const theme = useTheme();

  const {
    addCategory,
    updateCategory,
  } = useCategoryStore();

  const {
    showNotification,
  } = useNotificationStore();

  const isEdit = Boolean(category);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryForm>({
    resolver:
      zodResolver(categorySchema),

    defaultValues: {
      name: "",
      icon: "tag",
      color: "#2563EB",
      type: "expense",
    },
  });

  useEffect(() => {
    if (!visible) {
      return;
    }

    if (category) {
      reset({
        name: category.name,
        icon: category.icon,
        color: category.color,
        type: category.type,
      });
    } else {
      reset({
        name: "",
        icon: "tag",
        color: "#2563EB",
        type: "expense",
      });
    }
  }, [
    visible,
    category,
    reset,
  ]);

  const onSubmit = async (
    data: CategoryForm
  ) => {
    const now =
      new Date().toISOString();

    if (category) {
      const result =
        await updateCategory({
        ...category,
        name: data.name,
        icon: data.icon,
        color: data.color,
        type: data.type as CategoryType,
        updatedAt: now,
        });

      if (!result.success) {
        showNotification(
          result.error ?? "Unable to update category.",
          "error"
        );
        return;
      }

      showNotification(
        "Category updated successfully.",
        "success"
      );
    } else {
      const newCategory: Category = {
        id: Date.now().toString(),
        name: data.name,
        icon: data.icon,
        color: data.color,
        type: data.type as CategoryType,
        createdAt: now,
        updatedAt: now,
      };

      const result =
        await addCategory(
          newCategory
        );

      if (!result.success) {
        showNotification(
          result.error ?? "Unable to add category.",
          "error"
        );
        return;
      }

      showNotification(
        "Category added successfully.",
        "success"
      );
    }

    reset();
    onDismiss();
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={{
          backgroundColor:
            theme.colors.surface,
          margin: 20,
          borderRadius: 20,
          maxHeight: "90%",
        }}
      >
        <ScrollView
          contentContainerStyle={{
            padding: 20,
          }}
        >
          <Text
            variant="headlineSmall"
            style={{
              marginBottom: 20,
            }}
          >
            {isEdit
              ? "Edit Category"
              : "Add Category"}
          </Text>

          {/* NAME */}

          <Controller
            control={control}
            name="name"
            render={({
              field,
            }) => (
              <TextInput
                mode="outlined"
                label="Category Name"
                placeholder="Food"
                value={field.value}
                onChangeText={
                  field.onChange
                }
              />
            )}
          />

          {errors.name && (
            <Text
              style={{
                color: "#D32F2F",
                marginTop: 4,
              }}
            >
              {
                errors.name
                  .message
              }
            </Text>
          )}

          <View
            style={{
              height: 16,
            }}
          />

          {/* ICON */}

          <Controller
            control={control}
            name="icon"
            render={({
              field,
            }) => (
              <TextInput
                mode="outlined"
                label="Icon"
                placeholder="food"
                value={field.value}
                onChangeText={
                  field.onChange
                }
              />
            )}
          />

          <Text
            variant="bodySmall"
            style={{
              color: "#777",
              marginTop: 4,
            }}
          >
            Example: food, car,
            shopping, receipt,
            cash
          </Text>

          <View
            style={{
              height: 16,
            }}
          />

          {/* COLOR */}

          <Controller
            control={control}
            name="color"
            render={({
              field,
            }) => (
              <TextInput
                mode="outlined"
                label="Color"
                placeholder="#2563EB"
                value={field.value}
                onChangeText={
                  field.onChange
                }
              />
            )}
          />

          <View
            style={{
              height: 16,
            }}
          />

          {/* TYPE */}

          <Controller
            control={control}
            name="type"
            render={({
              field,
            }) => (
              <SegmentedButtons
                value={field.value}
                onValueChange={
                  field.onChange
                }
                buttons={[
                  {
                    value:
                      "expense",
                    label:
                      "Expense",
                  },
                  {
                    value:
                      "income",
                    label:
                      "Income",
                  },
                  {
                    value: "both",
                    label: "Both",
                  },
                ]}
              />
            )}
          />

          <View
            style={{
              height: 24,
            }}
          />

          <Button
            mode="contained"
            onPress={handleSubmit(
              onSubmit
            )}
          >
            {isEdit
              ? "Update Category"
              : "Save Category"}
          </Button>
        </ScrollView>
      </Modal>
    </Portal>
  );
}
