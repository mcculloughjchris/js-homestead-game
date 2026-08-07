import { Item } from './itemTypes'

export interface SeedType extends Item {
  category: 'seed'
  grows: string
}

export interface SeedTypes {
  [k: string]: SeedType
}

const seedItems: SeedTypes = {
  lettuce_seed: {
    id: 'lettuce_seed',
    name: 'Lettuce seed',
    category: 'seed',
    grows: 'lettuce',
    value: 5
  },
  peas_seed: {
    id: 'peas_seed',
    name: 'Peas seed',
    category: 'seed',
    grows: 'peas',
    value: 5
  },
  cucumber_seed: {
    id: 'cucumber_seed',
    name: 'Cucumber seed',
    category: 'seed',
    grows: 'cucumber',
    value: 5
  },
  tomato_seed: {
    id: 'tomato_seed',
    name: 'Tomato seed',
    category: 'seed',
    grows: 'tomato',
    value: 5
  },
  carrot_seed: {
    id: 'carrot_seed',
    name: 'Carrot seed',
    category: 'seed',
    grows: 'carrot',
    value: 5,
  },
  asparagus_seed: {
    id: 'asparagus_seed',
    name: 'Asparagus seed',
    category: 'seed',
    grows: 'asparagus',
    value: 5
  },
  strawberry_seed: {
    id: 'strawberry_seed',
    name: 'Strawberry seed',
    category: 'seed',
    grows: 'strawberry',
    value: 5
  }
}
