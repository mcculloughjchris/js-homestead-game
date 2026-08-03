import { useState } from "react"
import { useNavigate } from "react-router-dom"
import useGame from "../hooks/useGame"
import plantTypes from "../../static/plantTypes"
import Toasts from "./Toasts"
import Clock from "./Clock"

const GRID_ROWS = 4
const GRID_COLS = 4

const dispatchToast = (message: string, type: "success" | "danger" = "success") => {
  window.dispatchEvent(new CustomEvent('toast', { detail: { message, type } }))
}

const Garden = () => {
  const navigate = useNavigate()
  const { game, setGame } = useGame()
  const [ selectedBed, setSelectedBed ] = useState<number | null>(null)

  const garden = game.garden || []
  const currentDay = game.days.length - 1

  const handleBackButtonClick = () => {
    navigate(`/${game.id}/porch2/s`)
  }

  const handleHarvest = async (bedIndex: number) => {
    const result = await window.electron.ipcRenderer.invoke('harvest-plant', game, bedIndex)

    if (result) {
      setGame(result.game)
      dispatchToast(`Harvested ${result.amount} ${result.plantName}!`)
    }
  }

  const handleBedClick = (bedIndex: number, bed: any) => {
    if (bed === null || bed === undefined) {
      setSelectedBed(bedIndex)
      return
    }

    const plantType = plantTypes[bed.plantId]
    const daysGrown = currentDay - bed.plantedOnDay

    if (plantType && daysGrown >= plantType.daysToGrow) {
      handleHarvest(bedIndex)
    }
  }

  const handlePlantSeed = async (plantId: string) => {
    if (selectedBed === null) return

    const result = await window.electron.ipcRenderer.invoke('plant-seed', game, selectedBed, plantId)
    setGame(result)
    setSelectedBed(null)
  }

  return (
    <div>
      <div className="garden">
        {Array.from({ length: GRID_ROWS }).map((_, rowIndex) => {
          return (
            <div
              className="garden-row"
              key={`row-${rowIndex}`}
            >
              {Array.from({ length: GRID_COLS }).map((_, colIndex) => {
                const bedIndex = rowIndex * GRID_COLS + colIndex
                const bed = garden[bedIndex] ?? null

                let className = "garden-bed"
                let label = null

                if (bed === null) {
                  className += " garden-bed-empty"
                } else {
                  const plantType = plantTypes[bed.plantId]
                  const daysGrown = currentDay - bed.plantedOnDay
                  const isReady = plantType !== undefined && daysGrown >= plantType.daysToGrow

                  className += ` plant-${bed.plantId} ${isReady ? "garden-bed-ready" : "garden-bed-growing"}`
                  label = isReady
                    ? `${plantType?.name} ready!`
                    : `${plantType?.name} (${daysGrown}/${plantType?.daysToGrow})`
                }

                return (
                  <div
                    className={className}
                    key={`row-${rowIndex}-col-${colIndex}`}
                    onClick={() => handleBedClick(bedIndex, bed)}
                  >
                    {label !== null ? <span className="garden-bed-label">{label}</span> : null}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      {selectedBed !== null ? (
        <div className="seed-picker">
          {Object.values(plantTypes).map(plantType => {
            return (
              <button
                key={plantType.id}
                onClick={() => handlePlantSeed(plantType.id)}
              >{plantType.name}</button>
            )
          })}
          <button onClick={() => setSelectedBed(null)}>Cancel</button>
        </div>
      ) : null}

      <button onClick={handleBackButtonClick}>Back</button>
      <Clock days={game.days} />
      <Toasts />
    </div>
  )
}

export default Garden
