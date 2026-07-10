import { gameMap } from "../../static/mapData"

interface OverlayProps {
  currentLocation: string
  currentDirection: "n" | "s" | "e" | "w"
}

const Overlay = ({ currentLocation, currentDirection }: OverlayProps) => {
  return (
    <div className="overlay">
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
                    {currentLocation === col.path ? "x" : ""}
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
