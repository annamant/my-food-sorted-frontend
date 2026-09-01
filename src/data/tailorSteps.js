/**
 * Generalist "tailor" — guided profile builder steps for MFS.
 * No BMR, no protein targets, no medication. Just what you like,
 * what you avoid, your time, your kitchen, and who you cook for.
 */

export const CUISINE_OPTIONS = [
  'Italian', 'Mexican', 'Thai', 'Indian', 'Chinese', 'Japanese',
  'French', 'Mediterranean', 'British', 'American', 'Middle Eastern',
  'Caribbean', 'African', 'Korean', 'Vietnamese', 'Spanish', 'Greek',
]

export const TIME_OPTIONS = [
  { id: 15, label: '15 min' },
  { id: 30, label: '30 min' },
  { id: 45, label: '45 min' },
  { id: 60, label: '60 min' },
  { id: 90, label: '90 min+' },
]

export const EQUIPMENT_OPTIONS = [
  'oven', 'hob', 'microwave', 'air fryer', 'slow cooker',
  'pressure cooker', 'grill', 'blender', 'rice cooker', 'food processor',
]

export const SKILL_OPTIONS = [
  { id: 'beginner', label: 'Beginner' },
  { id: 'confident', label: 'Confident' },
  { id: 'advanced', label: 'Advanced' },
]

export const COOKS_FOR_OPTIONS = [
  'Just me',
  'Me and my partner',
  'Family with kids',
  'Flatmates',
  'Cooking for one and visitors',
]

export const AGE_OPTIONS = [
  { id: 'under_18', label: 'Under 18' },
  { id: '18_30', label: '18–30' },
  { id: '31_50', label: '31–50' },
  { id: '51_65', label: '51–65' },
  { id: 'over_65', label: 'Over 65' },
]

export const SEX_OPTIONS = [
  { id: 'female', label: 'Female' },
  { id: 'male', label: 'Male' },
  { id: 'other', label: 'Other' },
  { id: 'prefer_not_to_say', label: 'Prefer not to say' },
]

export const ACTIVITY_OPTIONS = [
  { id: 'low', label: 'Low' },
  { id: 'moderate', label: 'Moderate' },
  { id: 'active', label: 'Active' },
  { id: 'very_active', label: 'Very active' },
]

export const TAILOR_STEPS = [
  {
    id: 'cuisines',
    title: 'What do you like to eat?',
    sub: 'Pick a few cuisines you enjoy. We lean your plans toward these.',
    type: 'chips',
    options: CUISINE_OPTIONS,
    field: 'cuisines',
    multi: true,
    required: false,
  },
  {
    id: 'avoid',
    title: 'Anything you avoid?',
    sub: 'Allergies, dislikes, or ingredients you never want. We keep these out of your plans.',
    type: 'text',
    field: 'avoid',
    placeholder: 'e.g. nuts, shellfish, coriander',
    required: false,
  },
  {
    id: 'time',
    title: 'How much time do you have per meal?',
    sub: 'We keep recipes within your window.',
    type: 'chips',
    options: TIME_OPTIONS,
    field: 'max_cook_minutes',
    required: true,
  },
  {
    id: 'equipment',
    title: "What's in your kitchen?",
    sub: 'Pick the equipment you have. We suggest recipes that use it.',
    type: 'chips',
    options: EQUIPMENT_OPTIONS,
    field: 'kitchen_equipment',
    multi: true,
    required: false,
  },
  {
    id: 'cooks_for',
    title: 'Who do you cook for?',
    sub: 'So we size the portions right.',
    type: 'chips',
    options: COOKS_FOR_OPTIONS,
    field: 'cooks_for',
    required: false,
  },
  {
    id: 'household',
    title: 'How many people is that?',
    sub: 'The number of servings to plan for.',
    type: 'number',
    field: 'household_size',
    min: 1,
    max: 20,
    required: true,
  },
  {
    id: 'skill',
    title: 'How confident are you in the kitchen?',
    sub: 'We tune how much hand-holding the recipes get.',
    type: 'chips',
    options: SKILL_OPTIONS,
    field: 'cooking_skill',
    required: false,
  },
  {
    id: 'budget',
    title: 'Weekly budget?',
    sub: 'Roughly. We aim your week at this.',
    type: 'number',
    field: 'default_budget',
    min: 0,
    max: 500,
    prefix: '£',
    required: false,
  },
  {
    id: 'about',
    title: 'A bit about you (optional)',
    sub: 'Helps size portions and pick realistic meals. No medical info, no medication. Skip if you like.',
    type: 'about',
    fields: ['age_range', 'sex', 'activity_level', 'weight_kg'],
    required: false,
  },
]
