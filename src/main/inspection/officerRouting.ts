import { gameMap, roomValues, Direction } from '../../static/mapData'

interface Coord {
  row: number
  col: number
}

const DIRECTION_DELTAS: Record<Direction, Coord> = {
  n: { row: -1, col: 0 },
  s: { row: 1, col: 0 },
  e: { row: 0, col: 1 },
  w: { row: 0, col: -1 }
}

const DIRECTIONS: Direction[] = ['n', 's', 'e', 'w']

const findCoord = (path: string): Coord | null => {
  for (let row = 0; row < gameMap.length; row++) {
    for (let col = 0; col < gameMap[row].length; col++) {
      if (gameMap[row][col].path === path) return { row, col }
    }
  }

  return null
}

/** Whether you can step out of `path` heading `direction` - mirrors the exact boundary
 *  check main.ts's keypress handler already uses for player movement, so the officer is
 *  bound by the same walls the player is. */
const canStep = (path: string, direction: Direction): boolean => {
  const room = Object.values(roomValues).find((r) => r.path === path)
  if (!room) return false
  if (room.boundary === undefined || room.boundary === null) return true

  return room.boundary.indexOf(direction) === -1
}

/**
 * Shortest room-to-room route from `fromPath` to `toPath` via BFS over the
 * grid (respecting each room's boundary walls), returned as an inclusive
 * list of room paths. Returns null if there's no route.
 *
 * There's no existing multi-room pathfinding system to reuse (the game's own
 * movement primitives - oneSpaceForward/oneSpaceBackward - are single-step
 * only), so this is a small, purpose-built BFS using the same underlying
 * grid/boundary data those primitives use.
 */
export const findRoutePath = (fromPath: string, toPath: string): string[] | null => {
  if (fromPath === toPath) return [fromPath]

  const queue: string[][] = [[fromPath]]
  const visited = new Set<string>([fromPath])

  while (queue.length > 0) {
    const path = queue.shift() as string[]
    const current = path[path.length - 1]
    const coord = findCoord(current)
    if (!coord) continue

    for (const direction of DIRECTIONS) {
      if (!canStep(current, direction)) continue

      const delta = DIRECTION_DELTAS[direction]
      const next = gameMap[coord.row + delta.row]?.[coord.col + delta.col]
      if (!next || visited.has(next.path)) continue

      visited.add(next.path)
      const nextPath = [...path, next.path]

      if (next.path === toPath) return nextPath

      queue.push(nextPath)
    }
  }

  return null
}

/** Which direction you'd be facing having just stepped from `fromPath` into the adjacent `toPath`. */
export const directionBetween = (fromPath: string, toPath: string): Direction | null => {
  const from = findCoord(fromPath)
  const to = findCoord(toPath)
  if (!from || !to) return null

  const rowDelta = to.row - from.row
  const colDelta = to.col - from.col

  if (rowDelta === -1 && colDelta === 0) return 'n'
  if (rowDelta === 1 && colDelta === 0) return 's'
  if (rowDelta === 0 && colDelta === 1) return 'e'
  if (rowDelta === 0 && colDelta === -1) return 'w'

  return null
}
