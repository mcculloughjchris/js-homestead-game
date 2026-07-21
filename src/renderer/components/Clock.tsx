import { PlayerAction } from "../../static/playerActions"

interface ClockProps {
  days: PlayerAction[][]
}

const DAY_START_HOUR = 8 // 8:00 AM
const DAY_END_HOUR = 21 // 9:00 PM

const formatTime = (decimalHours: number) => {
  const clamped = Math.min(Math.max(decimalHours, DAY_START_HOUR), DAY_END_HOUR)

  const totalMinutes = Math.round(clamped * 60)
  const hours24 = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  const period = hours24 >= 12 ? "PM" : "AM"
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12

  return `${hours12}:${minutes.toString().padStart(2, "0")}${period}`
}

const Clock = ({ days }: ClockProps) => {
  const currentDay = days[days.length - 1] ?? []
  const hoursElapsed = currentDay.reduce((total, action) => total + action.timeCost, 0)
  const currentTime = formatTime(DAY_START_HOUR + hoursElapsed)

  return (
    <div className="time">{currentTime}</div>
  )
}

export default Clock
