/** A world object with its own inventory attached - a chest, box, etc. */
export interface Container {
  id: string
  name: string
  path: string
  direction: "n" | "s" | "e" | "w"
  startingInventory?: Record<string, number>
}

export const containers: Container[] = [
  {
    id: 'chest-bathroom-n',
    name: 'Old Chest',
    path: 'bathroom',
    direction: 'n',
    startingInventory: {
      carrot: 3
    }
  }
]
