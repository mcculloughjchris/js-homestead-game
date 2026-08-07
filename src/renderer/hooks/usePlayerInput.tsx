import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

const usePlayerInput = (game: any, setGame: (updater: any) => void) => {
  const navigate = useNavigate()

  const [ escapeKeyDown, setEscapeKeyDown ] = useState<boolean>(false)
  const [ paused, setPaused ] = useState<boolean>(false)

  useEffect(() => {
    const handleKeyPress = async ({ key }) => {
      if (game.inspection?.active) return // player movement is disabled during an inspection

      const result = await window.electron.ipcRenderer.invoke("keypress", {
        key,
        game
      })

      if (result === undefined) return

      if (result.hasOwnProperty('newLocation')) {
        setGame(prevGame => ({
          ...prevGame,
          currentLocation: result.newLocation,
          ...(result.hasOwnProperty('days') ? { days: result.days } : {})
        }))
        navigate(`/${game.id}/${result.newLocation}/${game.currentDirection}`)
      } else if (result.hasOwnProperty('newDirection')) {
        setGame(prevGame => ({ ...prevGame, currentDirection: result.newDirection }))
        navigate(`/${game.id}/${game.currentLocation}/${result.newDirection}`)
      }
    }

    const handleKeyDown = ({ key }) => {
      if (key.toLowerCase() === 'escape') {
        if (escapeKeyDown === false) {
          setEscapeKeyDown(true)
        }
      }

      if (key.toLowerCase() === 'tab' && !game.inspection?.active) {
        navigate(`/${game.id}/inventory`)
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

  return { paused }
}

export default usePlayerInput
