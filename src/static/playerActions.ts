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
  },
  'plant': {
    id: 'plant',
    timeCost: 0.25
  },
  'respond': {
    id: 'respond',
    timeCost: 0.0075
  }
}

export default playerActions
