import { randomUUID } from 'crypto'
import characters, { Character } from '../static/characterData'
import { containers } from '../static/containers'
import seedItems from '../static/seedTypes'
import { PLAYER_INVENTORY_ID } from '../static/inventory'

const STARTING_SEED_COUNT = 2

const newGameData = (name: string) => {
  const characterPositions = () => Object.values(characters).map((c: Character) => ({
    name: c.name,
    path: null,
    direction: null
  }))

  const startingInventories = () => {
    const inventories: Record<string, Record<string, number>> = {
      [PLAYER_INVENTORY_ID]: Object.values(seedItems).reduce((acc, seed) => {
        acc[seed.id] = STARTING_SEED_COUNT
        return acc
      }, {} as Record<string, number>)
    }

    Object.values(characters).forEach((c: Character) => {
      inventories[c.name] = { ...(c.startingInventory ?? {}) }
    })

    containers.forEach((container) => {
      inventories[container.id] = { ...(container.startingInventory ?? {}) }
    })

    return inventories
  }

  return {
    id: randomUUID(),
    name: name,
    tutorialed: false,
    health: 100,
    hunger: 0,
    thirst: 0,
    stamina: 100,
    bathroom: 0,
    money: 100,
    days: [[]],
    saves: 0,
    currentLocation: "lroom0",
    currentDirection: "s",
    currentDoor: null,
    characterPositions: characterPositions(),
    completedConvos: [],
    garden: Array.from({ length: 16 }, () => null),
    inventories: startingInventories(),
    gameEnded: false
  }
}

export default newGameData
