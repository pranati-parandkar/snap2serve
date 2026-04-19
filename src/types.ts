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
  imageUrl?: string;
  price?: number; // Estimated cost in ₹
  spiceLevel?: 'Low' | 'Medium' | 'High';
}

export interface UserPreferences {
  dietaryRestrictions: string[];
  allergies: string[];
  maxTime: number;
  cuisine?: string;
  budget?: number; // Max budget in ₹
  spicePreference?: 'Low' | 'Medium' | 'High';
  cookingStyle?: 'Quick' | 'Elaborate';
  goal?: 'Quick Snack' | 'Healthy' | 'Save Money' | 'Try Something New';
}

export interface Session {
  id: string;
  visitorId: string;
  startTime: string;
  endTime?: string;
  duration?: number;
}

export interface Feedback {
  userId?: { username: string; email: string };
  visitorId: string;
  recipeId?: string;
  recipeTitle?: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface AnalyticsData {
  totalVisitors: number;
  totalVisits: number;
  avgTimeSpent: number; // in seconds
  visitsPerDay: { date: string; count: number }[];
  recentFeedback?: Feedback[];
}

export interface RecommendationResult {
  best_item: string;
  reason: string;
  score_summary: {
    taste_match: 'high' | 'medium' | 'low';
    budget_fit: 'good' | 'average' | 'poor';
    time_fit: 'good' | 'average' | 'poor';
  };
}
