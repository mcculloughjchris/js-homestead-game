import { useState } from "react"
import { resolveItemName } from "../../static/items"
import { getInventory } from "../../static/inventory"

interface InventoryTransferProps {
  game: any
  setGame: (updater: any) => void
  fromOwnerId: string
  toOwnerId: string
  fromLabel?: string
  toLabel?: string
}

/**
 * Reusable "move items between two inventories" UI - pass any two owner ids
 * (e.g. PLAYER_INVENTORY_ID and a chest/character id) and it lists both
 * sides with a quantity input and a button to move items either direction.
 * Doesn't care what the owners actually are; drop it into whatever screen
 * represents that interaction (a chest, trading with a character, etc).
 */
const InventoryTransfer = ({
  game,
  setGame,
  fromOwnerId,
  toOwnerId,
  fromLabel = fromOwnerId,
  toLabel = toOwnerId
}: InventoryTransferProps) => {
  const [ quantities, setQuantities ] = useState<Record<string, number>>({})

  const fromItems = Object.entries(getInventory(game, fromOwnerId)).filter(([ , count ]) => (count as number) > 0)
  const toItems = Object.entries(getInventory(game, toOwnerId)).filter(([ , count ]) => (count as number) > 0)

  const quantityFor = (ownerId: string, itemId: string, max: number): number => {
    const raw = quantities[`${ownerId}:${itemId}`]

    if (raw === undefined || Number.isNaN(raw)) return 1

    return Math.max(1, Math.min(max, raw))
  }

  const handleQuantityChange = (ownerId: string, itemId: string, value: string) => {
    setQuantities(prev => ({ ...prev, [`${ownerId}:${itemId}`]: Number(value) }))
  }

  const move = async (fromId: string, toId: string, itemId: string, quantity: number) => {
    const result = await window.electron.ipcRenderer.invoke('transfer-item', game, fromId, toId, itemId, quantity)

    if (result) {
      setGame(result)
      setQuantities(prev => ({ ...prev, [`${fromId}:${itemId}`]: 1 }))
    }
  }

  return (
    <div className="inventory-transfer">
      <div className="inventory-transfer-column">
        <h3>{fromLabel}</h3>
        {fromItems.length === 0 ? (
          <p>Nothing here.</p>
        ) : (
          <ul>
            {fromItems.map(([ itemId, count ]) => {
              const max = count as number
              const quantity = quantityFor(fromOwnerId, itemId, max)

              return (
                <li key={itemId}>
                  <span>{resolveItemName(itemId)}: {max}</span>
                  <input
                    type="number"
                    min={1}
                    max={max}
                    value={quantity}
                    onChange={(e) => handleQuantityChange(fromOwnerId, itemId, e.target.value)}
                  />
                  <button onClick={() => move(fromOwnerId, toOwnerId, itemId, quantity)}>
                    Move &rarr;
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <div className="inventory-transfer-column">
        <h3>{toLabel}</h3>
        {toItems.length === 0 ? (
          <p>Nothing here.</p>
        ) : (
          <ul>
            {toItems.map(([ itemId, count ]) => {
              const max = count as number
              const quantity = quantityFor(toOwnerId, itemId, max)

              return (
                <li key={itemId}>
                  <button onClick={() => move(toOwnerId, fromOwnerId, itemId, quantity)}>
                    &larr; Move
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={max}
                    value={quantity}
                    onChange={(e) => handleQuantityChange(toOwnerId, itemId, e.target.value)}
                  />
                  <span>{resolveItemName(itemId)}: {max}</span>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

export default InventoryTransfer
