import { useEffect, useState } from "react"
import useAudio from "./useAudio"

const useDoorKnock = () => {
  const { audio, ready } = useAudio()
  const [ intervalState, setIntervalState ] = useState<NodeJS.Timeout>()

  const handleKnockingAudio = () => {
    const n = Math.floor(Math.random() * 4)
    audio.sfx.play(`knock${n}`)
  }

  useEffect(() => {
    const handleDoorKnock = async (data) => {
      const e = new CustomEvent('update-game-data', {
        detail: {
          data: data
        }
      })
      window.dispatchEvent(e)

      const interval = setInterval(handleKnockingAudio, 10000)
      handleKnockingAudio()
      setIntervalState(interval)
    }

    const unsubscribe = window.electron.ipcRenderer.on('door-knock', handleDoorKnock)

    return () => {
      unsubscribe?.()
      clearInterval(intervalState)
    }
  }, [])
}

export default useDoorKnock
