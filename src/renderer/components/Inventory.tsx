import { useEffect } from "react"
import useGame from "../hooks/useGame"
import { useNavigate } from "react-router-dom"
import plantTypes from "../../static/plantTypes"

interface InventoryProps {
  open: boolean
}

const Inventory = () => {
  const navigate = useNavigate()
  const { game } = useGame()

  useEffect(() => {
    const handleKeyDown = () => {
      navigate(-1)
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const items = Object.entries(game.inventory || {}).filter(([ , count ]) => (count as number) > 0)

  return (
    <div className={`inventory`}>
      <p>Inventory</p>
      {items.length === 0 ? (
        <p>Nothing here yet.</p>
      ) : (
        <ul>
          {items.map(([ plantId, count ]) => {
            const plantType = plantTypes[plantId]

            return (
              <li key={plantId}>
                {plantType?.name ?? plantId}: {count as number}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default Inventory
