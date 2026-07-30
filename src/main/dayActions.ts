import { PlayerAction } from '../static/playerActions'
import { formatTime24Hour, getCurrentDecimalHours } from '../static/gameTime'

type DayActionListener = (game: any, action: PlayerAction, currentTime: string) => void

const listeners: DayActionListener[] = []

// Register a function to run whenever an action gets appended to the
// current (last) day in `game.days`. Useful for effects that should react
// to time passing/actions happening, e.g. depleting stamina/hunger/thirst.
// `currentTime` is the time of day after the action, in 24-hour/military
// format (e.g. "13:30").
export const onDayActionAdded = (listener: DayActionListener) => {
  listeners.push(listener)
}

// Append an action to the current day and fire any registered listeners.
// Returns a new game object with the updated `days` array.
export const addDayAction = (game: any, action: PlayerAction) => {
  const days = [...game.days]
  days[days.length - 1] = [...days[days.length - 1], action]

  const updatedGame = { ...game, days }
  const currentTime = formatTime24Hour(getCurrentDecimalHours(updatedGame.days))

  listeners.forEach((listener) => listener(updatedGame, action, currentTime))

  return updatedGame
}
