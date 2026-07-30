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
      <table className="debug-table">
        <tbody>
          <tr>
            <th>room</th>
            <td>{game.currentLocation}</td>
          </tr>
          <tr>
            <th>direction</th>
            <td>{game.currentDirection}</td>
          </tr>
        </tbody>
      </table>
    )
  }

  return null
}

export default DebugOverlay
