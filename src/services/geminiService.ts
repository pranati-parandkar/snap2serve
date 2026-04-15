import { GoogleGenAI } from "@google/genai";
import { Recipe, Ingredient, UserPreferences, RecommendationResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getSmartRecommendation(
  options: Recipe[],
  preferences: UserPreferences,
  history: Recipe[],
  favorites: Recipe[]
): Promise<RecommendationResult | null> {
  try {
    const prompt = `You are an intelligent food recommendation system.
    Your task is to select the BEST possible food item based on user constraints, preferences, and available options.

    USER CONSTRAINTS:
    - Budget: ₹${preferences.budget || 500}
    - Max Time: ${preferences.maxTime} minutes
    - Diet: ${preferences.dietaryRestrictions.join(", ") || "Any"}

    USER TASTE PROFILE:
    - Spice Preference: ${preferences.spicePreference || "Medium"}
    - Cooking Style: ${preferences.cookingStyle || "Quick"}
    - Past Preferences: ${favorites.map(f => f.title).join(", ") || "None"}
    - Recent Items: ${history.slice(0, 3).map(h => h.title).join(", ") || "None"}

    AVAILABLE OPTIONS:
    ${JSON.stringify(options.map(o => ({
      name: o.title,
      price: o.price || Math.floor(Math.random() * 200) + 50,
      time: o.cookingTime,
      type: o.dietaryInfo.includes("Veg") ? "veg" : "non-veg",
      spice: o.spiceLevel || "Medium"
    })))}

    INSTRUCTIONS:
    - First remove options that violate STRICT constraints (budget, diet, time)
    - Then evaluate remaining options
    - Consider: taste match, time efficiency, cost efficiency, overall suitability
    - Select ONLY ONE BEST item

    OUTPUT FORMAT (STRICT JSON):
    {
      "best_item": "name",
      "reason": "clear explanation referencing constraints + taste",
      "score_summary": {
        "taste_match": "high/medium/low",
        "budget_fit": "good/average/poor",
        "time_fit": "good/average/poor"
      }
    }`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "You are an intelligent food recommendation system. Always return valid JSON."
      }
    });

    const text = response.text || "null";
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to get smart recommendation", e);
    return null;
  }
}

export async function generateFoodOptions(
  constraints: { budget: number; time: number; diet: string; goal: string; spice: string }
): Promise<Recipe[]> {
  try {
    const prompt = `Generate 4 diverse food options (recipes) based on these constraints:
    - Budget: ₹${constraints.budget}
    - Available Time: ${constraints.time} minutes
    - Diet Preference: ${constraints.diet}
    - Goal: ${constraints.goal}
    - Spice Level: ${constraints.spice}

    Return ONLY a JSON array of recipe objects with this structure:
    [{
      "id": "unique-id",
      "title": "Recipe Title",
      "description": "Short description",
      "ingredients": ["item 1", "item 2"],
      "instructions": ["step 1", "step 2"],
      "cookingTime": 30,
      "difficulty": "Easy",
      "cuisine": "Cuisine Type",
      "calories": 450,
      "dietaryInfo": ["Vegan", "Gluten-Free"],
      "price": 150,
      "spiceLevel": "Medium"
    }]`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "You are a professional chef. Always return valid JSON."
      }
    });

    const text = response.text || "[]";
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to generate food options", e);
    return [];
  }
}

export async function detectIngredients(base64Image: string): Promise<Ingredient[]> {
  try {
    let base64Data = base64Image;
    let mimeType = "image/jpeg";

    if (base64Image.includes(";base64,")) {
      const parts = base64Image.split(";base64,");
      mimeType = parts[0].split(":")[1];
      base64Data = parts[1];
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              },
            },
            { text: "Identify all food ingredients in this image. Return ONLY a JSON array of strings. Example: [\"Tomato\", \"Onion\", \"Garlic\"]" },
          ],
        },
      ],
    });

    const text = response.text || "[]";
    try {
      const cleanText = text.replace(/```json|```/g, "").trim();
      let ingredients = JSON.parse(cleanText);
      
      if (!Array.isArray(ingredients) && typeof ingredients === 'object' && ingredients !== null) {
        if (Array.isArray(ingredients.ingredients)) {
          ingredients = ingredients.ingredients;
        } else {
          const arrayProp = Object.values(ingredients).find(val => Array.isArray(val));
          if (arrayProp) ingredients = arrayProp;
        }
      }
      
      if (!Array.isArray(ingredients)) ingredients = [];
      
      return ingredients.map((name: string) => ({ name, confidence: 0.95 }));
    } catch (parseError) {
      console.error("JSON Parse Error (Detect):", text);
      return [];
    }
  } catch (e) {
    console.error("Failed to detect ingredients", e);
    return [];
  }
}

export async function generateRecipes(
  ingredients: string[],
  preferences: UserPreferences
): Promise<Recipe[]> {
  try {
    const prompt = `Generate 6 yummy and accurate recipes using these ingredients: ${ingredients.join(", ")}.
    
    User Preferences:
    - Cuisine Style: ${preferences.cuisine || "Any (be creative but authentic)"}
    - Dietary Restrictions: ${preferences.dietaryRestrictions.join(", ") || "None"}
    - Allergies: ${preferences.allergies.join(", ") || "None"}
    - Max Cooking Time: ${preferences.maxTime} minutes
    
    IMPORTANT: 
    1. If a specific cuisine is requested, ensure the recipes are authentic to that cuisine.
    2. Ensure the ingredients used are primarily from the provided list, but you can add common pantry staples (salt, oil, water, etc.).
    3. Provide a realistic calorie count for each recipe.
    
    Return ONLY a JSON array of recipe objects with this structure:
    [{
      "id": "a-truly-unique-string-id",
      "title": "Recipe Title",
      "description": "Short yummy description",
      "ingredients": ["item 1", "item 2"],
      "instructions": ["step 1", "step 2"],
      "cookingTime": 30,
      "difficulty": "Easy",
      "cuisine": "Cuisine Type",
      "calories": 450,
      "dietaryInfo": ["Vegan", "Gluten-Free"],
      "price": 150,
      "spiceLevel": "Medium"
    }]`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "You are a professional master chef who specializes in creating accurate, healthy, and delicious recipes based on available ingredients and user preferences. Always return valid JSON."
      }
    });

    const text = response.text || "[]";
    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.error("JSON Parse Error (Recipes):", text);
      return [];
    }
  } catch (e) {
    console.error("Failed to generate recipes", e);
    return [];
  }
}

export async function generateSpeech(text: string): Promise<string | undefined> {
  return undefined;
}

export async function getChatResponse(
  message: string,
  chatHistory: { role: "user" | "model"; parts: { text: string }[] }[],
  context?: { recipe?: Recipe; appInfo: string }
): Promise<string> {
  try {
    const systemInstruction = `You are the Snap2Serve AI Assistant. Your goal is to help users with their cooking journey and navigating the Snap2Serve app.
      
      Snap2Serve Features:
      - Snap a photo of ingredients to detect them using AI.
      - Generate personalized recipes based on detected ingredients and dietary preferences.
      - Save favorites and view cooking history.
      - Interactive cooking mode with voice guidance.
      - Explore trending recipes from different cuisines.
      
      Current Context:
      ${context?.recipe ? `The user is currently viewing a recipe: "${context.recipe.title}". 
      Description: ${context.recipe.description}
      Ingredients: ${context.recipe.ingredients.join(", ")}
      Instructions: ${context.recipe.instructions.join(". ")}` : "No specific recipe selected yet."}
      
      Guidelines:
      - Be friendly, helpful, and encouraging.
      - Keep responses concise but informative.
      - If asked about a recipe, provide tips, substitutions, or clarifications.
      - If asked about the app, explain how to use its features.
      - Use emojis to keep the tone light and fun! ✨`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...chatHistory,
        { role: "user", parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: systemInstruction
      }
    });

    return response.text || "I'm sorry, I couldn't generate a response. 🍳";
  } catch (error) {
    console.error("Chat Error:", error);
    return "Oops! I'm having a little trouble thinking right now. Could you try asking again? 🍳";
  }
}

