import { randomUUID } from 'crypto'
import characters, { Character } from '../static/characterData'

const newGameData = (name: string) => {
  const characterPositions = () => Object.values(characters).map((c: Character) => ({
    name: c.name,
    path: null,
    direction: null
  }))

  return {
    id: randomUUID(),
    name: name,
    tutorialed: false,
    health: 100,
    hunger: 100,
    thirst: 100,
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
    inventory: {}
  }
}

export default newGameData
