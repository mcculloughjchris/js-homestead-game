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
