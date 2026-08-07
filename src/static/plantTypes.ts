import { Item } from './itemTypes'

export interface PlantType extends Item {
  category: 'plant'
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
    category: 'plant',
    daysToGrow: 3,
    minHarvest: 1,
    maxHarvest: 4,
    value: 5
  },
  peas: {
    id: 'peas',
    name: 'Peas',
    category: 'plant',
    daysToGrow: 4,
    minHarvest: 2,
    maxHarvest: 6,
    value: 2
  },
  cucumber: {
    id: 'cucumber',
    name: 'Cucumber',
    category: 'plant',
    daysToGrow: 5,
    minHarvest: 1,
    maxHarvest: 3,
    value: 3
  },
  tomato: {
    id: 'tomato',
    name: 'Tomato',
    category: 'plant',
    daysToGrow: 6,
    minHarvest: 2,
    maxHarvest: 5,
    value: 3
  },
  carrot: {
    id: 'carrot',
    name: 'Carrot',
    category: 'plant',
    daysToGrow: 4,
    minHarvest: 2,
    maxHarvest: 5,
    value: 3
  },
  asparagus: {
    id: 'asparagus',
    name: 'Asparagus',
    category: 'plant',
    daysToGrow: 7,
    minHarvest: 1,
    maxHarvest: 3,
    value: 6
  },
  strawberry: {
    id: 'strawberry',
    name: 'Strawberry',
    category: 'plant',
    daysToGrow: 5,
    minHarvest: 3,
    maxHarvest: 8,
    value: 2
  }
}

export default plantTypes
