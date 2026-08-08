import AsyncStorage from "@react-native-async-storage/async-storage";

import { Category } from "../features/categories/types/category";

const STORAGE_KEY = "moneyflow_categories";

const DEFAULT_CATEGORIES: Category[] = [
  {
    id: "food",
    name: "Food",
    icon: "food",
    color: "#FF9800",
    type: "expense",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "travel",
    name: "Travel",
    icon: "car",
    color: "#2196F3",
    type: "expense",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "shopping",
    name: "Shopping",
    icon: "shopping",
    color: "#9C27B0",
    type: "expense",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "bills",
    name: "Bills",
    icon: "receipt",
    color: "#F44336",
    type: "expense",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "emi",
    name: "EMI",
    icon: "credit-card",
    color: "#795548",
    type: "expense",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "salary",
    name: "Salary",
    icon: "cash",
    color: "#4CAF50",
    type: "income",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "other-income",
    name: "Other Income",
    icon: "cash-plus",
    color: "#009688",
    type: "income",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export class LocalCategoryRepository {
  private async save(
    categories: Category[]
  ): Promise<void> {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(categories)
    );
  }

  async getAll(): Promise<Category[]> {
    const data =
      await AsyncStorage.getItem(
        STORAGE_KEY
      );

    if (!data) {
      await this.save(
        DEFAULT_CATEGORIES
      );

      return DEFAULT_CATEGORIES;
    }

    try {
      return JSON.parse(data);
    } catch {
      await this.save(
        DEFAULT_CATEGORIES
      );

      return DEFAULT_CATEGORIES;
    }
  }

  async add(
    category: Category
  ): Promise<void> {
    const categories =
      await this.getAll();

    categories.push(category);

    await this.save(categories);
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

    categories[index] = category;

    await this.save(categories);
  }

  async delete(
    id: string
  ): Promise<void> {
    const categories =
      await this.getAll();

    const filtered =
      categories.filter(
        (item) => item.id !== id
      );

    await this.save(filtered);
  }
}