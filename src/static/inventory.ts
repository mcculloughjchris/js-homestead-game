/**
 * Generic inventory system - any object in the game (the player, a
 * character, a future chest/container, etc.) can have an inventory attached
 * to it just by having an entry in `game.inventories`, keyed by that
 * object's own id ("player", a character's name, a container id you make
 * up, ...). There's no separate registration step: attachInventory() (or
 * simply calling addItem() on a fresh ownerId) is all it takes to give
 * something an inventory.
 *
 * Save state shape:
 *   game.inventories: {
 *     [ownerId: string]: { [itemId: string]: number }
 *   }
 *
 * This lives in src/static (not src/main) because it's pure data logic with
 * no Electron/Node dependency - both the main process (IPC handlers that
 * mutate game state) and the renderer (if it ever needs to read/display an
 * inventory directly) can import it.
 */

export interface InventoryItems {
  [itemId: string]: number
}

export interface Inventories {
  [ownerId: string]: InventoryItems
}

/** Well-known owner id for the player's own inventory. */
export const PLAYER_INVENTORY_ID = 'player'

/** Returns an owner's inventory contents, or an empty object if they don't have one (yet). */
export const getInventory = (game: any, ownerId: string): InventoryItems => {
  return game.inventories?.[ownerId] ?? {}
}

/** Does this owner have an inventory attached at all (even an empty one)? */
export const hasInventory = (game: any, ownerId: string): boolean => {
  return game.inventories?.[ownerId] !== undefined
}

/** Attaches an empty inventory to an owner if it doesn't already have one. Returns a new game object. */
export const attachInventory = (game: any, ownerId: string): any => {
  if (hasInventory(game, ownerId)) return game

  return {
    ...game,
    inventories: {
      ...game.inventories,
      [ownerId]: {}
    }
  }
}

/** Does this owner have at least `quantity` of `itemId`? */
export const hasItem = (game: any, ownerId: string, itemId: string, quantity: number = 1): boolean => {
  return (getInventory(game, ownerId)[itemId] ?? 0) >= quantity
}

/** Adds `quantity` of `itemId` to an owner's inventory (creating the inventory if needed). Returns a new game object. */
export const addItem = (game: any, ownerId: string, itemId: string, quantity: number): any => {
  const inventory = getInventory(game, ownerId)

  return {
    ...game,
    inventories: {
      ...game.inventories,
      [ownerId]: {
        ...inventory,
        [itemId]: (inventory[itemId] ?? 0) + quantity
      }
    }
  }
}

/**
 * Removes up to `quantity` of `itemId` from an owner's inventory - never
 * goes below 0, and the item key is dropped entirely once it hits 0. Returns
 * a new game object.
 */
export const removeItem = (game: any, ownerId: string, itemId: string, quantity: number): any => {
  const inventory = getInventory(game, ownerId)
  const remaining = Math.max(0, (inventory[itemId] ?? 0) - quantity)

  const updatedItems = { ...inventory }

  if (remaining > 0) {
    updatedItems[itemId] = remaining
  } else {
    delete updatedItems[itemId]
  }

  return {
    ...game,
    inventories: {
      ...game.inventories,
      [ownerId]: updatedItems
    }
  }
}

/**
 * Moves up to `quantity` of `itemId` from one owner's inventory into
 * another's (e.g. the player looting a chest, or handing an item to a
 * character). Only moves as much as is actually available. Returns a new
 * game object.
 */
export const transferItem = (
  game: any,
  fromOwnerId: string,
  toOwnerId: string,
  itemId: string,
  quantity: number
): any => {
  const available = getInventory(game, fromOwnerId)[itemId] ?? 0
  const moving = Math.min(available, quantity)

  if (moving <= 0) return game

  return addItem(removeItem(game, fromOwnerId, itemId, moving), toOwnerId, itemId, moving)
}
