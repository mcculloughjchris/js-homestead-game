import { ElementType, useMemo, useState } from "react"
import useGame from "../hooks/useGame"
import { useLocation, useNavigate } from "react-router-dom"
import Overlay from "./Overlay"
import { roomValues } from "../../static/mapData"
import DebugOverlay from "../utils/DebugOverlay"
import Toasts from "./Toasts"
import PauseMenu from "./PauseMenu"
import PlayerStats from "./PlayerStats"
import useDoorKnock from "../hooks/useDoorKnock"
import usePlayerInput from "../hooks/usePlayerInput"
import InspectionStatus from "./InspectionStatus"

interface RoomProps {
  facing: "n" | "s" | "e" | "w"
  data?: any
}

export interface RenderedRoomProps {
  game: any
  setGame: (updater: any) => void
}

const Room = ({ facing, data = null, ...args }: RoomProps) => {
  const { game, loading, setGame } = useGame()
  const [ tabKeyDown, setTabKeyDown ] = useState<boolean>(false)

  const { paused } = usePlayerInput(game, setGame)
  const navigate = useNavigate()
  const location = useLocation()
  useDoorKnock()

  const room = useMemo(() => {
    const [ _id, roomName ] = location.pathname.split("/").filter(x => x !== "")
    return Object.values(roomValues).find(x => x.path == roomName)
  }, [ location ])

  if (loading) {
    return (
      <div>loading</div>
    )
  }

  const renderImage = () => {
    if (typeof room?.images[facing] === "string") {
      return (
        <img src={room?.images[facing]} />
      )
    } else {
      const RenderedRoom = room?.images[facing] as ElementType
      return (
        <RenderedRoom
          game={game}
          setGame={setGame}
        />
      )
    }
  }

  // While an inspection is running, the officer (not the player) is what's
  // worth watching - reuse the same minimap/"camera" the player normally
  // drives, just fed the officer's live position instead, and swap out the
  // normal interactive room content for a non-interactive status view so
  // the player can watch but not act.
  if (game.inspection?.active) {
    return (
      <div>
        <InspectionStatus game={game} />
        <Overlay
          currentDirection={game.inspection.currentDirection}
          currentLocation={game.inspection.currentLocation}
          days={game.days}
        />
        <PlayerStats game={game} />
        <Toasts />
        <DebugOverlay />
        <PauseMenu paused={paused} />
      </div>
    )
  }

  return (
    <div>
      {renderImage()}
      <Overlay
        currentDirection={facing}
        currentLocation={game.currentLocation}
        days={game.days}
      />
      <PlayerStats game={game} />
      <Toasts />
      <DebugOverlay />
      <PauseMenu paused={paused} />
    </div>
  )
}

export default Room
