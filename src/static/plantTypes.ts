export interface PlantType {
  id: string
  name: string
  daysToGrow: number
  minHarvest: number
  maxHarvest: number
}

export interface PlantTypes {
  [k: string]: PlantType
}

const plantTypes: PlantTypes = {
  lettuce: {
    id: 'lettuce',
    name: 'Lettuce',
    daysToGrow: 3,
    minHarvest: 1,
    maxHarvest: 4
  },
  peas: {
    id: 'peas',
    name: 'Peas',
    daysToGrow: 4,
    minHarvest: 2,
    maxHarvest: 6
  },
  cucumber: {
    id: 'cucumber',
    name: 'Cucumber',
    daysToGrow: 5,
    minHarvest: 1,
    maxHarvest: 3
  },
  tomato: {
    id: 'tomato',
    name: 'Tomato',
    daysToGrow: 6,
    minHarvest: 2,
    maxHarvest: 5
  },
  carrot: {
    id: 'carrot',
    name: 'Carrot',
    daysToGrow: 4,
    minHarvest: 2,
    maxHarvest: 5
  },
  asparagus: {
    id: 'asparagus',
    name: 'Asparagus',
    daysToGrow: 7,
    minHarvest: 1,
    maxHarvest: 3
  },
  strawberry: {
    id: 'strawberry',
    name: 'Strawberry',
    daysToGrow: 5,
    minHarvest: 3,
    maxHarvest: 8
  }
}

export default plantTypes
