import { useEffect, useState } from "react"

interface DebugOverlayProps {
  game: any
}

const DebugOverlay = ({ game }: DebugOverlayProps) => {
  const [active, setActive] = useState(false)

  useEffect(() => {
    window.enableDebugger = () => {
      setActive(true)
    }

    window.disableDebugger = () => {
      setActive(false)
    }

    window.triggerDoorKnock = () => {
      window.electron.ipcRenderer.invoke('trigger-door-knock', game)
    }
  }, [ game ])

  if (active) {
    return (
      <div className="debugger">
        DEBUGGER
      </div>
    )
  }

  return null
}

export default DebugOverlay
