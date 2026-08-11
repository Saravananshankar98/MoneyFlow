import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  Category,
} from "../features/categories/types/category";

const STORAGE_KEY =
  "moneyflow_categories";

export class LocalCategoryRepository {
  async getAll(): Promise<Category[]> {
    const data =
      await AsyncStorage.getItem(
        STORAGE_KEY
      );

    if (!data) {
      return [];
    }

    try {
      const parsed =
        JSON.parse(data);

      return Array.isArray(parsed)
        ? parsed
        : [];
    } catch {
      return [];
    }
  }

  async add(
    category: Category
  ): Promise<void> {
    const categories =
      await this.getAll();

    categories.push(category);

    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(categories)
    );
  }

  async update(
    category: Category
  ): Promise<void> {
    const categories =
      await this.getAll();

    const index =
      categories.findIndex(
        (item) =>
          item.id === category.id
      );

    if (index === -1) {
      throw new Error(
        "Category not found"
      );
    }

    categories[index] =
      category;

    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(categories)
    );
  }

  async delete(
    id: string
  ): Promise<void> {
    const categories =
      await this.getAll();

    const filtered =
      categories.filter(
        (item) =>
          item.id !== id
      );

    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(filtered)
    );
  }
}