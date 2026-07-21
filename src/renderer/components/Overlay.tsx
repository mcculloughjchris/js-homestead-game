import { gameMap } from "../../static/mapData"
import { PlayerAction } from "../../static/playerActions"
import Clock from "./Clock"

interface OverlayProps {
  currentLocation: string
  currentDirection: "n" | "s" | "e" | "w"
  days: PlayerAction[][]
}

const Overlay = ({ currentLocation, currentDirection, days }: OverlayProps) => {
  return (
    <div className="overlay">
      <Clock days={days} />
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
