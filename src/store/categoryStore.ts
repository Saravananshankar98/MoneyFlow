import { create } from "zustand";

import {
  Category,
} from "../features/categories/types/category";

import {
  LocalCategoryRepository,
} from "../repositories/category";

interface CategoryState {
  categories: Category[];
  loading: boolean;

  loadCategories: () => Promise<void>;

  addCategory: (
    category: Category
  ) => Promise<{
    success: boolean;
    error?: string;
  }>;

  updateCategory: (
    category: Category
  ) => Promise<{
    success: boolean;
    error?: string;
  }>;

  deleteCategory: (
    id: string
  ) => Promise<{
    success: boolean;
    error?: string;
  }>;
}

const repository =
  new LocalCategoryRepository();

export const useCategoryStore =
  create<CategoryState>(
    (set) => ({
      categories: [],

      loading: false,

      // ==================================
      // LOAD
      // ==================================

      loadCategories:
        async () => {
          set({
            loading: true,
          });

          try {
            const categories =
              await repository.getAll();

            set({
              categories,
              loading: false,
            });
          } catch (error) {
            console.error(
              "Failed to load categories:",
              error
            );

            set({
              loading: false,
            });
          }
        },

      // ==================================
      // ADD
      // ==================================

      addCategory:
        async (
          category
        ) => {
          try {
            const existing =
              await repository.getAll();

            const duplicate =
              existing.some(
                (item) =>
                  item.name
                    .trim()
                    .toLowerCase() ===
                  category.name
                    .trim()
                    .toLowerCase()
              );

            if (duplicate) {
              return {
                success: false,
                error:
                  "Category already exists",
              };
            }

            await repository.add(
              category
            );

            const categories =
              await repository.getAll();

            set({
              categories,
            });

            return {
              success: true,
            };
          } catch (error) {
            console.error(
              "Failed to add category:",
              error
            );

            return {
              success: false,
              error:
                "Unable to add category",
            };
          }
        },

      // ==================================
      // UPDATE
      // ==================================

      updateCategory:
        async (
          category
        ) => {
          try {
            const existing =
              await repository.getAll();

            const duplicate =
              existing.some(
                (item) =>
                  item.id !==
                    category.id &&
                  item.name
                    .trim()
                    .toLowerCase() ===
                    category.name
                      .trim()
                      .toLowerCase()
              );

            if (duplicate) {
              return {
                success: false,
                error:
                  "Category already exists",
              };
            }

            await repository.update(
              category
            );

            const categories =
              await repository.getAll();

            set({
              categories,
            });

            return {
              success: true,
            };
          } catch (error) {
            console.error(
              "Failed to update category:",
              error
            );

            return {
              success: false,
              error:
                "Unable to update category",
            };
          }
        },

      // ==================================
      // DELETE
      // ==================================

      deleteCategory:
        async (
          id
        ) => {
          try {
            await repository.delete(
              id
            );

            const categories =
              await repository.getAll();

            set({
              categories,
            });

            return {
              success: true,
            };
          } catch (error) {
            console.error(
              "Failed to delete category:",
              error
            );

            return {
              success: false,
              error:
                "Unable to delete category",
            };
          }
        },
    })
  );