import { useEffect, useState } from "react"
import useGame from "../hooks/useGame"
import { STATS } from "../components/PlayerStats"

const DebugOverlay = () => {
  const { game, setGame } = useGame()
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

    window.addItemToInventory = (itemName: string) => {
      window.electron.ipcRenderer.invoke('trigger-add-item-to-inventory', game, itemName)
    }
  }, [ game ])

  const handleStatChange = (key: string, value: string) => {
    const parsed = Math.max(0, Math.min(100, Number(value) || 0))

    setGame(prevGame => ({ ...prevGame, [key]: parsed }))
  }

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
          {STATS.map(({ key, label }) => {
            return (
              <tr key={key}>
                <th>{label}</th>
                <td>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={game[key] ?? 0}
                    onChange={(e) => handleStatChange(key, e.target.value)}
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    )
  }

  return null
}

export default DebugOverlay
