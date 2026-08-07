/** A world object with its own inventory attached - a chest, box, etc. */
export interface Container {
  id: string
  name: string
  path: string
  direction: "n" | "s" | "e" | "w"
  startingInventory?: Record<string, number>
  /** Chance (0-1) an inspector searches this container rather than just glancing at it and moving on.
   *  Falls back to DEFAULT_SEARCH_CHANCE (see InspectionManager) if omitted. */
  searchChance?: number
}

export const containers: Container[] = [
  {
    id: 'chest-bathroom-n',
    name: 'Old Chest',
    path: 'bathroom',
    direction: 'n',
    searchChance: 0.35,
    startingInventory: {
      carrot: 3
    }
  }
]
