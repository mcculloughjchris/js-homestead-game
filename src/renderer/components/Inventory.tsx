import { useEffect } from "react"
import useGame from "../hooks/useGame"
import { useNavigate } from "react-router-dom"
import { resolveItemName } from "../../static/items"
import { PLAYER_INVENTORY_ID, getInventory } from "../../static/inventory"

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

  const items = Object.entries(getInventory(game, PLAYER_INVENTORY_ID)).filter(([ , count ]) => (count as number) > 0)

  return (
    <div className={`inventory`}>
      <p>Inventory</p>
      {items.length === 0 ? (
        <p>Nothing here yet.</p>
      ) : (
        <ul>
          {items.map(([ itemId, count ]) => {
            return (
              <li key={itemId}>
                {resolveItemName(itemId)}: {count as number}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default Inventory
