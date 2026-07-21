export interface PlayerAction {
  id: string
  timeCost: number
}

export interface PlayerActions {
  [k: string]: PlayerAction
}

const playerActions: PlayerActions = {
  'move': {
    id: 'move',
    timeCost: 1
  }
}

export default playerActions
