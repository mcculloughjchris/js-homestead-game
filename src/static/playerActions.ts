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
    timeCost: 0.005
  }
}

export default playerActions
