/**
 * Base shape every item in the game conforms to, regardless of category
 * (plant, trade good, ...). Category-specific registries (plantTypes,
 * tradeGoods) extend this with whatever extra fields their domain needs -
 * see items.ts for the merged, category-agnostic registry.
 */
export interface Item {
  id: string
  name: string
  value: number
  category: string
}
