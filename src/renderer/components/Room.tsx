import { useEffect } from "react"
import useGame from "../hooks/useGame"
import { useLocation, useNavigate } from "react-router-dom"

interface RoomProps {
  facing: "n" | "s" | "e" | "w"
  data?: any
}

const Room = ({ facing, data = null, ...args }: RoomProps) => {
  const { game, loading } = useGame()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const handleKeyPress = async ({ key }) => {
      const result = await window.electron.ipcRenderer.invoke("keypress", {
        key,
        game
      })

      if (result !== undefined) {
        if (result.hasOwnProperty('newDirection')) {
          navigate(`/${game.id}/${game.currentLocation}/${result.newDirection}`)
        }
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

  return (
    <div>{game.currentLocation}, {game.currentDirection}</div>
  )
}

export default Room
