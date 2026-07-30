import { useEffect } from "react"

const useDoorKnock = () => {
  useEffect(() => {
    const handleDoorKnock = async (data) => {
      const e = new CustomEvent('update-game-data', {
        detail: {
          data: data
        }
      })
      window.dispatchEvent(e)
    }

    const unsubscribe = window.electron.ipcRenderer.on('door-knock', handleDoorKnock)

    return () => {
      unsubscribe?.()
    }
  }, [])
}

export default useDoorKnock
