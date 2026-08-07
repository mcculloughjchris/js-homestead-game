import { Item } from './itemTypes'
import plantTypes from './plantTypes'
import tradeGoods from './tradeGoods'
import bookItems from './bookItems'
import seedItems from './seedTypes'

/**
 * Every item in the game, regardless of category, keyed by id - the single
 * place to look up "what is this item" (name, category, etc) without caring
 * which category-specific registry it actually lives in.
 *
 * Code that needs a category's extra fields (e.g. garden growth logic
 * needing PlantType.daysToGrow) should still import that registry directly
 * (plantTypes, tradeGoods) rather than going through here.
 */
const items: Record<string, Item> = {
  ...plantTypes,
  ...tradeGoods,
  ...bookItems,
  ...seedItems
}

export default items

export const getItem = (itemId: string): Item | undefined => items[itemId]

/** Resolves any item id to a display name, falling back to the raw id if it's not registered anywhere. */
export const resolveItemName = (itemId: string): string => getItem(itemId)?.name ?? itemId

export const allItems = (): Item[] => Object.values(items)
