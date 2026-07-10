import { useEffect, useState } from "react"

const useLoadGame = (id: string | undefined) => {
  const [game, setGame] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    const load = async () => {
      setLoading(true)

      const response = await window.electron.ipcRenderer.invoke(
        "load-game",
        id
      )

      setGame(response)
      setLoading(false)
    }

    load()
  }, [id])

  return { game, loading }
}

export default useLoadGame
