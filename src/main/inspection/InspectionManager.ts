import { containers, Container } from '../../static/containers'
import { getInventory } from '../../static/inventory'
import { getItem } from '../../static/items'
import { gameMap, Direction } from '../../static/mapData'
import { createRNG, RNG } from '../../static/rng'
import { directionBetween, findRoutePath } from './officerRouting'

export type InspectionPhase = 'walking' | 'paused' | 'searching' | 'caught' | 'complete'

export interface InspectionState {
  active: boolean
  officerName: string
  phase: InspectionPhase
  currentLocation: string
  currentDirection: Direction
  statusMessage: string
  checkedContainerIds: string[]
  foundIllegalItem: { itemId: string; containerId: string } | null
}

/**
 * Tunable per-inspector behavior. Only one profile exists today
 * (DEFAULT_INSPECTOR_PROFILE), but this is the extension point for future
 * "different inspector personalities"/"search thoroughness" - a stricter
 * inspector would just be a profile with higher `thoroughness` and/or
 * shorter pause/search times.
 */
export interface InspectorProfile {
  /** Multiplies every container's searchChance (>1 = searches more often than the container's base chance). */
  thoroughness: number
  walkStepMs: number
  pauseMs: number
  searchMs: number
}

export const DEFAULT_INSPECTOR_PROFILE: InspectorProfile = {
  thoroughness: 1,
  walkStepMs: 900,
  pauseMs: 600,
  searchMs: 1400
}

/** Used for any inspectable container that doesn't specify its own searchChance. */
export const DEFAULT_SEARCH_CHANCE = 0.5

type ItineraryStep =
  | { type: 'walk'; toPath: string; toDirection: Direction }
  | { type: 'visit'; container: Container }
  | { type: 'leave' }

interface InspectionCallbacks {
  /** Called after every state change (walking, pausing, searching, ...) - broadcast it to the renderer. */
  onUpdate: (game: any) => void
  /** Called once, when an illegal item is discovered - inspection is already stopped by this point. */
  onCaught: (game: any) => void
  /** Called once, when the inspection finishes with nothing found. */
  onComplete: (game: any) => void
}

interface InspectionSession extends InspectionCallbacks {
  game: any
  officerName: string
  profile: InspectorProfile
  itinerary: ItineraryStep[]
  stepIndex: number
  state: InspectionState
  rng: RNG
  timer: ReturnType<typeof setTimeout> | null
}

/**
 * Owns officer navigation/searching/discovery for in-progress inspections.
 * React only ever renders `game.inspection` - all state transitions and
 * decisions happen here, not in components.
 *
 * Sessions are keyed by officer name (a Map, not a single slot), so tracking
 * multiple concurrent inspections - a listed future feature ("multiple
 * officers") - doesn't require restructuring this class, just calling
 * start() again with a different name. Only one session will ever exist
 * today since only one officer conversation leads here.
 */
class InspectionManager {
  private sessions = new Map<string, InspectionSession>()

  isActive(officerName: string): boolean {
    return this.sessions.has(officerName)
  }

  start(
    game: any,
    officerName: string,
    callbacks: InspectionCallbacks,
    profile: InspectorProfile = DEFAULT_INSPECTOR_PROFILE,
    rng: RNG = createRNG()
  ): any {
    if (this.sessions.has(officerName)) return game

    const itinerary = this.buildItinerary(game.currentLocation)

    const state: InspectionState = {
      active: true,
      officerName,
      phase: 'walking',
      currentLocation: game.currentLocation,
      currentDirection: game.currentDirection,
      statusMessage: `${officerName} begins looking around...`,
      checkedContainerIds: [],
      foundIllegalItem: null
    }

    const updatedGame = { ...game, inspection: state }

    const session: InspectionSession = {
      ...callbacks,
      game: updatedGame,
      officerName,
      profile,
      itinerary,
      stepIndex: 0,
      state,
      rng,
      timer: null
    }

    this.sessions.set(officerName, session)
    callbacks.onUpdate(updatedGame)
    this.scheduleNextStep(session, profile.walkStepMs)

    return updatedGame
  }

  /** Cancels an in-progress inspection outright with no result - extension point for
   *  future interrupts (fleeing, combat) rather than a normal caught/complete ending. */
  cancel(officerName: string): void {
    const session = this.sessions.get(officerName)
    if (!session) return

    if (session.timer) clearTimeout(session.timer)
    this.sessions.delete(officerName)
  }

  /**
   * Builds the officer's full route: visits every room in the house (grid
   * order), and at any room containing one or more registered containers,
   * pauses to visit each one. "Furniture" is detected purely by being in
   * the containers registry - anything with an inventory attached to a
   * room, no hardcoded names. Finishes by routing back to the start and
   * leaving.
   *
   * This is a full sweep of the grid in a fixed order, not a shortest-tour
   * optimization - "believable rather than perfectly optimized" per spec,
   * so some backtracking between rooms is expected and fine.
   */
  private buildItinerary(startPath: string): ItineraryStep[] {
    const steps: ItineraryStep[] = []
    let currentPath = startPath

    const allRoomPaths = gameMap.flat().map((room) => room.path)

    allRoomPaths.forEach((roomPath) => {
      if (roomPath === currentPath) return // already here

      const route = findRoutePath(currentPath, roomPath)
      if (!route) return // unreachable room - skip it rather than getting stuck

      for (let i = 1; i < route.length; i++) {
        const toDirection = directionBetween(route[i - 1], route[i]) ?? 'n'
        steps.push({ type: 'walk', toPath: route[i], toDirection })
      }

      currentPath = roomPath

      containers
        .filter((container) => container.path === roomPath)
        .forEach((container) => steps.push({ type: 'visit', container }))
    })

    const routeHome = findRoutePath(currentPath, startPath)
    if (routeHome) {
      for (let i = 1; i < routeHome.length; i++) {
        const toDirection = directionBetween(routeHome[i - 1], routeHome[i]) ?? 'n'
        steps.push({ type: 'walk', toPath: routeHome[i], toDirection })
      }
    }

    steps.push({ type: 'leave' })

    return steps
  }

  private scheduleNextStep(session: InspectionSession, delayMs: number): void {
    session.timer = setTimeout(() => this.runNextStep(session), delayMs)
  }

  private updateState(session: InspectionSession, patch: Partial<InspectionState>): void {
    session.state = { ...session.state, ...patch }
    session.game = { ...session.game, inspection: session.state }
  }

  private runNextStep(session: InspectionSession): void {
    const step = session.itinerary[session.stepIndex]
    session.stepIndex += 1

    if (!step) {
      this.finish(session)
      return
    }

    if (step.type === 'walk') {
      this.updateState(session, {
        phase: 'walking',
        currentLocation: step.toPath,
        currentDirection: step.toDirection,
        statusMessage: `${session.officerName} is walking through the house...`
      })
      session.onUpdate(session.game)
      this.scheduleNextStep(session, session.profile.walkStepMs)
      return
    }

    if (step.type === 'visit') {
      this.visitContainer(session, step.container)
      return
    }

    this.finish(session)
  }

  private visitContainer(session: InspectionSession, container: Container): void {
    const searchChance = Math.min(
      1,
      (container.searchChance ?? DEFAULT_SEARCH_CHANCE) * session.profile.thoroughness
    )
    const willSearch = session.rng.chance(searchChance)

    this.updateState(session, {
      phase: willSearch ? 'searching' : 'paused',
      currentLocation: container.path,
      currentDirection: container.direction,
      statusMessage: willSearch
        ? `${session.officerName} is searching the ${container.name}...`
        : `${session.officerName} glances at the ${container.name} and moves on.`
    })
    session.onUpdate(session.game)

    if (!willSearch) {
      this.scheduleNextStep(session, session.profile.pauseMs)
      return
    }

    session.timer = setTimeout(() => this.resolveSearch(session, container), session.profile.searchMs)
  }

  private resolveSearch(session: InspectionSession, container: Container): void {
    // Extension point: a "hidden compartment" would just be a container this
    // officer's profile has a reduced (or zero) chance of ever finding, e.g.
    // a per-container `concealment` field factored in here alongside
    // thoroughness. Not implemented - containers are fully visible today.
    const inventory = getInventory(session.game, container.id)
    const illegalItemId = Object.keys(inventory).find((itemId) => {
      if ((inventory[itemId] ?? 0) <= 0) return false
      return getItem(itemId)?.illegal === true
    })

    this.updateState(session, {
      checkedContainerIds: [...session.state.checkedContainerIds, container.id]
    })

    if (illegalItemId) {
      this.updateState(session, {
        active: false,
        phase: 'caught',
        statusMessage: `${session.officerName} found something they shouldn't have.`,
        foundIllegalItem: { itemId: illegalItemId, containerId: container.id }
      })

      this.sessions.delete(session.officerName)
      session.onCaught(session.game)
      return
    }

    session.onUpdate(session.game)
    this.scheduleNextStep(session, session.profile.pauseMs)
  }

  private finish(session: InspectionSession): void {
    this.updateState(session, {
      active: false,
      phase: 'complete',
      statusMessage: `${session.officerName} leaves, satisfied.`
    })

    this.sessions.delete(session.officerName)
    session.onComplete(session.game)
  }
}

export default new InspectionManager()
