import { useEffect, useRef } from "react"
import useAudio from "./useAudio"
import useGame from "./useGame"

const useDoorKnock = () => {
  const { audio } = useAudio()
  const { game } = useGame()
  const intervalRef = useRef<NodeJS.Timeout>()

  const handleKnockingAudio = () => {
    const n = Math.floor(Math.random() * 4)
    const knock = `knock${n > 0 ? n : 1}`
    audio.sfx.play(knock)

    const ev = new CustomEvent('peep-hole-animation', {
      detail: {
        animation: knock
      }
    })

    window.dispatchEvent(ev)
  }

  const stopKnocking = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = undefined
    }
  }

  useEffect(() => {
    const handleDoorKnock = async (data) => {
      const e = new CustomEvent('update-game-data', {
        detail: {
          data: data
        }
      })
      window.dispatchEvent(e)

      stopKnocking() // in case a previous knock episode's interval is somehow still running
      handleKnockingAudio()
      intervalRef.current = setInterval(handleKnockingAudio, 10000)
    }

    const unsubscribe = window.electron.ipcRenderer.on('door-knock', handleDoorKnock)

    return () => {
      unsubscribe?.()
      stopKnocking()
    }
  }, [])

  // Stop the repeating knock sound/animation as soon as either: the player
  // starts actually answering (dialogue open - no more knocking once you're
  // mid-conversation), or no one's at the door anymore, whether because the
  // conversation ended or the 60s answer window timed out (see main.ts's
  // door-knock-timeout).
  useEffect(() => {
    if (!game) return // still loading - nothing to react to yet

    if (game.currentDoor === undefined || game.inConversation) {
      stopKnocking()
    }
  }, [ game?.currentDoor, game?.inConversation ])
}

export default useDoorKnock
