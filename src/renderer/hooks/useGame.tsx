import { createContext, useContext, useEffect } from "react"
import { useParams, Outlet, useLocation, useNavigate } from "react-router-dom"
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
  const navigate = useNavigate()

  const handleGameDidSave = (e) => {
    setGame(e.detail.data)
  }

  // Merge rather than replace - senders (e.g. the hunger/thirst listener,
  // door-knock) only include the specific fields they changed, and a stale
  // full replace here could otherwise clobber a concurrent update (like
  // movement) landing via a different channel.
  const handleUpdateGameData = (e) => {
    setGame(prevGame => ({ ...prevGame, ...e.detail.data }))
  }

  const handleElectronUpdateGameData = (data) => {
    setGame(prevGame => ({ ...prevGame, ...data }))
  }

  const handleElectronRedirect = (location) => {
    navigate(location)
  }

  // The player never answered in time - reset just that character's
  // position against whatever state is actually current when this lands
  // (not a stale snapshot from when the knock happened 60s ago), and only
  // if they're still the one at the door (guards against acting on a
  // since-superseded knock).
  const handleDoorKnockTimeout = (characterName: string) => {
    setGame(prevGame => {
      if (prevGame.currentDoor !== characterName) return prevGame

      return {
        ...prevGame,
        currentDoor: undefined,
        characterPositions: prevGame.characterPositions.map((c: any) => (
          c.name === characterName ? { ...c, path: null, direction: null } : c
        ))
      }
    })
  }

  useEffect(() => {
    window.addEventListener('saved', handleGameDidSave)
    window.addEventListener('update-game-data', handleUpdateGameData)
    window.electron.ipcRenderer.on('update-game-data', handleElectronUpdateGameData)
    window.electron.ipcRenderer.on('redirect', handleElectronRedirect)
    window.electron.ipcRenderer.on('door-knock-timeout', handleDoorKnockTimeout)

    return () => {
      window.removeEventListener('saved', handleGameDidSave)
      window.removeEventListener('update-game-data', handleUpdateGameData)
    }
  }, [])

  useEffect(() => {
    const { pathname } = location
    const [ id, room, direction ] = pathname.split("/").filter(s => s !== "")

    setGame(prevGame => ({
      ...prevGame,
      currentLocation: room,
      currentDirection: direction
    }))
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
