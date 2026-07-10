import { createContext, useContext } from "react"
import { useParams, Outlet } from "react-router-dom"
import useLoadGame from "./useLoadGame"

interface GameContextValue {
  game: any
  loading: boolean
}

const GameContext = createContext<GameContextValue | null>(null)

export const GameProvider = () => {
  const { id } = useParams()
  const { game, loading } = useLoadGame(id)

  return (
    <GameContext.Provider value={{ game, loading }}>
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
