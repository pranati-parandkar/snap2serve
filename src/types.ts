export interface Ingredient {
  name: string;
  confidence: number;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  cookingTime: number; // in minutes
  difficulty: 'Easy' | 'Medium' | 'Hard';
  cuisine: string;
  dietaryInfo: string[];
  calories?: number;
}

export interface UserPreferences {
  dietaryRestrictions: string[];
  allergies: string[];
  maxTime: number;
  cuisine?: string;
}
