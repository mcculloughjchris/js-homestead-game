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
  // Distinct from 'move' so end-of-game statistics (e.g. "steps taken") can
  // tell player movement apart from officer movement during an inspection -
  // see InspectionManager, which logs this instead of 'move'.
  'officerMove': {
    id: 'officerMove',
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
