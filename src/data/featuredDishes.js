/** Guest-facing dishes so someone can cook before they join. */

export const FEATURED_DISHES = [
  {
    id: 'ragu',
    eyebrow: 'Italian classic',
    title: 'Weeknight ragù',
    blurb: 'A proper meat sauce. Comfort in a bowl, 30 minutes.',
    image:
      'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=1400&q=80',
    mealPlan: {
      plan_name: 'Weeknight ragù',
      servings: 2,
      recipes: [
        {
          day_of_week: 'Tonight',
          meal_slot: 'dinner',
          title: 'Weeknight ragù',
          image:
            'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=1400&q=80',
          prep_time: 10,
          cook_time: 25,
          estimated_cost: 5.4,
          calories: 640,
          protein: 32,
          carbs: 68,
          fat: 22,
          instructions:
            '1. Soften onion and garlic in olive oil. Add the beef and brown it well.\n2. Stir in the tomatoes, a pinch of salt, and simmer 15 minutes until thick.\n3. Boil the penne in salted water until al dente. Save a splash of water.\n4. Toss pasta with the ragù, loosening with pasta water. Finish with parmesan.',
          ingredients: [
            { ingredient_name: 'Penne', quantity: 200, unit: 'g', category: 'Dry goods' },
            { ingredient_name: 'Beef mince', quantity: 250, unit: 'g', category: 'Meat' },
            { ingredient_name: 'Onion', quantity: 1, unit: '', category: 'Veg' },
            { ingredient_name: 'Garlic cloves', quantity: 2, unit: '', category: 'Veg' },
            { ingredient_name: 'Tinned tomatoes', quantity: 400, unit: 'g', category: 'Store cupboard' },
            { ingredient_name: 'Olive oil', quantity: 1, unit: 'tbsp', category: 'Store cupboard' },
            { ingredient_name: 'Parmesan', quantity: 30, unit: 'g', category: 'Dairy' },
          ],
        },
      ],
    },
  },
  {
    id: 'salmon',
    eyebrow: 'High-protein',
    title: 'Lemon salmon & greens',
    blurb: 'Wellbeing without a sad salad. On the table in 25 minutes.',
    image:
      'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1400&q=80',
    mealPlan: {
      plan_name: 'Lemon salmon & greens',
      servings: 2,
      recipes: [
        {
          day_of_week: 'Tonight',
          meal_slot: 'dinner',
          title: 'Lemon salmon & greens',
          image:
            'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1400&q=80',
          prep_time: 10,
          cook_time: 15,
          estimated_cost: 7.5,
          calories: 480,
          protein: 42,
          carbs: 18,
          fat: 26,
          instructions:
            '1. Heat the oven to 200°C. Lay the salmon on a tray, oil, salt, pepper, and lemon zest.\n2. Roast 12–14 minutes until just opaque.\n3. Meanwhile wilt the greens in a pan with a splash of water, then finish with olive oil and lemon juice.\n4. Serve the salmon on the greens with extra lemon.',
          ingredients: [
            { ingredient_name: 'Salmon fillets', quantity: 2, unit: '', category: 'Fish' },
            { ingredient_name: 'Tenderstem broccoli', quantity: 200, unit: 'g', category: 'Veg' },
            { ingredient_name: 'Lemon', quantity: 1, unit: '', category: 'Veg' },
            { ingredient_name: 'Olive oil', quantity: 1, unit: 'tbsp', category: 'Store cupboard' },
            { ingredient_name: 'Salt & pepper', quantity: 1, unit: 'pinch', category: 'Store cupboard' },
          ],
        },
      ],
    },
  },
  {
    id: 'chickpea',
    eyebrow: 'Budget week',
    title: 'Tomato & chickpea stew',
    blurb: 'Cupboard supper. Warm, cheap, and properly filling.',
    image:
      'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1400&q=80',
    mealPlan: {
      plan_name: 'Tomato & chickpea stew',
      servings: 4,
      recipes: [
        {
          day_of_week: 'Tonight',
          meal_slot: 'dinner',
          title: 'Tomato & chickpea stew',
          image:
            'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1400&q=80',
          prep_time: 10,
          cook_time: 25,
          estimated_cost: 3.8,
          calories: 390,
          protein: 16,
          carbs: 52,
          fat: 12,
          instructions:
            '1. Soften onion and garlic in olive oil until sweet.\n2. Add cumin, then the tomatoes. Simmer 8 minutes.\n3. Stir in the chickpeas and a splash of water. Cook 12 minutes until thick.\n4. Finish with lemon and parsley. Eat with bread or rice.',
          ingredients: [
            { ingredient_name: 'Onion', quantity: 1, unit: '', category: 'Veg' },
            { ingredient_name: 'Garlic cloves', quantity: 2, unit: '', category: 'Veg' },
            { ingredient_name: 'Tinned tomatoes', quantity: 400, unit: 'g', category: 'Store cupboard' },
            { ingredient_name: 'Chickpeas, drained', quantity: 400, unit: 'g', category: 'Store cupboard' },
            { ingredient_name: 'Ground cumin', quantity: 1, unit: 'tsp', category: 'Store cupboard' },
            { ingredient_name: 'Olive oil', quantity: 1, unit: 'tbsp', category: 'Store cupboard' },
            { ingredient_name: 'Lemon', quantity: 0.5, unit: '', category: 'Veg' },
          ],
        },
      ],
    },
  },
]
