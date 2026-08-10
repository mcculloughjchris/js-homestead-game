import { PlayerAction } from "../../static/playerActions"
import { formatTime12Hour, getCurrentDecimalHours } from "../../static/gameTime"

interface ClockProps {
  days: PlayerAction[][]
}

const Clock = ({ days }: ClockProps) => {
  const currentTime = formatTime12Hour(getCurrentDecimalHours(days))

  return (
    <>
      <div className="day">Day {days.length > 1 ? days.length : 1}</div>
      <div className="time">{currentTime}</div>
    </>
  )
}

export default Clock
