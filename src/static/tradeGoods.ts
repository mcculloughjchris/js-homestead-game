import { Item } from './itemTypes'

/** Items that aren't grown in the garden (plantTypes) but can still show up in an inventory - e.g. things an NPC trades. */
export interface TradeGood extends Item {
  category: 'tradeGood'
}

const tradeGoods: Record<string, TradeGood> = {
  honey: {
    id: 'honey',
    name: 'Honey',
    category: 'tradeGood',
    value: 10
  },
  beeswax: {
    id: 'beeswax',
    name: 'Beeswax',
    category: 'tradeGood',
    value: 15
  }
}

export default tradeGoods
