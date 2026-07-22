import { createContext, useContext, useEffect } from "react"
import { useParams, Outlet, useLocation } from "react-router-dom"
import useLoadGame from "./useLoadGame"

interface GameContextValue {
  game: any
  loading: boolean
  setGame: (game: any) => void
}

const GameContext = createContext<GameContextValue | null>(null)

export const GameProvider = () => {
  const { id } = useParams()
  const { game, loading, setGame } = useLoadGame(id)

  const location = useLocation()

  const handleGameDidSave = (e) => {
    setGame(e.detail.data)
  }

  const handleUpdateGameData = (e) => {
    setGame(e.detail.data)
  }

  const handleElectronUpdateGameData = (data) => {
    setGame(data)
  }

  useEffect(() => {
    window.addEventListener('saved', handleGameDidSave)
    window.addEventListener('update-game-data', handleUpdateGameData)
    window.electron.ipcRenderer.on('update-game-data', handleElectronUpdateGameData)

    return () => {
      window.removeEventListener('saved', handleGameDidSave)
      window.removeEventListener('update-game-data', handleUpdateGameData)
    }
  }, [])

  useEffect(() => {
    const { pathname } = location
    const [ id, room, direction ] = pathname.split("/").filter(s => s !== "")

    setGame({
      ...game,
      currentLocation: room,
      currentDirection: direction
    })
  }, [ location ])

  return (
    <GameContext.Provider value={{ game, loading, setGame }}>
      <Outlet />
    </GameContext.Provider>
  )
}

const useGame = () => {
  const context = useContext(GameContext)

  if (!context) {
    throw new Error("useGame must be used within a GameProvider")
  }

  return context
}

export default useGame
