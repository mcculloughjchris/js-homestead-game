import { PlayerAction } from './playerActions'

export const DAY_START_HOUR = 8 // 8:00 AM
export const DAY_END_HOUR = 21 // 9:00 PM

// Current time of day as decimal hours (e.g. 13.5 = 1:30PM), clamped to the
// playable day window.
export const getCurrentDecimalHours = (days: PlayerAction[][]) => {
  const currentDay = days[days.length - 1] ?? []
  const hoursElapsed = currentDay.reduce((total, action) => total + action.timeCost, 0)

  return Math.min(Math.max(DAY_START_HOUR + hoursElapsed, DAY_START_HOUR), DAY_END_HOUR)
}

// e.g. "1:30PM"
export const formatTime12Hour = (decimalHours: number) => {
  const totalMinutes = Math.round(decimalHours * 60)
  const hours24 = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  const period = hours24 >= 12 ? "PM" : "AM"
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12

  return `${hours12}:${minutes.toString().padStart(2, "0")}${period}`
}

// e.g. "13:30"
export const formatTime24Hour = (decimalHours: number) => {
  const totalMinutes = Math.round(decimalHours * 60)
  const hours24 = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  return parseInt(`${hours24.toString().padStart(2, "0")}${minutes.toString().padStart(2, "0")}`)
}
