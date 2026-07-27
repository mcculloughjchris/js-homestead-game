import { ElementType, useEffect, useMemo, useState } from "react"
import useGame from "../hooks/useGame"
import { useLocation, useNavigate } from "react-router-dom"
import Overlay from "./Overlay"
import { roomValues } from "../../static/mapData"
import DebugOverlay from "../utils/DebugOverlay"
import Toasts from "./Toasts"
import PauseMenu from "./PauseMenu"

interface RoomProps {
  facing: "n" | "s" | "e" | "w"
  data?: any
}

export interface RenderedRoomProps {
  game: any
}

const Room = ({ facing, data = null, ...args }: RoomProps) => {
  const { game, loading, setGame } = useGame()

  const navigate = useNavigate()
  const location = useLocation()

  const room = useMemo(() => {
    const [ _id, roomName ] = location.pathname.split("/").filter(x => x !== "")
    return Object.values(roomValues).find(x => x.path == roomName)
  }, [ location ])

  const [ escapeKeyDown, setEscapeKeyDown ] = useState<boolean>(false)
  const [ paused, setPaused ] = useState<boolean>(false)

  useEffect(() => {
    const handleDoorKnock = async (data) => {
      const e = new CustomEvent('update-game-data', {
        detail: {
          data: data
        }
      })
      window.dispatchEvent(e)
    }

    window.electron.ipcRenderer.on('door-knock', handleDoorKnock)
  }, [])

  useEffect(() => {
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

    const handleKeyDown = ({ key }) => {
      if (key.toLowerCase() === 'escape') {
        if (escapeKeyDown === false) {
          setEscapeKeyDown(true)
        }
      }
    }

    const handleKeyUp = ({ key }) => {
      if (key.toLowerCase() === 'escape') {
        if (escapeKeyDown === true) {
          setEscapeKeyDown(false)
          setPaused(!paused)
        }
      }
    }

    window.addEventListener('keypress', handleKeyPress)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keypress', handleKeyPress)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [ game, paused, escapeKeyDown ])

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
      <DebugOverlay
        game={game}
      />
      <Toasts />
      <PauseMenu
        paused={paused}
      />
    </div>
  )
}

export default Room
