import { ElementType, useEffect, useState } from "react"
import useGame from "../hooks/useGame"
import { useLocation, useNavigate } from "react-router-dom"
import Overlay from "./Overlay"
import { RoomValue, roomValues } from "../../static/mapData"
import DebugOverlay from "../utils/DebugOverlay"

interface RoomProps {
  facing: "n" | "s" | "e" | "w"
  data?: any
}

const Room = ({ facing, data = null, ...args }: RoomProps) => {
  const { game, loading, setGame } = useGame()

  const navigate = useNavigate()
  const location = useLocation()

  const [ room, setRoom ] = useState<RoomValue>()

  useEffect(() => {
    const [ _id, roomName, direction ] = location.pathname.split("/").filter(x => x !== "")
    setRoom(Object.values(roomValues).find(x => x.path == roomName))
  }, [ location ])

  useEffect(() => {
    console.log('game data changed', game)

    const handleKeyPress = async ({ key }) => {
      const result = await window.electron.ipcRenderer.invoke("keypress", {
        key,
        game
      })

      if (result === undefined) return

      if (result.hasOwnProperty('newLocation')) {
        setGame({
          ...game,
          currentLocation: result.newLocation,
          ...(result.hasOwnProperty('days') ? { days: result.days } : {})
        })
        navigate(`/${game.id}/${result.newLocation}/${game.currentDirection}`)
      } else if (result.hasOwnProperty('newDirection')) {
        setGame({ ...game, currentDirection: result.newDirection })
        navigate(`/${game.id}/${game.currentLocation}/${result.newDirection}`)
      }
    }

    window.addEventListener('keypress', handleKeyPress)

    return () => {
      window.removeEventListener('keypress', handleKeyPress)
    }
  }, [ game ])

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
        <RenderedRoom />
      )
    }
  }

  return (
    <div>
      {game.currentLocation}, {game.currentDirection}
      {renderImage()}
      <Overlay
        currentDirection={facing}
        currentLocation={game.currentLocation}
        days={game.days}
      />
      <DebugOverlay />
    </div>
  )
}

export default Room
