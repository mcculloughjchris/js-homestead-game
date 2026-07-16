export interface PlayerAction {
  id: string
  cost: number
}

export interface PlayerActions {
  [k: string]: PlayerAction
}

const playerActions: PlayerActions = {
  'move': {
    id: 'move',
    cost: 0.01
  }
}

export default playerActions
