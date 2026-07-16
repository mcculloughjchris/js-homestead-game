import { gameMap } from "../../static/mapData"
import { PlayerAction } from "../../static/playerActions"

interface OverlayProps {
  currentLocation: string
  currentDirection: "n" | "s" | "e" | "w"
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

const Overlay = ({ currentLocation, currentDirection, days }: OverlayProps) => {
  const currentDay = days[days.length - 1] ?? []
  const hoursElapsed = currentDay.reduce((total, action) => total + action.cost, 0)
  const currentTime = formatTime(DAY_START_HOUR + hoursElapsed)

  return (
    <div className="overlay">
      <div className="time">{currentTime}</div>
      <div className="map">
        {gameMap.map((row, index) => {
          return (
            <div
              className="map-col"
              key={`row-${index}`}
            >
              {row.map((col, iindex) => {
                const boundaryClassName = col.boundary?.map(b => `boundary-${b}`).join(" ") || ""
                return (
                  <div
                    className={`map-row ${boundaryClassName}`}
                    key={`row-${index}-col-${iindex}`}
                  >
                    {currentLocation === col.path ? (
                      <div className={`player player-${currentDirection}`}>&gt;</div>
                    ) : ""}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Overlay
