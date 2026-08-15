/** House catalog — real dishes, not prompts. Search these first. */

function dish(partial) {
  const image = partial.image
  const recipe = {
    day_of_week: 'Tonight',
    meal_slot: 'dinner',
    image,
    ...partial.recipe,
    title: partial.recipe.title || partial.title,
  }
  return {
    id: partial.id,
    collections: partial.collections,
    title: partial.title,
    blurb: partial.blurb,
    image,
    mealPlan: {
      plan_name: partial.title,
      servings: partial.servings ?? 2,
      image,
      recipes: [recipe],
    },
  }
}

export const CATALOG = [
  dish({
    id: 'carbonara',
    collections: ['italian'],
    title: 'Carbonara',
    blurb: 'Eggs, pecorino, guanciale. No cream.',
    image: 'https://images.unsplash.com/photo-1612874742237-6526221588e8?auto=format&fit=crop&w=1400&q=80',
    recipe: {
      title: 'Carbonara',
      prep_time: 10,
      cook_time: 15,
      estimated_cost: 4.8,
      calories: 620,
      protein: 28,
      carbs: 62,
      fat: 28,
      instructions:
        '1. Boil spaghetti in well-salted water until just shy of al dente.\n2. Crisp the guanciale in a cold pan, slowly, until the fat runs.\n3. Beat eggs with pecorino and a lot of black pepper.\n4. Off the heat, toss pasta with the fat, then the egg — loosen with pasta water until glossy.',
      ingredients: [
        { ingredient_name: 'Spaghetti', quantity: 200, unit: 'g', category: 'Dry goods' },
        { ingredient_name: 'Guanciale or pancetta', quantity: 100, unit: 'g', category: 'Meat' },
        { ingredient_name: 'Eggs', quantity: 2, unit: '', category: 'Dairy' },
        { ingredient_name: 'Pecorino', quantity: 40, unit: 'g', category: 'Dairy' },
        { ingredient_name: 'Black pepper', quantity: 1, unit: 'tsp', category: 'Store cupboard' },
      ],
    },
  }),
  dish({
    id: 'ragu',
    collections: ['italian'],
    title: 'Weeknight ragù',
    blurb: 'A proper meat sauce. Comfort in a bowl, 30 minutes.',
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=1400&q=80',
    recipe: {
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
  }),
  dish({
    id: 'risotto',
    collections: ['italian', 'vegetarian'],
    title: 'Mushroom risotto',
    blurb: 'Stirred, glossy, and properly savoury.',
    image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=1400&q=80',
    recipe: {
      prep_time: 10,
      cook_time: 30,
      estimated_cost: 4.2,
      calories: 540,
      protein: 14,
      carbs: 72,
      fat: 18,
      instructions:
        '1. Warm the stock. Soften onion in butter, add the rice, and toast a minute.\n2. Add stock a ladle at a time, stirring, until the rice is creamy and just tender.\n3. Meanwhile brown the mushrooms hard in a second pan.\n4. Fold mushrooms, parmesan, and a knob of butter through the risotto.',
      ingredients: [
        { ingredient_name: 'Arborio rice', quantity: 180, unit: 'g', category: 'Dry goods' },
        { ingredient_name: 'Mushrooms', quantity: 250, unit: 'g', category: 'Veg' },
        { ingredient_name: 'Onion', quantity: 1, unit: '', category: 'Veg' },
        { ingredient_name: 'Vegetable stock', quantity: 700, unit: 'ml', category: 'Store cupboard' },
        { ingredient_name: 'Parmesan', quantity: 40, unit: 'g', category: 'Dairy' },
        { ingredient_name: 'Butter', quantity: 30, unit: 'g', category: 'Dairy' },
      ],
    },
  }),
  dish({
    id: 'steak-frites',
    collections: ['french'],
    title: 'Steak and bistro salad',
    blurb: 'A French plate you can actually cook on a Tuesday.',
    image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=1400&q=80',
    recipe: {
      prep_time: 10,
      cook_time: 15,
      estimated_cost: 8.5,
      calories: 580,
      protein: 38,
      carbs: 12,
      fat: 40,
      instructions:
        '1. Salt the steak early. Get a pan smoking hot.\n2. Cook 2–3 minutes a side, then rest with a scrap of butter.\n3. Toss leaves with Dijon, red wine vinegar, and olive oil.\n4. Slice the steak and eat it on the salad.',
      ingredients: [
        { ingredient_name: 'Rump steak', quantity: 300, unit: 'g', category: 'Meat' },
        { ingredient_name: 'Salad leaves', quantity: 80, unit: 'g', category: 'Veg' },
        { ingredient_name: 'Dijon mustard', quantity: 1, unit: 'tsp', category: 'Store cupboard' },
        { ingredient_name: 'Red wine vinegar', quantity: 1, unit: 'tbsp', category: 'Store cupboard' },
        { ingredient_name: 'Olive oil', quantity: 2, unit: 'tbsp', category: 'Store cupboard' },
        { ingredient_name: 'Butter', quantity: 15, unit: 'g', category: 'Dairy' },
      ],
    },
  }),
  dish({
    id: 'fish-pie',
    collections: ['british'],
    title: 'Weeknight fish pie',
    blurb: 'Creamy, mustardy, mash on top. Sunday energy, Tuesday timing.',
    image: 'https://images.unsplash.com/photo-1645883705871-890087b103b5?auto=format&fit=crop&w=1400&q=80',
    recipe: {
      prep_time: 15,
      cook_time: 30,
      estimated_cost: 7.2,
      calories: 610,
      protein: 34,
      carbs: 48,
      fat: 28,
      instructions:
        '1. Boil potatoes and mash with butter and a splash of milk.\n2. Poach the fish in milk with a bay leaf, then flake it.\n3. Make a quick white sauce, stir in mustard and the fish.\n4. Top with mash and bake at 200°C until golden.',
      ingredients: [
        { ingredient_name: 'White fish', quantity: 300, unit: 'g', category: 'Fish' },
        { ingredient_name: 'Potatoes', quantity: 500, unit: 'g', category: 'Veg' },
        { ingredient_name: 'Milk', quantity: 300, unit: 'ml', category: 'Dairy' },
        { ingredient_name: 'Butter', quantity: 30, unit: 'g', category: 'Dairy' },
        { ingredient_name: 'Dijon mustard', quantity: 1, unit: 'tsp', category: 'Store cupboard' },
        { ingredient_name: 'Flour', quantity: 1, unit: 'tbsp', category: 'Dry goods' },
      ],
    },
  }),
  dish({
    id: 'sausage-mash',
    collections: ['british', 'budget'],
    title: 'Sausages and onion gravy',
    blurb: 'The plate you already know, done properly.',
    image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=1400&q=80',
    recipe: {
      prep_time: 10,
      cook_time: 25,
      estimated_cost: 4.5,
      calories: 720,
      protein: 26,
      carbs: 58,
      fat: 38,
      instructions:
        '1. Brown the sausages, then let them finish in the oven.\n2. In the same pan, cook onions low until sweet. Add flour, then stock.\n3. Boil potatoes, mash with butter.\n4. Serve sausages on mash with the gravy.',
      ingredients: [
        { ingredient_name: 'Pork sausages', quantity: 4, unit: '', category: 'Meat' },
        { ingredient_name: 'Onions', quantity: 2, unit: '', category: 'Veg' },
        { ingredient_name: 'Potatoes', quantity: 500, unit: 'g', category: 'Veg' },
        { ingredient_name: 'Chicken stock', quantity: 300, unit: 'ml', category: 'Store cupboard' },
        { ingredient_name: 'Butter', quantity: 30, unit: 'g', category: 'Dairy' },
        { ingredient_name: 'Flour', quantity: 1, unit: 'tbsp', category: 'Dry goods' },
      ],
    },
  }),
  dish({
    id: 'salmon-teriyaki',
    collections: ['japanese', 'wellbeing'],
    title: 'Teriyaki salmon',
    blurb: 'Clean, sweet-savoury, on the table in 20 minutes.',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1400&q=80',
    recipe: {
      prep_time: 5,
      cook_time: 15,
      estimated_cost: 7.5,
      calories: 490,
      protein: 40,
      carbs: 22,
      fat: 26,
      instructions:
        '1. Mix soy, mirin, and a little sugar. Spoon over the salmon.\n2. Roast at 200°C for 12 minutes.\n3. Steam or wilt greens in a pan.\n4. Serve salmon over rice with the sticky juices.',
      ingredients: [
        { ingredient_name: 'Salmon fillets', quantity: 2, unit: '', category: 'Fish' },
        { ingredient_name: 'Soy sauce', quantity: 2, unit: 'tbsp', category: 'Store cupboard' },
        { ingredient_name: 'Mirin or honey', quantity: 1, unit: 'tbsp', category: 'Store cupboard' },
        { ingredient_name: 'Rice', quantity: 150, unit: 'g', category: 'Dry goods' },
        { ingredient_name: 'Greens', quantity: 200, unit: 'g', category: 'Veg' },
      ],
    },
  }),
  dish({
    id: 'katsu',
    collections: ['japanese'],
    title: 'Chicken katsu',
    blurb: 'Crumbed, golden, curry sauce on the side.',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1400&q=80',
    recipe: {
      prep_time: 15,
      cook_time: 20,
      estimated_cost: 5.8,
      calories: 680,
      protein: 36,
      carbs: 64,
      fat: 28,
      instructions:
        '1. Flatten the chicken. Flour, egg, breadcrumbs.\n2. Fry in a shallow oil until golden and cooked through.\n3. Warm a simple curry sauce from a block or a quick onion-apple gravy.\n4. Slice the katsu. Rice, sauce, shredded cabbage.',
      ingredients: [
        { ingredient_name: 'Chicken breasts', quantity: 2, unit: '', category: 'Meat' },
        { ingredient_name: 'Panko breadcrumbs', quantity: 80, unit: 'g', category: 'Dry goods' },
        { ingredient_name: 'Egg', quantity: 1, unit: '', category: 'Dairy' },
        { ingredient_name: 'Rice', quantity: 150, unit: 'g', category: 'Dry goods' },
        { ingredient_name: 'Curry sauce', quantity: 200, unit: 'ml', category: 'Store cupboard' },
      ],
    },
  }),
  dish({
    id: 'chana',
    collections: ['indian', 'vegan', 'vegetarian', 'budget'],
    title: 'Chana masala',
    blurb: 'Chickpeas, tomato, spice. Cheap and complete.',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1400&q=80',
    recipe: {
      servings: 3,
      prep_time: 10,
      cook_time: 25,
      estimated_cost: 3.2,
      calories: 410,
      protein: 16,
      carbs: 54,
      fat: 12,
      instructions:
        '1. Soften onion, garlic, and ginger in oil.\n2. Add cumin, garam masala, and chilli. Toast.\n3. Stir in tomatoes and chickpeas. Simmer 15 minutes.\n4. Finish with lemon. Eat with rice or bread.',
      ingredients: [
        { ingredient_name: 'Chickpeas, drained', quantity: 400, unit: 'g', category: 'Store cupboard' },
        { ingredient_name: 'Tinned tomatoes', quantity: 400, unit: 'g', category: 'Store cupboard' },
        { ingredient_name: 'Onion', quantity: 1, unit: '', category: 'Veg' },
        { ingredient_name: 'Garlic cloves', quantity: 2, unit: '', category: 'Veg' },
        { ingredient_name: 'Garam masala', quantity: 1, unit: 'tsp', category: 'Store cupboard' },
        { ingredient_name: 'Rice', quantity: 150, unit: 'g', category: 'Dry goods' },
      ],
    },
  }),
  dish({
    id: 'tikka',
    collections: ['indian'],
    title: 'Chicken tikka and rice',
    blurb: 'Yoghurt, spice, grill. The weeknight version.',
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=1400&q=80',
    recipe: {
      prep_time: 15,
      cook_time: 20,
      estimated_cost: 6.1,
      calories: 560,
      protein: 42,
      carbs: 48,
      fat: 18,
      instructions:
        '1. Coat chicken in yoghurt, garam masala, garlic, and lemon.\n2. Grill or roast hot until charred at the edges.\n3. Cook rice. Warm a handful of spinach in the chicken juices.\n4. Plate chicken on rice with the greens.',
      ingredients: [
        { ingredient_name: 'Chicken thighs', quantity: 400, unit: 'g', category: 'Meat' },
        { ingredient_name: 'Yoghurt', quantity: 80, unit: 'g', category: 'Dairy' },
        { ingredient_name: 'Garam masala', quantity: 1, unit: 'tsp', category: 'Store cupboard' },
        { ingredient_name: 'Rice', quantity: 150, unit: 'g', category: 'Dry goods' },
        { ingredient_name: 'Spinach', quantity: 100, unit: 'g', category: 'Veg' },
        { ingredient_name: 'Lemon', quantity: 0.5, unit: '', category: 'Veg' },
      ],
    },
  }),
  dish({
    id: 'tacos',
    collections: ['mexican'],
    title: 'Chicken tacos',
    blurb: 'Charred, lime, coriander. Messy on purpose.',
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=1400&q=80',
    recipe: {
      prep_time: 15,
      cook_time: 15,
      estimated_cost: 5.5,
      calories: 520,
      protein: 34,
      carbs: 48,
      fat: 20,
      instructions:
        '1. Season chicken with cumin, chilli, and salt. Fry hard.\n2. Warm tortillas in a dry pan.\n3. Slice the chicken. Pile with onion, coriander, and lime.\n4. Hot sauce if you have it.',
      ingredients: [
        { ingredient_name: 'Chicken thighs', quantity: 300, unit: 'g', category: 'Meat' },
        { ingredient_name: 'Tortillas', quantity: 6, unit: '', category: 'Dry goods' },
        { ingredient_name: 'Red onion', quantity: 0.5, unit: '', category: 'Veg' },
        { ingredient_name: 'Coriander', quantity: 1, unit: 'handful', category: 'Veg' },
        { ingredient_name: 'Lime', quantity: 1, unit: '', category: 'Veg' },
        { ingredient_name: 'Ground cumin', quantity: 1, unit: 'tsp', category: 'Store cupboard' },
      ],
    },
  }),
  dish({
    id: 'shakshuka',
    collections: ['mediterranean', 'vegetarian'],
    title: 'Shakshuka',
    blurb: 'Eggs in a spiced tomato pan. Bread on the side.',
    image: 'https://images.unsplash.com/photo-1590412200988-a436970781fa?auto=format&fit=crop&w=1400&q=80',
    recipe: {
      prep_time: 10,
      cook_time: 20,
      estimated_cost: 3.6,
      calories: 380,
      protein: 18,
      carbs: 28,
      fat: 20,
      instructions:
        '1. Soften pepper and onion in olive oil.\n2. Add garlic, cumin, and tomatoes. Simmer until thick.\n3. Make wells, crack in the eggs, cover until the whites set.\n4. Eat from the pan with bread.',
      ingredients: [
        { ingredient_name: 'Eggs', quantity: 4, unit: '', category: 'Dairy' },
        { ingredient_name: 'Tinned tomatoes', quantity: 400, unit: 'g', category: 'Store cupboard' },
        { ingredient_name: 'Red pepper', quantity: 1, unit: '', category: 'Veg' },
        { ingredient_name: 'Onion', quantity: 1, unit: '', category: 'Veg' },
        { ingredient_name: 'Olive oil', quantity: 2, unit: 'tbsp', category: 'Store cupboard' },
        { ingredient_name: 'Ground cumin', quantity: 1, unit: 'tsp', category: 'Store cupboard' },
      ],
    },
  }),
  dish({
    id: 'greek-chicken',
    collections: ['mediterranean', 'wellbeing'],
    title: 'Lemon herb chicken',
    blurb: 'Olive oil, oregano, a sharp salad.',
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1400&q=80',
    recipe: {
      prep_time: 10,
      cook_time: 20,
      estimated_cost: 6.4,
      calories: 470,
      protein: 40,
      carbs: 14,
      fat: 28,
      instructions:
        '1. Rub chicken with olive oil, oregano, garlic, and lemon.\n2. Roast or grill until cooked through.\n3. Toss cucumber, tomato, and onion with oil and vinegar.\n4. Serve the chicken on the salad.',
      ingredients: [
        { ingredient_name: 'Chicken thighs', quantity: 400, unit: 'g', category: 'Meat' },
        { ingredient_name: 'Lemon', quantity: 1, unit: '', category: 'Veg' },
        { ingredient_name: 'Oregano', quantity: 1, unit: 'tsp', category: 'Store cupboard' },
        { ingredient_name: 'Tomato', quantity: 2, unit: '', category: 'Veg' },
        { ingredient_name: 'Cucumber', quantity: 0.5, unit: '', category: 'Veg' },
        { ingredient_name: 'Olive oil', quantity: 2, unit: 'tbsp', category: 'Store cupboard' },
      ],
    },
  }),
  dish({
    id: 'lentil-ragu',
    collections: ['vegetarian', 'vegan', 'budget', 'pantry'],
    title: 'Lentil ragù',
    blurb: 'The meat sauce, without the meat.',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1400&q=80',
    recipe: {
      prep_time: 10,
      cook_time: 25,
      estimated_cost: 2.8,
      calories: 480,
      protein: 20,
      carbs: 72,
      fat: 10,
      instructions:
        '1. Soften onion, carrot, and garlic in olive oil.\n2. Add lentils, tomatoes, and a splash of water. Simmer 20 minutes.\n3. Boil pasta.\n4. Toss together. Finish with pepper and oil.',
      ingredients: [
        { ingredient_name: 'Red lentils', quantity: 150, unit: 'g', category: 'Store cupboard' },
        { ingredient_name: 'Tinned tomatoes', quantity: 400, unit: 'g', category: 'Store cupboard' },
        { ingredient_name: 'Pasta', quantity: 200, unit: 'g', category: 'Dry goods' },
        { ingredient_name: 'Onion', quantity: 1, unit: '', category: 'Veg' },
        { ingredient_name: 'Carrot', quantity: 1, unit: '', category: 'Veg' },
        { ingredient_name: 'Olive oil', quantity: 1, unit: 'tbsp', category: 'Store cupboard' },
      ],
    },
  }),
  dish({
    id: 'chickpea-stew',
    collections: ['budget', 'pantry', 'vegan', 'vegetarian'],
    title: 'Tomato & chickpea stew',
    blurb: 'Cupboard supper. Warm, cheap, and filling.',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1400&q=80',
    recipe: {
      servings: 3,
      prep_time: 10,
      cook_time: 25,
      estimated_cost: 3.8,
      calories: 390,
      protein: 16,
      carbs: 52,
      fat: 12,
      instructions:
        '1. Soften onion and garlic in olive oil until sweet.\n2. Add cumin, then the tomatoes. Simmer 8 minutes.\n3. Stir in the chickpeas and a splash of water. Cook 12 minutes until thick.\n4. Finish with lemon. Eat with bread or rice.',
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
  }),
  dish({
    id: 'tuna-pasta',
    collections: ['pantry', 'budget'],
    title: 'Tuna and lemon pasta',
    blurb: 'The tin, the lemon, the oil. Ten minutes.',
    image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1400&q=80',
    recipe: {
      prep_time: 5,
      cook_time: 12,
      estimated_cost: 2.4,
      calories: 520,
      protein: 28,
      carbs: 64,
      fat: 16,
      instructions:
        '1. Boil pasta in salted water.\n2. In a bowl, flake tuna with lemon, olive oil, and pepper.\n3. Toss with the hot pasta and a splash of water.\n4. Parsley if you have it. Eat immediately.',
      ingredients: [
        { ingredient_name: 'Pasta', quantity: 200, unit: 'g', category: 'Dry goods' },
        { ingredient_name: 'Tinned tuna', quantity: 1, unit: 'tin', category: 'Store cupboard' },
        { ingredient_name: 'Lemon', quantity: 0.5, unit: '', category: 'Veg' },
        { ingredient_name: 'Olive oil', quantity: 2, unit: 'tbsp', category: 'Store cupboard' },
        { ingredient_name: 'Black pepper', quantity: 1, unit: 'pinch', category: 'Store cupboard' },
      ],
    },
  }),
]

export function searchCatalog(query) {
  const q = String(query || '').trim().toLowerCase()
  if (!q) return []
  const words = q.split(/\s+/).filter(Boolean)
  return CATALOG.filter((d) => {
    const hay = `${d.title} ${d.blurb} ${d.collections.join(' ')}`.toLowerCase()
    return words.every((w) => hay.includes(w))
  })
}

export function dishesForCollection(collectionId) {
  return CATALOG.filter((d) => d.collections.includes(collectionId))
}

export function catalogDishById(id) {
  return CATALOG.find((d) => d.id === id) ?? null
}
