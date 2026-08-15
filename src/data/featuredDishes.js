import { catalogDishById } from './catalog'

const FEATURED_IDS = ['ragu', 'salmon-teriyaki', 'chickpea-stew']

export const FEATURED_DISHES = FEATURED_IDS.map((id) => {
  const d = catalogDishById(id)
  return {
    id: d.id,
    eyebrow: d.collections.includes('wellbeing')
      ? 'High-protein'
      : d.collections.includes('budget')
        ? 'Budget week'
        : 'Italian classic',
    title: d.title,
    blurb: d.blurb,
    image: d.image,
    mealPlan: d.mealPlan,
  }
})
