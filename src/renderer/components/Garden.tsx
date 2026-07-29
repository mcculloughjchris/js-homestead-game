import { useNavigate } from "react-router-dom"
import useGame from "../hooks/useGame"

const Garden = () => {
  const navigate = useNavigate()
  const { game } = useGame()

  const handleBackButtonClick = () => {
    navigate(`/${game.id}/porch2/s`)
  }

  return (
    <div>
      <div className="garden">
        {Array.from({ length: 4 }).map((_, rowIndex) => {
          return (
            <div
              className="garden-row"
              key={`row-${rowIndex}`}
            >
              {Array.from({ length: 4 }).map((_, colIndex) => {
                return (
                  <div
                    className="garden-bed"
                    key={`row-${rowIndex}-col-${colIndex}`}
                  ></div>
                )
              })}
            </div>
          )
        })}
      </div>

      <button onClick={handleBackButtonClick}>Back</button>
    </div>
  )
}

export default Garden
