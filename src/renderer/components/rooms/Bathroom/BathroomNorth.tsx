import { useState } from "react"
import { RenderedRoomProps } from "../../Room"
import InventoryTransfer from "../../InventoryTransfer"
import { PLAYER_INVENTORY_ID } from "../../../../static/inventory"
import { containers } from "../../../../static/containers"

const chest = containers.find(c => c.path === "bathroom" && c.direction === "n")

const BathroomNorth = ({ game, setGame }: RenderedRoomProps) => {
  const [ open, setOpen ] = useState(false)

  if (!chest) return null

  if (open) {
    return (
      <div className="convo">
        <InventoryTransfer
          game={game}
          setGame={setGame}
          fromOwnerId={PLAYER_INVENTORY_ID}
          toOwnerId={chest.id}
          fromLabel="You"
          toLabel={chest.name}
        />
        <button onClick={() => setOpen(false)}>Close</button>
      </div>
    )
  }

  return (
    <div>
      <p>{chest.name}</p>
      <button onClick={() => setOpen(true)}>Open</button>
    </div>
  )
}

export default BathroomNorth
