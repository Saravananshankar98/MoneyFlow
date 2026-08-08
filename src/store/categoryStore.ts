import { create } from "zustand";

import { Category } from "../features/categories/types/category";
import { LocalCategoryRepository } from "../repositories/category";

interface CategoryState {
  categories: Category[];
  loading: boolean;

  loadCategories: () => Promise<void>;

  addCategory: (
    category: Category
  ) => Promise<void>;

  updateCategory: (
    category: Category
  ) => Promise<void>;

  deleteCategory: (
    id: string
  ) => Promise<void>;
}

const repository =
  new LocalCategoryRepository();

export const useCategoryStore =
  create<CategoryState>((set) => ({
    categories: [],
    loading: false,

    loadCategories: async () => {
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

    addCategory: async (
      category
    ) => {
      await repository.add(
        category
      );

      const categories =
        await repository.getAll();

      set({
        categories,
      });
    },

    updateCategory: async (
      category
    ) => {
      await repository.update(
        category
      );

      const categories =
        await repository.getAll();

      set({
        categories,
      });
    },

    deleteCategory: async (
      id
    ) => {
      await repository.delete(id);

      const categories =
        await repository.getAll();

      set({
        categories,
      });
    },
  }));