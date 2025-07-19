
export interface Recipe {
  id: string;
  title: string;
  ingredients: string[];
  instructions: string;
  nutrition: { calories: number; protein: number; carbs: number; fat: number };
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export type Meal = {
  id: string;
  time: 'breakfast' | 'snack' | 'lunch' | 'dinner';
  title: string;
  ingredients: string[];
  instructions?: string;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  isCustom: boolean;
  recipeId?: string;
};

export type MealPlan = {
  date: string;
  recipes: Meal[];
};

export interface ShoppingList {
  id: string;
  userId: string;
  items: string[];
  createdAt: string;
  updatedAt: string;
}
